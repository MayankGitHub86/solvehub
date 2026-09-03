const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');
const { requireAuth } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: { message: 'Question ID is required' } });
  }

  try {
    if (req.method === 'GET') {
      // Increment view count in background
      prisma.question.update({
        where: { id },
        data: { views: { increment: 1 } }
      }).catch(() => {});

      const question = await prisma.question.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
              points: true
            }
          },
          tags: {
            include: {
              tag: true
            }
          },
          answers: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  avatar: true,
                  points: true
                }
              },
              comments: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      username: true,
                      avatar: true
                    }
                  }
                },
                orderBy: { createdAt: 'asc' }
              },
              votes: true
            },
            orderBy: [
              { isAccepted: 'desc' },
              { createdAt: 'desc' }
            ]
          },
          votes: true,
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  avatar: true
                }
              }
            },
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (!question) {
        return res.status(404).json({ success: false, error: { message: 'Question not found' } });
      }

      // Calculate vote score for question
      const questionVotes = question.votes.reduce((acc, v) => acc + v.value, 0);

      // Format answers with calculated votes
      const formattedAnswers = question.answers.map(ans => ({
        ...ans,
        votes: ans.votes ? ans.votes.reduce((acc, v) => acc + v.value, 0) : 0
      }));

      const formattedQuestion = {
        ...question,
        votes: questionVotes,
        tags: question.tags.map(t => t.tag ? t.tag.name : t.tagId),
        answers: formattedAnswers
      };

      return res.status(200).json({
        success: true,
        data: formattedQuestion
      });

    } else if (req.method === 'PUT') {
      const auth = requireAuth(req, res);
      if (!auth) return;

      const question = await prisma.question.findUnique({ where: { id } });
      if (!question) {
        return res.status(404).json({ success: false, error: { message: 'Question not found' } });
      }

      if (question.authorId !== auth.userId) {
        return res.status(403).json({ success: false, error: { message: 'Unauthorized' } });
      }

      const { title, content } = req.body || {};
      const preview = content ? content.substring(0, 200) : question.preview;

      const updated = await prisma.question.update({
        where: { id },
        data: {
          title: title ? title.trim() : question.title,
          content: content || question.content,
          preview
        },
        include: {
          author: {
            select: { id: true, name: true, username: true, avatar: true }
          },
          tags: {
            include: { tag: true }
          }
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          ...updated,
          tags: updated.tags.map(t => t.tag.name)
        }
      });

    } else if (req.method === 'DELETE') {
      const auth = requireAuth(req, res);
      if (!auth) return;

      const question = await prisma.question.findUnique({ where: { id } });
      if (!question) {
        return res.status(404).json({ success: false, error: { message: 'Question not found' } });
      }

      if (question.authorId !== auth.userId) {
        return res.status(403).json({ success: false, error: { message: 'Unauthorized' } });
      }

      // Cascade delete related records
      await prisma.$transaction([
        prisma.vote.deleteMany({ where: { answer: { questionId: id } } }),
        prisma.vote.deleteMany({ where: { questionId: id } }),
        prisma.comment.deleteMany({ where: { answer: { questionId: id } } }),
        prisma.comment.deleteMany({ where: { questionId: id } }),
        prisma.savedQuestion.deleteMany({ where: { questionId: id } }),
        prisma.collectionQuestion.deleteMany({ where: { questionId: id } }),
        prisma.answer.deleteMany({ where: { questionId: id } }),
        prisma.questionTag.deleteMany({ where: { questionId: id } }),
        prisma.question.delete({ where: { id } })
      ]);

      return res.status(200).json({
        success: true,
        message: 'Question deleted successfully'
      });

    } else {
      return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
    }

  } catch (error) {
    console.error('Question [id] API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};
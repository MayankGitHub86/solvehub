const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');
const { requireAuth } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  try {
    if (req.method === 'GET') {
      const { page = 1, limit = 20, search, category, sort = 'recent' } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      let where = {};
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (category && category !== 'all') {
        where.tags = {
          some: {
            tag: {
              name: { equals: category, mode: 'insensitive' }
            }
          }
        };
      }

      let orderBy = { createdAt: 'desc' };
      if (sort === 'views') {
        orderBy = { views: 'desc' };
      }

      const [questions, total] = await Promise.all([
        prisma.question.findMany({
          where,
          skip,
          take,
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
            _count: {
              select: {
                answers: true,
                votes: true,
                comments: true
              }
            }
          },
          orderBy
        }),
        prisma.question.count({ where })
      ]);

      const formattedQuestions = await Promise.all(questions.map(async (q) => {
        const voteScore = await prisma.vote.aggregate({
          where: { questionId: q.id },
          _sum: { value: true }
        });

        return {
          id: q.id,
          title: q.title,
          content: q.content,
          preview: q.preview || q.content.substring(0, 200),
          author: q.author,
          tags: q.tags.map(t => t.tag ? t.tag.name : t.tagId),
          votes: voteScore._sum.value || 0,
          answers: q._count.answers,
          views: q.views,
          isSolved: q.isSolved,
          createdAt: q.createdAt,
          updatedAt: q.updatedAt
        };
      }));

      if (sort === 'votes') {
        formattedQuestions.sort((a, b) => b.votes - a.votes);
      }

      return res.status(200).json({
        success: true,
        data: {
          questions: formattedQuestions,
          pagination: {
            page: parseInt(page),
            limit: take,
            total,
            totalPages: Math.ceil(total / take)
          }
        },
        // Also provide direct array in data for legacy frontend calls
        questions: formattedQuestions,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          pages: Math.ceil(total / take)
        }
      });

    } else if (req.method === 'POST') {
      const auth = requireAuth(req, res);
      if (!auth) return;

      const { title, content, tags = [] } = req.body || {};

      if (!title || !content) {
        return res.status(400).json({
          success: false,
          error: { message: 'Title and content are required' }
        });
      }

      const preview = content.substring(0, 200);

      // Create or find tags
      const tagObjects = await Promise.all(
        tags.map(async (tagName) => {
          let tag = await prisma.tag.findUnique({
            where: { name: tagName.toLowerCase().trim() }
          });

          if (!tag) {
            tag = await prisma.tag.create({
              data: { name: tagName.toLowerCase().trim() }
            });
          }

          return tag;
        })
      );

      const question = await prisma.question.create({
        data: {
          title: title.trim(),
          content,
          preview,
          authorId: auth.userId,
          tags: {
            create: tagObjects.map(t => ({
              tagId: t.id
            }))
          }
        },
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
          }
        }
      });

      // Award points to question author (+5 points)
      try {
        await prisma.user.update({
          where: { id: auth.userId },
          data: { points: { increment: 5 } }
        });
      } catch (e) {}

      return res.status(201).json({
        success: true,
        data: {
          ...question,
          tags: question.tags.map(t => t.tag.name),
          votes: 0,
          answers: 0
        }
      });

    } else {
      return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
    }

  } catch (error) {
    console.error('Questions API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};
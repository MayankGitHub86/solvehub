const prisma = require('../../_lib/prisma');
const { handleCors } = require('../../_lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  const { id, page = 1, limit = 20, sort = 'recent' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  try {
    let orderBy = { createdAt: 'desc' };
    if (sort === 'views') {
      orderBy = { views: 'desc' };
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where: { authorId: id },
        skip,
        take,
        orderBy,
        include: {
          author: {
            select: { id: true, name: true, username: true, avatar: true }
          },
          tags: {
            include: { tag: true }
          },
          answers: {
            select: { id: true, isAccepted: true }
          },
          _count: {
            select: { answers: true, comments: true }
          }
        }
      }),
      prisma.question.count({ where: { authorId: id } })
    ]);

    const questionsWithVotes = await Promise.all(
      questions.map(async (q) => {
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
          createdAt: q.createdAt
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        questions: questionsWithVotes,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages: Math.ceil(total / take)
        }
      },
      // Direct array support
      questions: questionsWithVotes
    });

  } catch (error) {
    console.error('User questions API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

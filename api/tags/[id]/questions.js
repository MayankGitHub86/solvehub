const prisma = require('../../_lib/prisma');
const { handleCors } = require('../../_lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  const { id, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  try {
    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where: {
          tags: {
            some: {
              OR: [
                { tagId: id },
                { tag: { name: { equals: id, mode: 'insensitive' } } }
              ]
            }
          }
        },
        skip,
        take,
        include: {
          author: {
            select: { id: true, name: true, username: true, avatar: true }
          },
          tags: {
            include: { tag: true }
          },
          _count: {
            select: { answers: true, votes: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.question.count({
        where: {
          tags: {
            some: {
              OR: [
                { tagId: id },
                { tag: { name: { equals: id, mode: 'insensitive' } } }
              ]
            }
          }
        }
      })
    ]);

    const formatted = await Promise.all(questions.map(async (q) => {
      const voteScore = await prisma.vote.aggregate({
        where: { questionId: q.id },
        _sum: { value: true }
      });

      return {
        id: q.id,
        title: q.title,
        preview: q.preview || q.content.substring(0, 200),
        author: q.author,
        tags: q.tags.map(t => t.tag ? t.tag.name : t.tagId),
        votes: voteScore._sum.value || 0,
        answers: q._count.answers,
        views: q.views,
        isSolved: q.isSolved,
        createdAt: q.createdAt
      };
    }));

    res.status(200).json({
      success: true,
      data: {
        questions: formatted,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages: Math.ceil(total / take)
        }
      },
      questions: formatted
    });

  } catch (error) {
    console.error('Questions by tag API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

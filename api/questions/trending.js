const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  try {
    const { period = 'week' } = req.query;

    let timeThreshold;
    const now = Date.now();
    switch (period) {
      case 'today':
      case 'day':
        timeThreshold = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        timeThreshold = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        timeThreshold = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        timeThreshold = new Date(0);
        break;
      default:
        timeThreshold = new Date(now - 7 * 24 * 60 * 60 * 1000);
    }

    const questions = await prisma.question.findMany({
      take: 10,
      where: {
        createdAt: { gte: timeThreshold }
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
          include: { tag: true }
        },
        _count: {
          select: { answers: true, votes: true }
        }
      },
      orderBy: { views: 'desc' }
    });

    const formattedQuestions = await Promise.all(questions.map(async (q) => {
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
      data: formattedQuestions
    });

  } catch (error) {
    console.error('Trending questions API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};
const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  try {
    const { limit = 10 } = req.query;

    const users = await prisma.user.findMany({
      take: parseInt(limit),
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        points: true,
        _count: {
          select: {
            answers: true,
            questions: true,
            badges: true
          }
        },
        badges: {
          include: {
            badge: true
          }
        }
      },
      orderBy: { points: 'desc' }
    });

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      ...user,
      answers: user._count.answers,
      questions: user._count.questions,
      badgeCount: user._count.badges
    }));

    res.status(200).json({
      success: true,
      data: leaderboard
    });

  } catch (error) {
    console.error('Leaderboard API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};
const prisma = require('../../_lib/prisma');
const { handleCors } = require('../../_lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  const { id } = req.query;

  try {
    const stats = await prisma.user.findUnique({
      where: { id },
      select: {
        points: true,
        _count: {
          select: {
            questions: true,
            answers: true,
            badges: true,
            votes: true,
            savedQuestions: true
          }
        }
      }
    });

    if (!stats) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    res.status(200).json({
      success: true,
      data: {
        points: stats.points,
        questionsAsked: stats._count.questions,
        answersGiven: stats._count.answers,
        savedItems: stats._count.savedQuestions,
        votes: stats._count.votes,
        badges: stats._count.badges
      }
    });

  } catch (error) {
    console.error('User stats API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

const prisma = require('../../../_lib/prisma');
const { handleCors } = require('../../../_lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  const { questionId } = req.query;

  if (!questionId) {
    return res.status(400).json({ success: false, error: { message: 'Question ID is required' } });
  }

  try {
    const answers = await prisma.answer.findMany({
      where: { questionId },
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
      },
      orderBy: [
        { isAccepted: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    const formattedAnswers = answers.map(ans => ({
      ...ans,
      votes: ans.votes ? ans.votes.reduce((acc, v) => acc + v.value, 0) : 0
    }));

    res.status(200).json({
      success: true,
      data: formattedAnswers
    });

  } catch (error) {
    console.error('Get answers by question ID API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

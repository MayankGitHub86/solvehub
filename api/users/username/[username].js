const prisma = require('../../../_lib/prisma');
const { handleCors } = require('../../../_lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ success: false, error: { message: 'Username is required' } });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        username: { equals: username.toLowerCase().trim(), mode: 'insensitive' }
      },
      include: {
        badges: {
          include: { badge: true }
        },
        _count: {
          select: {
            questions: true,
            answers: true,
            votes: true,
            savedQuestions: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });

  } catch (error) {
    console.error('User by username API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

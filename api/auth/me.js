const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');
const { requireAuth } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  try {
    const auth = requireAuth(req, res);
    if (!auth) return;

    // Get user from database
    const userData = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
        bio: true,
        location: true,
        website: true,
        github: true,
        twitter: true,
        linkedin: true,
        points: true,
        isOnline: true,
        createdAt: true
      }
    });

    if (!userData) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    res.status(200).json({
      success: true,
      user: userData,
      data: userData
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};
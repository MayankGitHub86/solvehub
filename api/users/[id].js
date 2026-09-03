const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');
const { requireAuth } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: { message: 'User ID is required' } });
  }

  try {
    if (req.method === 'GET') {
      const user = await prisma.user.findUnique({
        where: { id },
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

      return res.status(200).json({
        success: true,
        data: userWithoutPassword
      });

    } else if (req.method === 'PUT') {
      const auth = requireAuth(req, res);
      if (!auth) return;

      if (auth.userId !== id) {
        return res.status(403).json({ success: false, error: { message: 'Unauthorized' } });
      }

      const { name, bio, avatar } = req.body || {};

      const user = await prisma.user.update({
        where: { id },
        data: {
          name: name ? name.trim() : undefined,
          bio: bio !== undefined ? bio : undefined,
          avatar: avatar || undefined
        },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          avatar: true,
          bio: true,
          points: true
        }
      });

      return res.status(200).json({
        success: true,
        data: user
      });

    } else {
      return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
    }

  } catch (error) {
    console.error('User [id] API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

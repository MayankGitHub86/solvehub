const prisma = require('../../_lib/prisma');
const { handleCors } = require('../../_lib/cors');
const { requireAuth } = require('../../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  const auth = requireAuth(req, res);
  if (!auth) return;

  const { id: userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, error: { message: 'User ID is required' } });
  }

  if (userId === auth.userId) {
    return res.status(400).json({ success: false, error: { message: 'You cannot follow yourself' } });
  }

  try {
    if (req.method === 'POST') {
      const existing = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: auth.userId,
            followingId: userId
          }
        }
      });

      if (existing) {
        return res.status(400).json({ success: false, error: { message: 'Already following this user' } });
      }

      await prisma.follow.create({
        data: {
          followerId: auth.userId,
          followingId: userId
        }
      });

      // Notification
      try {
        const follower = await prisma.user.findUnique({ where: { id: auth.userId }, select: { name: true } });
        await prisma.notification.create({
          data: {
            userId,
            type: 'follow',
            title: 'New Follower',
            message: `${follower?.name || 'Someone'} started following you!`,
            link: `/users/${auth.userId}`,
            metadata: { followerId: auth.userId }
          }
        });
      } catch (e) {}

      return res.status(200).json({ success: true, message: 'User followed successfully' });

    } else if (req.method === 'DELETE') {
      await prisma.follow.deleteMany({
        where: {
          followerId: auth.userId,
          followingId: userId
        }
      });

      return res.status(200).json({ success: true, message: 'User unfollowed successfully' });

    } else {
      return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
    }

  } catch (error) {
    console.error('Follow API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

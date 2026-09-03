const prisma = require('../../../_lib/prisma');
const { handleCors } = require('../../../_lib/cors');
const { requireAuth } = require('../../../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  const auth = requireAuth(req, res);
  if (!auth) return;

  const { id: userId } = req.query;

  try {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: auth.userId,
          followingId: userId
        }
      }
    });

    res.status(200).json({
      success: true,
      data: { isFollowing: !!follow },
      isFollowing: !!follow
    });

  } catch (error) {
    console.error('Follow status API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

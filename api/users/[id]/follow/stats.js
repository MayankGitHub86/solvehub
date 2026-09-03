const prisma = require('../../../_lib/prisma');
const { handleCors } = require('../../../_lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  const { id: userId } = req.query;

  try {
    const [followersCount, followingCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.follow.count({ where: { followerId: userId } })
    ]);

    res.status(200).json({
      success: true,
      data: {
        followers: followersCount,
        following: followingCount
      },
      followers: followersCount,
      following: followingCount
    });

  } catch (error) {
    console.error('Follow stats API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

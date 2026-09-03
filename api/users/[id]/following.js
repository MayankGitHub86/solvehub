const prisma = require('../../_lib/prisma');
const { handleCors } = require('../../_lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  const { id: userId, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  try {
    const [following, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
              bio: true,
              points: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.follow.count({ where: { followerId: userId } })
    ]);

    const formatted = following.map(f => ({
      ...f.following,
      followedAt: f.createdAt
    }));

    res.status(200).json({
      success: true,
      data: {
        following: formatted,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          pages: Math.ceil(total / take)
        }
      },
      following: formatted
    });

  } catch (error) {
    console.error('Following API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

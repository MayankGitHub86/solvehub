const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  try {
    const { page = 1, limit = 20, search, sort = 'points', minPoints } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(minPoints && {
        points: { gte: parseInt(minPoints) }
      })
    };

    const orderBy = sort === 'recent'
      ? { createdAt: 'desc' }
      : { points: 'desc' };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          bio: true,
          points: true,
          isOnline: true,
          createdAt: true,
          _count: {
            select: {
              questions: true,
              answers: true,
              badges: true
            }
          }
        },
        orderBy
      }),
      prisma.user.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages: Math.ceil(total / take)
        }
      },
      // Direct array support for legacy frontend
      users,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    });

  } catch (error) {
    console.error('Users API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};
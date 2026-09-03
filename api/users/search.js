const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(200).json({ success: true, data: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q.trim(), mode: 'insensitive' } },
          { name: { contains: q.trim(), mode: 'insensitive' } }
        ]
      },
      take: 10,
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        points: true
      },
      orderBy: { points: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Search users API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

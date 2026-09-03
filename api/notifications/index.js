const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');
const { requireAuth } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    if (req.method === 'GET') {
      const { page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where: { userId: auth.userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take
        }),
        prisma.notification.count({ where: { userId: auth.userId } }),
        prisma.notification.count({ where: { userId: auth.userId, isRead: false } })
      ]);

      return res.status(200).json({
        success: true,
        data: {
          notifications,
          unreadCount,
          pagination: {
            page: parseInt(page),
            limit: take,
            total,
            pages: Math.ceil(total / take)
          }
        },
        notifications,
        unreadCount
      });

    } else if (req.method === 'DELETE') {
      await prisma.notification.deleteMany({
        where: { userId: auth.userId }
      });

      return res.status(200).json({
        success: true,
        message: 'All notifications deleted successfully'
      });

    } else {
      return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
    }

  } catch (error) {
    console.error('Notifications API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

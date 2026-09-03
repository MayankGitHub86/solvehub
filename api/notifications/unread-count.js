const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');
const { requireAuth } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    const unreadCount = await prisma.notification.count({
      where: { userId: auth.userId, isRead: false }
    });

    res.status(200).json({
      success: true,
      data: { unreadCount },
      unreadCount
    });

  } catch (error) {
    console.error('Unread count API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

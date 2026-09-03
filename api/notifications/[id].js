const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');
const { requireAuth } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  const auth = requireAuth(req, res);
  if (!auth) return;

  const { id } = req.query;

  try {
    const notification = await prisma.notification.findFirst({
      where: { id, userId: auth.userId }
    });

    if (!notification) {
      return res.status(404).json({ success: false, error: { message: 'Notification not found' } });
    }

    await prisma.notification.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

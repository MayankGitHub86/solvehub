const prisma = require('../../../_lib/prisma');
const { handleCors } = require('../../../_lib/cors');
const { requireAuth } = require('../../../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  const { conversationId } = req.query;

  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: auth.userId },
        isRead: false
      },
      data: { isRead: true }
    });

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Mark messages read API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');
const { requireAuth } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    const { avatar } = req.body || {};

    if (!avatar) {
      return res.status(400).json({ success: false, error: { message: 'Avatar data is required' } });
    }

    const updated = await prisma.user.update({
      where: { id: auth.userId },
      data: { avatar },
      select: { id: true, email: true, username: true, name: true, avatar: true, points: true }
    });

    res.status(200).json({
      success: true,
      data: { avatar: updated.avatar },
      avatar: updated.avatar,
      message: 'Avatar updated successfully'
    });

  } catch (error) {
    console.error('Update avatar API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

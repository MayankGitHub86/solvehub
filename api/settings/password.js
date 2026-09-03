const bcrypt = require('bcryptjs');
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
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: { message: 'Current password and new password are required' } });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: { message: 'New password must be at least 6 characters long' } });
    }

    const user = await prisma.user.findUnique({ where: { id: auth.userId } });
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, error: { message: 'Current password is incorrect' } });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: auth.userId },
      data: { password: hashedPassword }
    });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Update password API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

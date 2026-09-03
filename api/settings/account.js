const bcrypt = require('bcryptjs');
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

  try {
    const { password } = req.body || {};

    if (!password) {
      return res.status(400).json({ success: false, error: { message: 'Password is required to delete account' } });
    }

    const user = await prisma.user.findUnique({ where: { id: auth.userId } });
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, error: { message: 'Incorrect password' } });
    }

    await prisma.user.delete({ where: { id: auth.userId } });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

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
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, error: { message: 'Email and password are required' } });
    }

    const user = await prisma.user.findUnique({ where: { id: auth.userId } });
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, error: { message: 'Incorrect password' } });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findFirst({
      where: { email: cleanEmail, id: { not: auth.userId } }
    });

    if (existing) {
      return res.status(400).json({ success: false, error: { message: 'Email is already in use' } });
    }

    const updated = await prisma.user.update({
      where: { id: auth.userId },
      data: { email: cleanEmail },
      select: { id: true, email: true, username: true, name: true, avatar: true, points: true }
    });

    res.status(200).json({
      success: true,
      data: { user: updated },
      user: updated,
      message: 'Email updated successfully'
    });

  } catch (error) {
    console.error('Update email API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

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
    const { name, username, bio, location, website, github, twitter, linkedin } = req.body || {};

    if (username) {
      const existing = await prisma.user.findFirst({
        where: {
          username: username.toLowerCase().trim(),
          id: { not: auth.userId }
        }
      });

      if (existing) {
        return res.status(400).json({ success: false, error: { message: 'Username is already taken' } });
      }
    }

    const updated = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        name: name ? name.trim() : undefined,
        username: username ? username.toLowerCase().trim() : undefined,
        bio: bio !== undefined ? bio : undefined,
        location: location !== undefined ? location : undefined,
        website: website !== undefined ? website : undefined,
        github: github !== undefined ? github : undefined,
        twitter: twitter !== undefined ? twitter : undefined,
        linkedin: linkedin !== undefined ? linkedin : undefined
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
        bio: true,
        location: true,
        website: true,
        github: true,
        twitter: true,
        linkedin: true,
        points: true,
        createdAt: true
      }
    });

    res.status(200).json({
      success: true,
      data: { user: updated },
      user: updated,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

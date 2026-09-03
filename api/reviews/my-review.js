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
    const review = await prisma.review.findUnique({
      where: { userId: auth.userId },
      include: {
        user: {
          select: { id: true, name: true, username: true, avatar: true }
        }
      }
    });

    if (!review) {
      return res.status(404).json({ success: false, error: { message: 'No review found' } });
    }

    res.status(200).json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('My review API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

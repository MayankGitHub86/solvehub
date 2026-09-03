const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');
const { requireAuth } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: { message: 'Review ID is required' } });
  }

  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      return res.status(404).json({ success: false, error: { message: 'Review not found' } });
    }

    if (review.userId !== auth.userId) {
      return res.status(403).json({ success: false, error: { message: 'Unauthorized' } });
    }

    if (req.method === 'PUT') {
      const { rating, text, role } = req.body || {};

      const updated = await prisma.review.update({
        where: { id },
        data: {
          rating: rating ? parseInt(rating) : review.rating,
          text: text ? text.trim() : review.text,
          role: role || review.role
        },
        include: {
          user: {
            select: { id: true, name: true, username: true, avatar: true }
          }
        }
      });

      return res.status(200).json({
        success: true,
        data: updated
      });

    } else if (req.method === 'DELETE') {
      await prisma.review.delete({ where: { id } });

      return res.status(200).json({
        success: true,
        message: 'Review deleted successfully'
      });

    } else {
      return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
    }

  } catch (error) {
    console.error('Review [id] API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

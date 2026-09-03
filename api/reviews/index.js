const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');
const { requireAuth } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  try {
    if (req.method === 'GET') {
      const reviews = await prisma.review.findMany({
        include: {
          user: {
            select: { id: true, name: true, username: true, avatar: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json({
        success: true,
        data: reviews,
        reviews
      });

    } else if (req.method === 'POST') {
      const auth = requireAuth(req, res);
      if (!auth) return;

      const { rating, text, role = 'Student' } = req.body || {};

      if (!rating || !text) {
        return res.status(400).json({ success: false, error: { message: 'Rating and text are required' } });
      }

      const existing = await prisma.review.findUnique({ where: { userId: auth.userId } });
      if (existing) {
        return res.status(400).json({ success: false, error: { message: 'You have already submitted a review' } });
      }

      const review = await prisma.review.create({
        data: {
          userId: auth.userId,
          rating: parseInt(rating),
          text: text.trim(),
          role
        },
        include: {
          user: {
            select: { id: true, name: true, username: true, avatar: true }
          }
        }
      });

      return res.status(201).json({
        success: true,
        data: review
      });

    } else {
      return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
    }

  } catch (error) {
    console.error('Reviews API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

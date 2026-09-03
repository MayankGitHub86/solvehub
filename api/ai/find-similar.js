const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');
const { requireAuth } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  const auth = requireAuth(req, res);
  if (!auth) return;

  const { title = '' } = req.body || {};
  const words = title.split(' ').filter(w => w.length > 3).slice(0, 3);

  try {
    const similar = await prisma.question.findMany({
      where: words.length > 0 ? {
        OR: words.map(w => ({ title: { contains: w, mode: 'insensitive' } }))
      } : {},
      take: 5,
      select: {
        id: true,
        title: true,
        isSolved: true,
        views: true
      }
    });

    res.status(200).json({
      success: true,
      data: similar,
      questions: similar
    });

  } catch (error) {
    console.error('Find similar API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

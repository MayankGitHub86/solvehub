const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  try {
    const { limit = 10 } = req.query;

    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });

    const formatted = tags
      .map(tag => ({
        id: tag.id,
        name: tag.name,
        description: tag.description,
        count: tag._count.questions,
        createdAt: tag.createdAt
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      data: formatted
    });

  } catch (error) {
    console.error('Popular tags API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

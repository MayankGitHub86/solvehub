const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  const { questionId, answerId } = req.query;

  if (!questionId && !answerId) {
    return res.status(400).json({ success: false, error: { message: 'Either questionId or answerId is required' } });
  }

  try {
    const where = questionId ? { questionId } : { answerId };

    const [totalVotes, upvotes, downvotes] = await Promise.all([
      prisma.vote.aggregate({
        where,
        _sum: { value: true }
      }),
      prisma.vote.count({
        where: { ...where, value: 1 }
      }),
      prisma.vote.count({
        where: { ...where, value: -1 }
      })
    ]);

    const stats = {
      score: totalVotes._sum.value || 0,
      upvotes,
      downvotes,
      total: upvotes + downvotes
    };

    res.status(200).json({
      success: true,
      data: stats,
      ...stats
    });

  } catch (error) {
    console.error('Vote stats API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

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

  const { questionId, answerId } = req.query;

  if (!questionId && !answerId) {
    return res.status(400).json({ success: false, error: { message: 'Either questionId or answerId is required' } });
  }

  try {
    const vote = await prisma.vote.findFirst({
      where: {
        userId: auth.userId,
        ...(questionId ? { questionId } : { answerId })
      }
    });

    res.status(200).json({
      success: true,
      data: {
        vote: vote ? vote.value : 0,
        hasVoted: !!vote
      },
      vote: vote ? vote.value : 0,
      hasVoted: !!vote
    });

  } catch (error) {
    console.error('Get user vote API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

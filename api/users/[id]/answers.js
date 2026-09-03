const prisma = require('../../_lib/prisma');
const { handleCors } = require('../../_lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  const { id } = req.query;

  try {
    const answers = await prisma.answer.findMany({
      where: { authorId: id },
      include: {
        question: {
          select: {
            id: true,
            title: true,
            createdAt: true
          }
        },
        votes: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = answers.map(ans => ({
      ...ans,
      votes: ans.votes ? ans.votes.reduce((acc, v) => acc + v.value, 0) : 0
    }));

    res.status(200).json({
      success: true,
      data: formatted
    });

  } catch (error) {
    console.error('User answers API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

const prisma = require('../../_lib/prisma');
const { handleCors } = require('../../_lib/cors');
const { requireAuth } = require('../../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  const auth = requireAuth(req, res);
  if (!auth) return;

  const { id } = req.query;

  try {
    const savedQuestions = await prisma.savedQuestion.findMany({
      where: { userId: id },
      include: {
        question: {
          include: {
            author: {
              select: { id: true, name: true, username: true, avatar: true }
            },
            tags: {
              include: { tag: true }
            },
            _count: {
              select: { answers: true, votes: true, comments: true }
            }
          }
        }
      },
      orderBy: { savedAt: 'desc' }
    });

    const formatted = savedQuestions.map(sq => ({
      ...sq.question,
      savedAt: sq.savedAt,
      tags: sq.question.tags.map(t => t.tag ? t.tag.name : t.tagId)
    }));

    res.status(200).json({
      success: true,
      data: formatted
    });

  } catch (error) {
    console.error('Get saved questions API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

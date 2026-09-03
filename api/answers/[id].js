const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');
const { requireAuth } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: { message: 'Answer ID is required' } });
  }

  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    const answer = await prisma.answer.findUnique({ where: { id } });

    if (!answer) {
      return res.status(404).json({ success: false, error: { message: 'Answer not found' } });
    }

    if (answer.authorId !== auth.userId) {
      return res.status(403).json({ success: false, error: { message: 'Unauthorized' } });
    }

    if (req.method === 'PUT') {
      const { content } = req.body || {};

      if (!content) {
        return res.status(400).json({ success: false, error: { message: 'Content is required' } });
      }

      const updated = await prisma.answer.update({
        where: { id },
        data: { content: content.trim() },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
              points: true
            }
          }
        }
      });

      return res.status(200).json({
        success: true,
        data: updated
      });

    } else if (req.method === 'DELETE') {
      // Cascade delete votes and comments on answer
      await prisma.$transaction([
        prisma.vote.deleteMany({ where: { answerId: id } }),
        prisma.comment.deleteMany({ where: { answerId: id } }),
        prisma.answer.delete({ where: { id } })
      ]);

      return res.status(200).json({
        success: true,
        message: 'Answer deleted successfully'
      });

    } else {
      return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
    }

  } catch (error) {
    console.error('Answer [id] API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

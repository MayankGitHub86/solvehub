const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');
const { requireAuth } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: { message: 'Comment ID is required' } });
  }

  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    const comment = await prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      return res.status(404).json({ success: false, error: { message: 'Comment not found' } });
    }

    if (comment.userId !== auth.userId) {
      return res.status(403).json({ success: false, error: { message: 'Unauthorized' } });
    }

    if (req.method === 'PUT') {
      const { content } = req.body || {};

      if (!content) {
        return res.status(400).json({ success: false, error: { message: 'Content is required' } });
      }

      const updated = await prisma.comment.update({
        where: { id },
        data: { content: content.trim() },
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
      await prisma.comment.delete({ where: { id } });

      return res.status(200).json({
        success: true,
        message: 'Comment deleted successfully'
      });

    } else {
      return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
    }

  } catch (error) {
    console.error('Comment [id] API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

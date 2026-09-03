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

  try {
    const { content, questionId, answerId } = req.body || {};

    if (!content) {
      return res.status(400).json({ success: false, error: { message: 'Content is required' } });
    }

    if (!questionId && !answerId) {
      return res.status(400).json({ success: false, error: { message: 'Either questionId or answerId is required' } });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: auth.userId,
        ...(questionId ? { questionId } : { answerId })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    // Notify owner
    try {
      if (questionId) {
        const q = await prisma.question.findUnique({ where: { id: questionId } });
        if (q && q.authorId !== auth.userId) {
          await prisma.notification.create({
            data: {
              userId: q.authorId,
              type: 'comment',
              title: 'New Comment',
              message: `${comment.user.name} commented on your question`,
              link: `/questions/${questionId}`,
              metadata: { questionId, commentId: comment.id }
            }
          });
        }
      } else if (answerId) {
        const a = await prisma.answer.findUnique({ where: { id: answerId } });
        if (a && a.authorId !== auth.userId) {
          await prisma.notification.create({
            data: {
              userId: a.authorId,
              type: 'comment',
              title: 'New Comment',
              message: `${comment.user.name} commented on your answer`,
              link: `/questions/${a.questionId}`,
              metadata: { answerId, commentId: comment.id }
            }
          });
        }
      }
    } catch (e) {}

    res.status(201).json({
      success: true,
      data: comment
    });

  } catch (error) {
    console.error('Create comment API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

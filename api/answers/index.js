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
    const { content, questionId } = req.body || {};

    if (!content || !questionId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Content and questionId are required' }
      });
    }

    const answer = await prisma.answer.create({
      data: {
        content: content.trim(),
        questionId,
        authorId: auth.userId
      },
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

    // Award points to user (+5 points)
    try {
      await prisma.user.update({
        where: { id: auth.userId },
        data: { points: { increment: 5 } }
      });
    } catch (e) {}

    // Create notification for question author
    try {
      const question = await prisma.question.findUnique({ where: { id: questionId } });
      if (question && question.authorId !== auth.userId) {
        await prisma.notification.create({
          data: {
            userId: question.authorId,
            type: 'answer',
            title: 'New Answer',
            message: `${answer.author.name} answered your question`,
            link: `/questions/${questionId}`,
            metadata: { questionId, answerId: answer.id }
          }
        });
      }
    } catch (e) {}

    res.status(201).json({
      success: true,
      data: answer
    });

  } catch (error) {
    console.error('Create answer API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

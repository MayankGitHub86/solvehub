const prisma = require('../../_lib/prisma');
const { handleCors } = require('../../_lib/cors');
const { requireAuth } = require('../../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: { message: 'Answer ID is required' } });
  }

  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    const answer = await prisma.answer.findUnique({
      where: { id },
      include: { question: true }
    });

    if (!answer) {
      return res.status(404).json({ success: false, error: { message: 'Answer not found' } });
    }

    if (answer.question.authorId !== auth.userId) {
      return res.status(403).json({ success: false, error: { message: 'Only question author can accept answers' } });
    }

    // Unaccept all other answers for this question
    await prisma.answer.updateMany({
      where: { questionId: answer.questionId },
      data: { isAccepted: false }
    });

    // Accept this answer
    const updatedAnswer = await prisma.answer.update({
      where: { id },
      data: { isAccepted: true }
    });

    // Mark question as solved
    await prisma.question.update({
      where: { id: answer.questionId },
      data: {
        isSolved: true,
        acceptedAnswerId: id
      }
    });

    // Award points to answer author (+15 points)
    try {
      await prisma.user.update({
        where: { id: answer.authorId },
        data: { points: { increment: 15 } }
      });
    } catch (e) {}

    // Send notification
    try {
      if (answer.authorId !== auth.userId) {
        await prisma.notification.create({
          data: {
            userId: answer.authorId,
            type: 'answer',
            title: 'Answer Accepted',
            message: 'Your answer was marked as accepted!',
            link: `/questions/${answer.questionId}`,
            metadata: { questionId: answer.questionId, answerId: id }
          }
        });
      }
    } catch (e) {}

    res.status(200).json({
      success: true,
      data: updatedAnswer
    });

  } catch (error) {
    console.error('Accept answer API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

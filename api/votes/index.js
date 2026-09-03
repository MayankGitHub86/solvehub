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
    const { value, questionId, answerId } = req.body || {};

    if (!questionId && !answerId) {
      return res.status(400).json({ success: false, error: { message: 'Either questionId or answerId is required' } });
    }

    if (value !== 1 && value !== -1) {
      return res.status(400).json({ success: false, error: { message: 'Vote value must be 1 or -1' } });
    }

    // Check author to prevent self-voting
    if (questionId) {
      const q = await prisma.question.findUnique({ where: { id: questionId } });
      if (!q) return res.status(404).json({ success: false, error: { message: 'Question not found' } });
      if (q.authorId === auth.userId) {
        return res.status(400).json({ success: false, error: { message: 'Cannot vote on your own question' } });
      }
    }

    if (answerId) {
      const a = await prisma.answer.findUnique({ where: { id: answerId } });
      if (!a) return res.status(404).json({ success: false, error: { message: 'Answer not found' } });
      if (a.authorId === auth.userId) {
        return res.status(400).json({ success: false, error: { message: 'Cannot vote on your own answer' } });
      }
    }

    // Check existing vote
    const existing = await prisma.vote.findFirst({
      where: {
        userId: auth.userId,
        ...(questionId ? { questionId } : { answerId })
      }
    });

    let action;
    let result;

    if (existing) {
      if (existing.value === value) {
        // Toggle off / remove
        await prisma.vote.delete({ where: { id: existing.id } });

        // Decrement author points
        if (questionId) {
          const q = await prisma.question.findUnique({ where: { id: questionId } });
          if (q) await prisma.user.update({ where: { id: q.authorId }, data: { points: { decrement: value * 5 } } }).catch(() => {});
        } else if (answerId) {
          const a = await prisma.answer.findUnique({ where: { id: answerId } });
          if (a) await prisma.user.update({ where: { id: a.authorId }, data: { points: { decrement: value * 5 } } }).catch(() => {});
        }

        action = 'removed';
        result = null;
      } else {
        // Change vote (+1 to -1 or vice versa)
        result = await prisma.vote.update({
          where: { id: existing.id },
          data: { value }
        });

        const pointChange = (value - existing.value) * 5;
        if (questionId) {
          const q = await prisma.question.findUnique({ where: { id: questionId } });
          if (q) await prisma.user.update({ where: { id: q.authorId }, data: { points: { increment: pointChange } } }).catch(() => {});
        } else if (answerId) {
          const a = await prisma.answer.findUnique({ where: { id: answerId } });
          if (a) await prisma.user.update({ where: { id: a.authorId }, data: { points: { increment: pointChange } } }).catch(() => {});
        }

        action = 'updated';
      }
    } else {
      // Create new vote
      result = await prisma.vote.create({
        data: {
          value,
          userId: auth.userId,
          ...(questionId ? { questionId } : { answerId })
        }
      });

      if (questionId) {
        const q = await prisma.question.findUnique({ where: { id: questionId } });
        if (q) {
          await prisma.user.update({ where: { id: q.authorId }, data: { points: { increment: value * 5 } } }).catch(() => {});
          // Notification
          await prisma.notification.create({
            data: {
              userId: q.authorId,
              type: 'vote',
              title: 'New Vote',
              message: `Your question received an ${value === 1 ? 'upvote' : 'downvote'}`,
              link: `/questions/${questionId}`,
              metadata: { questionId, value }
            }
          }).catch(() => {});
        }
      } else if (answerId) {
        const a = await prisma.answer.findUnique({ where: { id: answerId } });
        if (a) {
          await prisma.user.update({ where: { id: a.authorId }, data: { points: { increment: value * 5 } } }).catch(() => {});
          await prisma.notification.create({
            data: {
              userId: a.authorId,
              type: 'vote',
              title: 'New Vote',
              message: `Your answer received an ${value === 1 ? 'upvote' : 'downvote'}`,
              link: `/questions/${a.questionId}`,
              metadata: { answerId, value }
            }
          }).catch(() => {});
        }
      }

      action = 'created';
    }

    const voteCount = await prisma.vote.aggregate({
      where: questionId ? { questionId } : { answerId },
      _sum: { value: true }
    });

    res.status(200).json({
      success: true,
      data: {
        vote: result,
        action,
        totalVotes: voteCount._sum.value || 0
      },
      message: `Vote ${action} successfully`
    });

  } catch (error) {
    console.error('Vote API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

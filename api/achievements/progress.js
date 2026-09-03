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

  try {
    const [user, allBadges, userBadges, questionCount, answerCount] = await Promise.all([
      prisma.user.findUnique({ where: { id: auth.userId } }),
      prisma.badge.findMany(),
      prisma.userBadge.findMany({
        where: { userId: auth.userId },
        include: { badge: true }
      }),
      prisma.question.count({ where: { authorId: auth.userId } }),
      prisma.answer.count({ where: { authorId: auth.userId } })
    ]);

    const earnedBadgeIds = new Set(userBadges.map(ub => ub.badgeId));

    const progress = allBadges.map(badge => {
      const isEarned = earnedBadgeIds.has(badge.id);
      let currentProgress = 0;
      let targetProgress = 1;

      if (badge.name.includes('First Question') || badge.name.includes('Curious Mind')) {
        currentProgress = questionCount;
        targetProgress = 1;
      } else if (badge.name.includes('First Answer') || badge.name.includes('Helper')) {
        currentProgress = answerCount;
        targetProgress = 1;
      } else if (badge.name.includes('Scholar') || badge.name.includes('Master')) {
        currentProgress = user?.points || 0;
        targetProgress = badge.points || 100;
      }

      return {
        badge,
        isEarned,
        progress: isEarned ? 100 : Math.min(100, Math.round((currentProgress / targetProgress) * 100)),
        currentValue: currentProgress,
        targetValue: targetProgress
      };
    });

    res.status(200).json({
      success: true,
      data: progress,
      progress
    });

  } catch (error) {
    console.error('Badge progress API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

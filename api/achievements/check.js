const prisma = require('../../_lib/prisma');
const { handleCors } = require('../../_lib/cors');
const { requireAuth } = require('../../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    const [user, questionCount, answerCount, userBadges] = await Promise.all([
      prisma.user.findUnique({ where: { id: auth.userId } }),
      prisma.question.count({ where: { authorId: auth.userId } }),
      prisma.answer.count({ where: { authorId: auth.userId } }),
      prisma.userBadge.findMany({ where: { userId: auth.userId } })
    ]);

    const existingBadgeIds = new Set(userBadges.map(ub => ub.badgeId));
    const allBadges = await prisma.badge.findMany();
    const newlyEarned = [];

    for (const badge of allBadges) {
      if (existingBadgeIds.has(badge.id)) continue;

      let qualified = false;
      if (badge.name.includes('First Question') && questionCount >= 1) qualified = true;
      if (badge.name.includes('First Answer') && answerCount >= 1) qualified = true;
      if (badge.name.includes('Scholar') && (user?.points || 0) >= 100) qualified = true;

      if (qualified) {
        await prisma.userBadge.create({
          data: {
            userId: auth.userId,
            badgeId: badge.id
          }
        }).catch(() => {});
        newlyEarned.push(badge);
      }
    }

    res.status(200).json({
      success: true,
      earnedBadges: newlyEarned,
      data: { earnedBadges: newlyEarned }
    });

  } catch (error) {
    console.error('Check badges API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

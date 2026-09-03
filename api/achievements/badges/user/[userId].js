const prisma = require('../../../../_lib/prisma');
const { handleCors } = require('../../../../_lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, error: { message: 'User ID is required' } });
  }

  try {
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' }
    });

    const badges = userBadges.map(ub => ({
      ...ub.badge,
      earnedAt: ub.earnedAt
    }));

    res.status(200).json({
      success: true,
      data: badges,
      badges
    });

  } catch (error) {
    console.error('User badges API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

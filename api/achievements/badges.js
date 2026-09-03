const prisma = require('../../_lib/prisma');
const { handleCors } = require('../../_lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  try {
    const badges = await prisma.badge.findMany({
      orderBy: { points: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: badges,
      badges
    });

  } catch (error) {
    console.error('Badges API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

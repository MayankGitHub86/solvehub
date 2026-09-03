const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');
const { requireAuth } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: { message: 'Collection ID is required' } });
  }

  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    const collection = await prisma.collection.findFirst({
      where: { id, userId: auth.userId }
    });

    if (!collection) {
      return res.status(404).json({ success: false, error: { message: 'Collection not found' } });
    }

    if (req.method === 'PUT') {
      const { name, description } = req.body || {};

      const updated = await prisma.collection.update({
        where: { id },
        data: {
          name: name ? name.trim() : collection.name,
          description: description !== undefined ? (description ? description.trim() : null) : collection.description
        },
        include: {
          _count: { select: { questions: true } }
        }
      });

      return res.status(200).json({
        success: true,
        data: updated
      });

    } else if (req.method === 'DELETE') {
      await prisma.collection.delete({ where: { id } });

      return res.status(200).json({
        success: true,
        message: 'Collection deleted successfully'
      });

    } else {
      return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
    }

  } catch (error) {
    console.error('Collection [id] API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

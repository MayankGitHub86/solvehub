const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');
const { requireAuth } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    if (req.method === 'GET') {
      const collections = await prisma.collection.findMany({
        where: { userId: auth.userId },
        include: {
          _count: {
            select: { questions: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json({
        success: true,
        data: collections
      });

    } else if (req.method === 'POST') {
      const { name, description } = req.body || {};

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: { message: 'Collection name is required' } });
      }

      const existing = await prisma.collection.findFirst({
        where: {
          userId: auth.userId,
          name: name.trim()
        }
      });

      if (existing) {
        return res.status(400).json({ success: false, error: { message: 'Collection with this name already exists' } });
      }

      const collection = await prisma.collection.create({
        data: {
          name: name.trim(),
          description: description ? description.trim() : null,
          userId: auth.userId
        },
        include: {
          _count: {
            select: { questions: true }
          }
        }
      });

      return res.status(201).json({
        success: true,
        data: collection
      });

    } else {
      return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
    }

  } catch (error) {
    console.error('Collections API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

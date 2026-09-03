const prisma = require('../../../_lib/prisma');
const { handleCors } = require('../../../_lib/cors');
const { requireAuth } = require('../../../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  const { id, questionId } = req.query;

  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    const collection = await prisma.collection.findFirst({
      where: { id, userId: auth.userId }
    });

    if (!collection) {
      return res.status(404).json({ success: false, error: { message: 'Collection not found' } });
    }

    await prisma.collectionQuestion.deleteMany({
      where: {
        collectionId: id,
        questionId
      }
    });

    res.status(200).json({
      success: true,
      message: 'Question removed from collection successfully'
    });

  } catch (error) {
    console.error('Remove question from collection API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

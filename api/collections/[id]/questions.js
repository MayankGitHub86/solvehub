const prisma = require('../../_lib/prisma');
const { handleCors } = require('../../_lib/cors');
const { requireAuth } = require('../../_lib/auth');

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

    if (req.method === 'GET') {
      const collectionQuestions = await prisma.collectionQuestion.findMany({
        where: { collectionId: id },
        include: {
          question: {
            include: {
              author: {
                select: { id: true, name: true, username: true, avatar: true }
              },
              tags: {
                include: { tag: true }
              },
              _count: {
                select: { answers: true, votes: true, comments: true }
              }
            }
          }
        },
        orderBy: { addedAt: 'desc' }
      });

      const formatted = collectionQuestions.map(cq => ({
        ...cq.question,
        savedAt: cq.addedAt,
        tags: cq.question.tags.map(t => t.tag ? t.tag.name : t.tagId)
      }));

      return res.status(200).json({
        success: true,
        data: formatted
      });

    } else if (req.method === 'POST') {
      const { questionId } = req.body || {};

      if (!questionId) {
        return res.status(400).json({ success: false, error: { message: 'Question ID is required' } });
      }

      const existing = await prisma.collectionQuestion.findUnique({
        where: {
          collectionId_questionId: {
            collectionId: id,
            questionId
          }
        }
      });

      if (existing) {
        return res.status(400).json({ success: false, error: { message: 'Question is already in this collection' } });
      }

      await prisma.collectionQuestion.create({
        data: {
          collectionId: id,
          questionId
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Question added to collection successfully'
      });

    } else {
      return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
    }

  } catch (error) {
    console.error('Collection questions API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

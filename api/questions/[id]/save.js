const prisma = require('../../_lib/prisma');
const { handleCors } = require('../../_lib/cors');
const { requireAuth } = require('../../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  const auth = requireAuth(req, res);
  if (!auth) return;

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: { message: 'Question ID is required' } });
  }

  try {
    if (req.method === 'POST') {
      const existing = await prisma.savedQuestion.findUnique({
        where: {
          userId_questionId: {
            userId: auth.userId,
            questionId: id
          }
        }
      });

      if (existing) {
        return res.status(200).json({
          success: true,
          message: 'Question already saved'
        });
      }

      const savedQuestion = await prisma.savedQuestion.create({
        data: {
          userId: auth.userId,
          questionId: id
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Question saved successfully',
        data: savedQuestion
      });

    } else if (req.method === 'DELETE') {
      const result = await prisma.savedQuestion.deleteMany({
        where: {
          userId: auth.userId,
          questionId: id
        }
      });

      return res.status(200).json({
        success: true,
        message: result.count > 0 ? 'Question unsaved successfully' : 'Question was not saved'
      });

    } else {
      return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
    }

  } catch (error) {
    console.error('Save question API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

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

  const { questionId } = req.query;

  try {
    const question = await prisma.question.findUnique({ where: { id: questionId } });

    if (!question) {
      return res.status(404).json({ success: false, error: { message: 'Question not found' } });
    }

    const suggestion = `Based on your question "${question.title}", here are the recommended debugging steps:\n1. Verify your configuration and environment variables.\n2. Ensure all required parameters are passed correctly in your request.\n3. Check server logs for any unhandled exceptions.`;

    res.status(200).json({
      success: true,
      data: { suggestion },
      suggestion
    });

  } catch (error) {
    console.error('Suggest answer API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

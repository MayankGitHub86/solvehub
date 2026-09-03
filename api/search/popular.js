const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  try {
    const [popularQuestions, popularTags] = await Promise.all([
      prisma.question.findMany({
        orderBy: { views: 'desc' },
        take: 10,
        select: { title: true, views: true }
      }),
      prisma.tag.findMany({
        include: {
          _count: { select: { questions: true } }
        },
        orderBy: {
          questions: { _count: 'desc' }
        },
        take: 10
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        popularQuestions: popularQuestions.map(q => q.title),
        popularTags: popularTags.map(t => ({
          name: t.name,
          count: t._count.questions
        }))
      },
      popularQuestions: popularQuestions.map(q => q.title),
      popularTags: popularTags.map(t => ({
        name: t.name,
        count: t._count.questions
      }))
    });

  } catch (error) {
    console.error('Popular searches API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

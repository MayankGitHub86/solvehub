const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(200).json({ success: true, data: { suggestions: [] }, suggestions: [] });
  }

  try {
    const [questions, tags, users] = await Promise.all([
      prisma.question.findMany({
        where: {
          OR: [
            { title: { contains: q.trim(), mode: 'insensitive' } },
            { preview: { contains: q.trim(), mode: 'insensitive' } }
          ]
        },
        select: { id: true, title: true },
        take: 5
      }),
      prisma.tag.findMany({
        where: {
          name: { contains: q.trim(), mode: 'insensitive' }
        },
        select: { id: true, name: true },
        take: 5
      }),
      prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: q.trim(), mode: 'insensitive' } },
            { name: { contains: q.trim(), mode: 'insensitive' } }
          ]
        },
        select: { id: true, username: true, name: true, avatar: true },
        take: 5
      })
    ]);

    const suggestions = {
      questions: questions.map(item => ({ type: 'question', ...item })),
      tags: tags.map(item => ({ type: 'tag', ...item })),
      users: users.map(item => ({ type: 'user', ...item }))
    };

    res.status(200).json({
      success: true,
      data: { suggestions },
      suggestions
    });

  } catch (error) {
    console.error('Search suggestions API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

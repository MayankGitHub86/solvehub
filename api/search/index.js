const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  try {
    const {
      q,
      tags,
      author,
      status,
      sort = 'recent',
      minVotes,
      maxVotes,
      minAnswers,
      maxAnswers,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const where = {};

    if (q && q.trim()) {
      where.OR = [
        { title: { contains: q.trim(), mode: 'insensitive' } },
        { content: { contains: q.trim(), mode: 'insensitive' } },
        { preview: { contains: q.trim(), mode: 'insensitive' } }
      ];
    }

    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      if (tagArray.length > 0) {
        where.tags = {
          some: {
            tag: {
              name: { in: tagArray, mode: 'insensitive' }
            }
          }
        };
      }
    }

    if (author) {
      where.author = {
        username: { equals: author.trim(), mode: 'insensitive' }
      };
    }

    if (status === 'solved') {
      where.isSolved = true;
    } else if (status === 'unsolved') {
      where.isSolved = false;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    if (minVotes !== undefined || maxVotes !== undefined) {
      where.views = {};
      if (minVotes) where.views.gte = parseInt(minVotes);
      if (maxVotes) where.views.lte = parseInt(maxVotes);
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'views') {
      orderBy = { views: 'desc' };
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip,
        take,
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
        },
        orderBy
      }),
      prisma.question.count({ where })
    ]);

    const formattedQuestions = await Promise.all(questions.map(async (q) => {
      const voteScore = await prisma.vote.aggregate({
        where: { questionId: q.id },
        _sum: { value: true }
      });

      return {
        id: q.id,
        title: q.title,
        preview: q.preview || q.content.substring(0, 200),
        author: q.author,
        tags: q.tags.map(t => t.tag ? t.tag.name : t.tagId),
        votes: voteScore._sum.value || 0,
        answers: q._count.answers,
        views: q.views,
        isSolved: q.isSolved,
        createdAt: q.createdAt
      };
    }));

    if (sort === 'votes') {
      formattedQuestions.sort((a, b) => b.votes - a.votes);
    } else if (sort === 'answers') {
      formattedQuestions.sort((a, b) => b.answers - a.answers);
    }

    let filteredQuestions = formattedQuestions;
    if (minAnswers !== undefined || maxAnswers !== undefined) {
      filteredQuestions = formattedQuestions.filter(q => {
        if (minAnswers !== undefined && q.answers < parseInt(minAnswers)) return false;
        if (maxAnswers !== undefined && q.answers > parseInt(maxAnswers)) return false;
        return true;
      });
    }

    res.status(200).json({
      success: true,
      data: {
        questions: filteredQuestions,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages: Math.ceil(total / take)
        },
        filters: {
          query: q || null,
          tags: tags ? tags.split(',') : [],
          author: author || null,
          status: status || 'all',
          sort: sort || 'recent'
        }
      },
      questions: filteredQuestions
    });

  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

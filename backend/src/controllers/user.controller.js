const prisma = require('../lib/prisma');
const { AppError } = require('../middleware/errorHandler');

const getAllUsers = async (
  req,
  res,
  next
) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { username: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          bio: true,
          points: true,
          isOnline: true,
          _count: {
            select: {
              questions: true,
              answers: true,
              badges: true
            }
          }
        },
        orderBy: { points: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getLeaderboard = async (
  req,
  res,
  next
) => {
  try {
    const { period = 'all' } = req.query;
    
    const users = await prisma.user.findMany({
      take,
      select: {
        id,
        name,
        username,
        avatar,
        points,
        _count: {
          select: {
            answers,
            questions,
            badges
          }
        },
        badges: {
          include: {
            badge
          }
        }
      },
      orderBy: { points: 'desc' }
    });

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      ...user,
      answers: user._count.answers,
      questions: user._count.questions,
      badgeCount: user._count.badges
    }));

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        badges: {
          include: {
            badge
          }
        },
        _count: {
          select: {
            questions,
            answers,
            votes
          }
        }
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const getUserStats = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const stats = await prisma.user.findUnique({
      where: { id },
      select: {
        points,
        _count: {
          select: {
            questions,
            answers,
            badges,
            votes
          }
        }
      }
    });

    if (!stats) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;
    const { name, bio, avatar } = req.body;

    if (req.userId !== id) {
      throw new AppError('Unauthorized', 403);
    }

    const user = await prisma.user.update({
      where: { id },
      data: { name, bio, avatar },
      select: {
        id,
        name,
        username,
        email,
        avatar,
        bio,
        points
      }
    });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getAllUsers,
  getLeaderboard,
  getUserById,
  getUserStats,
  updateUser
};


module.exports = {
  getAllUsers,
  getLeaderboard,
  getUserById,
  getUserStats,
  updateUser
};

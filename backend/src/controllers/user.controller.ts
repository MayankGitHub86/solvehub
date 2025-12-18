import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = search
      ? {
          OR: [
            { name: { contains: String(search), mode: 'insensitive' as const } },
            { username: { contains: String(search), mode: 'insensitive' as const } }
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

export const getLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { period = 'all' } = req.query;
    
    const users = await prisma.user.findMany({
      take: 50,
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        points: true,
        _count: {
          select: {
            answers: true,
            questions: true,
            badges: true
          }
        },
        badges: {
          include: {
            badge: true
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
      data: leaderboard
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        badges: {
          include: {
            badge: true
          }
        },
        _count: {
          select: {
            questions: true,
            answers: true,
            votes: true
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
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

export const getUserStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const stats = await prisma.user.findUnique({
      where: { id },
      select: {
        points: true,
        _count: {
          select: {
            questions: true,
            answers: true,
            badges: true,
            votes: true
          }
        }
      }
    });

    if (!stats) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
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
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        points: true
      }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

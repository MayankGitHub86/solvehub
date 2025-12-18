import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const getAllTags = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { count: 'desc' }
    });

    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    next(error);
  }
};

export const getPopularTags = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tags = await prisma.tag.findMany({
      take: 20,
      orderBy: { count: 'desc' }
    });

    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionsByTag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const questions = await prisma.question.findMany({
      where: {
        tags: {
          some: {
            tagId: id
          }
        }
      },
      skip,
      take: Number(limit),
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        _count: {
          select: {
            answers: true,
            votes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    next(error);
  }
};

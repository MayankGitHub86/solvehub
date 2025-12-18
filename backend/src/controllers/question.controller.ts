import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { notifications } from '../services/notification.service';

export const getAllQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 20, category, search, sort = 'recent' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'votes') orderBy = { votes: { _count: 'desc' } };
    if (sort === 'views') orderBy = { views: 'desc' };

    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { content: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    if (category && category !== 'all') {
      where.tags = {
        some: {
          tag: {
            name: { equals: String(category), mode: 'insensitive' }
          }
        }
      };
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
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
              votes: true,
              comments: true
            }
          }
        },
        orderBy
      }),
      prisma.question.count({ where })
    ]);

    const formattedQuestions = questions.map(q => ({
      id: q.id,
      title: q.title,
      preview: q.preview,
      author: q.author,
      tags: q.tags.map(t => t.tag.name),
      votes: q._count.votes,
      answers: q._count.answers,
      views: q.views,
      isSolved: q.isSolved,
      createdAt: q.createdAt
    }));

    res.json({
      success: true,
      data: {
        questions: formattedQuestions,
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

export const getTrendingQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const questions = await prisma.question.findMany({
      take: 10,
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
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
      orderBy: {
        views: 'desc'
      }
    });

    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            points: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        answers: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                points: true
              }
            },
            _count: {
              select: {
                votes: true
              }
            }
          },
          orderBy: {
            isAccepted: 'desc'
          }
        },
        votes: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!question) {
      throw new AppError('Question not found', 404);
    }

    // Increment view count
    await prisma.question.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, tags } = req.body;
    const userId = req.userId!;

    // Generate preview (first 200 chars)
    const preview = content.substring(0, 200);

    // Create or find tags
    const tagObjects = await Promise.all(
      tags.map(async (tagName: string) => {
        let tag = await prisma.tag.findUnique({
          where: { name: tagName }
        });

        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName }
          });
        }

        return tag;
      })
    );

    // Create question
    const question = await prisma.question.create({
      data: {
        title,
        content,
        preview,
        authorId: userId,
        tags: {
          create: tagObjects.map(tag => ({
            tagId: tag.id
          }))
        }
      },
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
        }
      }
    });

    // Update tag counts
    await Promise.all(
      tagObjects.map(tag =>
        prisma.tag.update({
          where: { id: tag.id },
          data: { count: { increment: 1 } }
        })
      )
    );

    // Notify subscribers about new question
    notifications.notify({
      type: 'question:new',
      message: 'New question posted',
      data: { id: question.id, title: question.title, author: question.author }
    });

    res.status(201).json({
      success: true,
      data: question
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.userId!;

    const question = await prisma.question.findUnique({
      where: { id }
    });

    if (!question) {
      throw new AppError('Question not found', 404);
    }

    if (question.authorId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    const preview = content.substring(0, 200);

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: { title, content, preview },
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
        }
      }
    });

    res.json({
      success: true,
      data: updatedQuestion
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const question = await prisma.question.findUnique({
      where: { id }
    });

    if (!question) {
      throw new AppError('Question not found', 404);
    }

    if (question.authorId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    await prisma.question.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const saveQuestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    await prisma.savedQuestion.create({
      data: {
        userId,
        questionId: id
      }
    });

    res.json({
      success: true,
      message: 'Question saved successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const unsaveQuestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    await prisma.savedQuestion.delete({
      where: {
        userId_questionId: {
          userId,
          questionId: id
        }
      }
    });

    res.json({
      success: true,
      message: 'Question unsaved successfully'
    });
  } catch (error) {
    next(error);
  }
};

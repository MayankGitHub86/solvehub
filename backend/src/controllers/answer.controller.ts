import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { notifications } from '../services/notification.service';

export const getAnswersByQuestionId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { questionId } = req.params;

    const answers = await prisma.answer.findMany({
      where: { questionId },
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
        },
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
      },
      orderBy: [
        { isAccepted: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: answers
    });
  } catch (error) {
    next(error);
  }
};

export const createAnswer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, questionId } = req.body;
    const userId = req.userId!;

    const answer = await prisma.answer.create({
      data: {
        content,
        questionId,
        authorId: userId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            points: true
          }
        }
      }
    });

    // Award points to user
    await prisma.user.update({
      where: { id: userId },
      data: { points: { increment: 10 } }
    });

    // Notify question author about new answer
    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (question) {
      notifications.notify({
        type: 'answer:new',
        message: 'New answer received',
        data: { questionId, answerId: answer.id },
        targetUserId: question.authorId
      });
    }

    res.status(201).json({
      success: true,
      data: answer
    });
  } catch (error) {
    next(error);
  }
};

export const updateAnswer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId!;

    const answer = await prisma.answer.findUnique({
      where: { id }
    });

    if (!answer) {
      throw new AppError('Answer not found', 404);
    }

    if (answer.authorId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    const updatedAnswer = await prisma.answer.update({
      where: { id },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            points: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedAnswer
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAnswer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const answer = await prisma.answer.findUnique({
      where: { id }
    });

    if (!answer) {
      throw new AppError('Answer not found', 404);
    }

    if (answer.authorId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    await prisma.answer.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Answer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const acceptAnswer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const answer = await prisma.answer.findUnique({
      where: { id },
      include: { question: true }
    });

    if (!answer) {
      throw new AppError('Answer not found', 404);
    }

    if (answer.question.authorId !== userId) {
      throw new AppError('Only question author can accept answers', 403);
    }

    // Unaccept all other answers
    await prisma.answer.updateMany({
      where: { questionId: answer.questionId },
      data: { isAccepted: false }
    });

    // Accept this answer
    const updatedAnswer = await prisma.answer.update({
      where: { id },
      data: { isAccepted: true }
    });

    // Mark question as solved
    await prisma.question.update({
      where: { id: answer.questionId },
      data: { isSolved: true }
    });

    // Award points to answer author
    await prisma.user.update({
      where: { id: answer.authorId },
      data: { points: { increment: 25 } }
    });

    // Notify answer author about acceptance
    notifications.notify({
      type: 'answer:accepted',
      message: 'Your answer was accepted',
      data: { answerId: id, questionId: answer.questionId },
      targetUserId: answer.authorId
    });

    res.json({
      success: true,
      data: updatedAnswer
    });
  } catch (error) {
    next(error);
  }
};

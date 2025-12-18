import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { notifications } from '../services/notification.service';

export const createComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, questionId, answerId } = req.body;
    const userId = req.userId!;

    if (!questionId && !answerId) {
      throw new AppError('Either questionId or answerId is required', 400);
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        ...(questionId ? { questionId } : { answerId })
      },
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
    });

    res.status(201).json({
      success: true,
      data: comment
    });

    // Notify owner of question/answer
    if (questionId) {
      const q = await prisma.question.findUnique({ where: { id: questionId } });
      if (q) notifications.notify({ type: 'comment:new', message: 'New comment on your question', data: { questionId }, targetUserId: q.authorId });
    } else if (answerId) {
      const a = await prisma.answer.findUnique({ where: { id: answerId } });
      if (a) notifications.notify({ type: 'comment:new', message: 'New comment on your answer', data: { answerId }, targetUserId: a.authorId });
    }
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId!;

    const comment = await prisma.comment.findUnique({
      where: { id }
    });

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    if (comment.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content },
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
    });

    res.json({
      success: true,
      data: updatedComment
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const comment = await prisma.comment.findUnique({
      where: { id }
    });

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    if (comment.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    await prisma.comment.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

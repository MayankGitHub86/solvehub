const { Request, Response, NextFunction } = require('express');
const { validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { AuthRequest } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const { notifications } = require('../services/notification.service');

const getAnswersByQuestionId = async (
  req,
  res,
  next
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

const createAnswer = async (
  req,
  res,
  next
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, questionId } = req.body;
    const userId = req.userId;

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
      data: { points: { increment: 5 } }
    });

    // Notify question author about new answer
    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (question) {
      notifications.notify({
        type: 'answer',
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

const updateAnswer = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId;

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

const deleteAnswer = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

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

const acceptAnswer = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

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
      data: { points: { increment: 15 } }
    });

    // Notify answer author about acceptance
    notifications.notify({
      type: 'answer',
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

module.exports = {
  getAnswersByQuestionId,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  acceptAnswer
};

const { Request, Response, NextFunction } = require('express');
const { validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { AuthRequest } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const { notifications } = require('../services/notification.service');
const { moderateComment, logModerationAction } = require('../utils/contentModeration');

const createComment = async (
  req,
  res,
  next
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, questionId, answerId } = req.body;
    const userId = req.userId;

    if (!questionId && !answerId) {
      throw new AppError('Either questionId or answerId is required', 400);
    }

    // 🛡️ CONTENT MODERATION - Check for inappropriate content
    const moderationResult = moderateComment(content);
    
    if (!moderationResult.allowed) {
      // Log the moderation action
      logModerationAction(userId, 'comment', moderationResult);
      
      // Return error to user
      return res.status(400).json({
        success: false,
        error: {
          message: moderationResult.reason,
          code: 'CONTENT_MODERATION_FAILED',
          severity: moderationResult.severity
        }
      });
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
      if (q) notifications.notify({ type: 'comment', message: 'New comment on your question', data: { questionId }, targetUserId: q.authorId });
    } else if (answerId) {
      const a = await prisma.answer.findUnique({ where: { id: answerId } });
      if (a) notifications.notify({ type: 'comment', message: 'New comment on your answer', data: { answerId }, targetUserId: a.authorId });
    }

    // Extract and notify mentioned users
    const { extractMentions } = require('../utils/mentions');
    const mentions = extractMentions(content);
    
    if (mentions.length > 0) {
      // Find mentioned users
      const mentionedUsers = await prisma.user.findMany({
        where: {
          username: { in: mentions }
        },
        select: { id: true, username: true }
      });

      // Notify each mentioned user
      for (const mentionedUser of mentionedUsers) {
        if (mentionedUser.id !== userId) { // Don't notify self
          notifications.notify({
            type: 'mention',
            message: `${comment.user.name} mentioned you in a comment`,
            data: { 
              questionId,
              answerId,
              commentId: comment.id,
              mentionedBy: comment.user.name
            },
            targetUserId: mentionedUser.id
          });
        }
      }
    }
  } catch (error) {
    next(error);
  }
};

const updateComment = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId;

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

const deleteComment = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

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

module.exports = {
  createComment,
  updateComment,
  deleteComment
};

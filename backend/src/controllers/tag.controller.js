const { Request, Response, NextFunction } = require('express');
const prisma = require('../lib/prisma');

const getAllTags = async (
  req,
  res,
  next
) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { count: 'desc' }
    });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const getPopularTags = async (
  req,
  res,
  next
) => {
  try {
    const tags = await prisma.tag.findMany({
      take,
      orderBy: { count: 'desc' }
    });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const getQuestionsByTag = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const questions = await prisma.question.findMany({
      where: {
        tags: {
          some: {
            tagId
          }
        }
      },
      skip,
      take: limit,
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
      data
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getAllTags,
  getPopularTags,
  getQuestionsByTag
};

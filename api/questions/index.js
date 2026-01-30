// Vercel Serverless Function for Questions
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Helper function to verify JWT token
function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    return null;
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Get all questions
      const { page = 1, limit = 10, search, category, sort = 'recent' } = req.query;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      let where = {};
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ];
      }
      
      let orderBy = {};
      switch (sort) {
        case 'votes':
          orderBy = { votes: 'desc' };
          break;
        case 'views':
          orderBy = { views: 'desc' };
          break;
        default:
          orderBy = { createdAt: 'desc' };
      }

      const questions = await prisma.question.findMany({
        where,
        orderBy,
        skip,
        take: parseInt(limit),
        include: {
          author: {
            select: { id: true, username: true, name: true, avatar: true, points: true }
          },
          tags: true,
          _count: {
            select: { answers: true, comments: true }
          }
        }
      });

      const total = await prisma.question.count({ where });

      res.status(200).json({
        success: true,
        data: questions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });

    } else if (req.method === 'POST') {
      // Create new question
      const user = verifyToken(req);
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { title, content, tags } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      const question = await prisma.question.create({
        data: {
          title,
          content,
          authorId: user.userId,
          tags: {
            connectOrCreate: tags?.map(tag => ({
              where: { name: tag },
              create: { name: tag }
            })) || []
          }
        },
        include: {
          author: {
            select: { id: true, username: true, name: true, avatar: true, points: true }
          },
          tags: true,
          _count: {
            select: { answers: true, comments: true }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: question
      });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Questions API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
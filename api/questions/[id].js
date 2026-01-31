// Get single question by ID
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

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

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      // Increment view count
      await prisma.question.update({
        where: { id },
        data: { views: { increment: 1 } }
      });

      // Get question with all related data
      const question = await prisma.question.findUnique({
        where: { id },
        include: {
          author: {
            select: { id: true, username: true, name: true, avatar: true, points: true }
          },
          tags: true,
          answers: {
            include: {
              author: {
                select: { id: true, username: true, name: true, avatar: true, points: true }
              },
              comments: {
                include: {
                  author: {
                    select: { id: true, username: true, name: true, avatar: true }
                  }
                },
                orderBy: { createdAt: 'asc' }
              }
            },
            orderBy: [
              { isAccepted: 'desc' },
              { votes: 'desc' },
              { createdAt: 'asc' }
            ]
          },
          comments: {
            include: {
              author: {
                select: { id: true, username: true, name: true, avatar: true }
              }
            },
            orderBy: { createdAt: 'asc' }
          },
          _count: {
            select: { answers: true, comments: true }
          }
        }
      });

      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      res.status(200).json({
        success: true,
        data: question
      });

    } else if (req.method === 'PUT') {
      // Update question
      const user = verifyToken(req);
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { title, content } = req.body;

      const question = await prisma.question.findUnique({
        where: { id }
      });

      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      if (question.authorId !== user.userId) {
        return res.status(403).json({ error: 'Not authorized to edit this question' });
      }

      const updatedQuestion = await prisma.question.update({
        where: { id },
        data: { title, content },
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

      res.status(200).json({
        success: true,
        data: updatedQuestion
      });

    } else if (req.method === 'DELETE') {
      // Delete question
      const user = verifyToken(req);
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const question = await prisma.question.findUnique({
        where: { id }
      });

      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      if (question.authorId !== user.userId) {
        return res.status(403).json({ error: 'Not authorized to delete this question' });
      }

      await prisma.question.delete({
        where: { id }
      });

      res.status(200).json({
        success: true,
        message: 'Question deleted successfully'
      });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Question API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
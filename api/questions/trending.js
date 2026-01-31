// Get trending questions
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { period = 'week' } = req.query;

    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'day':
        dateFilter = {
          createdAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
          }
        };
        break;
      case 'week':
        dateFilter = {
          createdAt: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        };
        break;
      case 'month':
        dateFilter = {
          createdAt: {
            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          }
        };
        break;
      default:
        // All time - no filter
        break;
    }

    const questions = await prisma.question.findMany({
      where: dateFilter,
      orderBy: [
        { votes: 'desc' },
        { views: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 20,
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
      data: questions
    });

  } catch (error) {
    console.error('Trending questions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
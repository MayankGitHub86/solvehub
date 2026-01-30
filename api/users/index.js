// Vercel Serverless Function for Users
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
    const { page = 1, limit = 10, search, sort = 'points' } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let where = {};
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    let orderBy = {};
    switch (sort) {
      case 'reputation':
        orderBy = { reputation: 'desc' };
        break;
      case 'recent':
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { points: 'desc' };
    }

    const users = await prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: parseInt(limit),
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        points: true,
        reputation: true,
        createdAt: true,
        _count: {
          select: {
            questions: true,
            answers: true
          }
        }
      }
    });

    const total = await prisma.user.count({ where });

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Users API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
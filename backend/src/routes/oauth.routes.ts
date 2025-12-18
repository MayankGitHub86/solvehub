import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Google OAuth handler
router.post('/oauth/google', async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: { message: 'No ID token provided' } });
    }

    // In production, verify the token with Google's public key
    // For now, decode it (not secure for production!)
    const decoded = jwt.decode(idToken) as any;

    if (!decoded || !decoded.email) {
      return res.status(401).json({ error: { message: 'Invalid token' } });
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email: decoded.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: decoded.email,
          username: decoded.email.split('@')[0],
          name: decoded.name || decoded.email,
          password: '', // OAuth users don't have password
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Microsoft OAuth handler
router.post('/oauth/microsoft', async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: { message: 'No access token provided' } });
    }

    // Fetch user info from Microsoft Graph API
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Microsoft user info');
    }

    const microsoftUser = await response.json();

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: microsoftUser.userPrincipalName },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: microsoftUser.userPrincipalName,
          username: microsoftUser.mailNickname || microsoftUser.userPrincipalName.split('@')[0],
          name: microsoftUser.displayName,
          password: '',
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// GitHub OAuth callback handler
router.post('/oauth/github', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: { message: 'No authorization code provided' } });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      throw new Error('Failed to get GitHub access token');
    }

    // Fetch user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const githubUser = await userResponse.json();

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: githubUser.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: githubUser.email,
          username: githubUser.login,
          name: githubUser.name,
          password: '',
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
});

export default router;

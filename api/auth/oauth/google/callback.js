const jwt = require('jsonwebtoken');
const prisma = require('../../../_lib/prisma');
const { handleCors } = require('../../../_lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  try {
    const { code, redirectUri } = req.body || {};

    if (!code) {
      return res.status(400).json({ success: false, error: { message: 'Authorization code is required' } });
    }

    const clientId = process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return res.status(400).json({ success: false, error: { message: 'Failed to exchange authorization code' } });
    }

    const tokenData = await tokenResponse.json();

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      return res.status(400).json({ success: false, error: { message: 'Failed to get user information' } });
    }

    const googleUser = await userResponse.json();

    if (!googleUser || !googleUser.email) {
      console.error('Google user info missing email:', googleUser);
      return res.status(400).json({ success: false, error: { message: 'Google account has no email associated with it' } });
    }

    // Find or create user in database
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email.toLowerCase() }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleUser.email.toLowerCase(),
          username: googleUser.email.split('@')[0].toLowerCase() + Math.floor(Math.random() * 1000),
          name: googleUser.name || googleUser.email.split('@')[0],
          avatar: googleUser.picture,
          points: 0,
          password: 'oauth_user_' + Math.random().toString(36),
        }
      });
    } else {
      if (googleUser.picture && user.avatar !== googleUser.picture) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatar: googleUser.picture }
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      token,
      user: userWithoutPassword,
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Google OAuth error stack:', error.stack || error);
    res.status(500).json({ 
      success: false, 
      error: { message: (error.message || 'Internal server error') + ' (Check Vercel Logs)' } 
    });
  }
};
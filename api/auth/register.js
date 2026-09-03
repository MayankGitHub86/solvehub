const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  try {
    const { email, username, name, password } = req.body || {};

    if (!email || !username || !name || !password) {
      return res.status(400).json({ success: false, error: { message: 'All fields are required' } });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { username: cleanUsername }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: {
          message: existingUser.email === cleanEmail 
            ? 'Email already registered' 
            : 'Username already taken'
        }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1e293b&textColor=ffffff`;

    // Create user
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        username: cleanUsername,
        name: name.trim(),
        password: hashedPassword,
        avatar,
        points: 0
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '7d' }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      token,
      user: userWithoutPassword,
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};
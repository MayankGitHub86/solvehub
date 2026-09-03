const { handleCors } = require('./_lib/cors');
const prisma = require('./_lib/prisma');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  try {
    let dbConnected = false;
    let userCount = 0;
    let questionCount = 0;

    try {
      userCount = await prisma.user.count();
      questionCount = await prisma.question.count();
      dbConnected = true;
    } catch (e) {
      console.error('DB test error:', e.message);
    }

    res.status(200).json({
      success: true,
      message: 'SolveHub Serverless API is working on Vercel!',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        userCount,
        questionCount
      },
      envVariables: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        JWT_SECRET: !!process.env.JWT_SECRET,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
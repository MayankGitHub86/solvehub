const { handleCors } = require('./_lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  res.status(200).json({
    success: true,
    message: 'SolveHub API is online',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
};
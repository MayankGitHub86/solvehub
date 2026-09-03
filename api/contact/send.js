const { handleCors } = require('../../_lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  try {
    const { name, email, subject, message } = req.body || {};

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: { message: 'All fields are required' } });
    }

    console.log('Contact form received:', { name, email, subject, message });

    res.status(200).json({
      success: true,
      message: 'Message received! We will get back to you soon.'
    });

  } catch (error) {
    console.error('Contact API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

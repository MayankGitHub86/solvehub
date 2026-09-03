const { handleCors } = require('../../_lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  try {
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({ success: false, error: { message: 'Email is required' } });
    }

    console.log('Newsletter subscription:', email);

    res.status(200).json({
      success: true,
      message: 'Subscribed successfully!'
    });

  } catch (error) {
    console.error('Newsletter API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};

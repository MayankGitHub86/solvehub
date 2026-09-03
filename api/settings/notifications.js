const { handleCors } = require('../_lib/cors');
const { requireAuth } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  const auth = requireAuth(req, res);
  if (!auth) return;

  const {
    emailNotifications = true,
    pushNotifications = true,
    questionAnswered = true,
    commentReplied = true,
    upvoteReceived = true
  } = req.body || {};

  const preferences = {
    emailNotifications,
    pushNotifications,
    questionAnswered,
    commentReplied,
    upvoteReceived
  };

  res.status(200).json({
    success: true,
    data: { preferences },
    preferences,
    message: 'Notification preferences updated successfully'
  });
};

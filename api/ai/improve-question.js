const { handleCors } = require('../_lib/cors');
const { requireAuth } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  const auth = requireAuth(req, res);
  if (!auth) return;

  const { title = '', content = '' } = req.body || {};

  let improvedTitle = title.trim();
  if (improvedTitle && !improvedTitle.endsWith('?')) {
    improvedTitle = `How to resolve: ${improvedTitle}?`;
  }

  res.status(200).json({
    success: true,
    data: {
      title: improvedTitle,
      content: content.trim(),
      suggestions: [
        'Add code snippets demonstrating the problem and expected output.',
        'Mention the runtime environment and library versions you are using.'
      ]
    }
  });
};

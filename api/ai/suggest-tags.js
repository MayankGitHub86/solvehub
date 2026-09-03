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
  const text = `${title} ${content}`.toLowerCase();

  const commonKeywords = [
    'javascript', 'typescript', 'react', 'node.js', 'python', 'mongodb', 
    'prisma', 'css', 'html', 'next.js', 'express', 'sql', 'database', 
    'git', 'api', 'docker', 'tailwind', 'vue', 'angular', 'redux'
  ];

  const suggested = commonKeywords.filter(keyword => text.includes(keyword)).slice(0, 5);
  if (suggested.length === 0) {
    suggested.push('programming', 'help', 'question');
  }

  res.status(200).json({
    success: true,
    data: { tags: suggested },
    tags: suggested
  });
};

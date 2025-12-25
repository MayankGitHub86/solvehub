/**
 * Extract @mentions from text
 * @param {string} text - Text to extract mentions from
 * @returns {string[]} - Array of usernames mentioned (without @)
 */
function extractMentions(text) {
  if (!text) return [];
  
  // Match @username pattern (alphanumeric and underscore)
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]); // Get username without @
  }
  
  // Return unique mentions
  return [...new Set(mentions)];
}

/**
 * Replace @mentions with clickable links in markdown
 * @param {string} text - Text with mentions
 * @returns {string} - Text with mention links
 */
function linkifyMentions(text) {
  if (!text) return text;
  
  // Replace @username with markdown link
  return text.replace(/@(\w+)/g, '[@$1](/users/$1)');
}

module.exports = {
  extractMentions,
  linkifyMentions
};

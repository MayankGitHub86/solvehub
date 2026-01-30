/**
 * Content Moderation Utility
 * Filters inappropriate content, adult material, and spam
 */

// Comprehensive list of inappropriate keywords
const INAPPROPRIATE_KEYWORDS = [
  // Adult content
  'porn', 'xxx', 'sex', 'nude', 'naked', 'nsfw', 'adult', 'explicit',
  'erotic', 'sexual', 'intercourse', 'masturbat', 'orgasm', 'penis', 'vagina',
  'breast', 'boob', 'dick', 'cock', 'pussy', 'ass', 'butt', 'anal',
  
  // Violence
  'kill', 'murder', 'suicide', 'bomb', 'terrorist', 'weapon', 'gun',
  'shoot', 'stab', 'torture', 'abuse',
  
  // Hate speech
  'racist', 'nazi', 'hate', 'discriminat',
  
  // Drugs
  'cocaine', 'heroin', 'meth', 'drug dealer', 'marijuana sale',
  
  // Spam/Scam
  'click here to win', 'free money', 'get rich quick', 'viagra',
  'casino', 'lottery winner', 'nigerian prince'
];

// Suspicious patterns
const SUSPICIOUS_PATTERNS = [
  /\b(sex|porn|xxx)\s*(video|site|link|download)/gi,
  /\b(buy|sell|cheap)\s*(viagra|cialis|drugs)/gi,
  /\b(click|visit)\s*(here|now|link)\s*(to|for)\s*(win|earn|get)/gi,
  /\b(hot|sexy|nude)\s*(girls|boys|women|men|teens)/gi,
  /\b(adult|porn|xxx)\s*(content|material|website)/gi,
  /\b(18\+|21\+|adults?\s*only)/gi,
  /\b(dating|hookup|meet)\s*(singles|girls|women|sex)/gi,
  /(http|https):\/\/[^\s]*\.(xxx|porn|adult|sex)/gi,
  /\b(escort|prostitut|call\s*girl)/gi,
  /\b(rape|molest|pedophil)/gi
];

// URL patterns for suspicious domains
const SUSPICIOUS_DOMAINS = [
  '.xxx', '.adult', '.porn', '.sex', '.dating', '.casino',
  'onlyfans', 'pornhub', 'xvideos', 'xhamster'
];

/**
 * Check if text contains inappropriate content
 * @param {string} text - Text to check
 * @returns {Object} - { isInappropriate: boolean, reason: string, matches: array }
 */
function checkInappropriateContent(text) {
  if (!text || typeof text !== 'string') {
    return { isInappropriate: false, reason: null, matches: [] };
  }

  const lowerText = text.toLowerCase();
  const matches = [];

  // Check for inappropriate keywords
  for (const keyword of INAPPROPRIATE_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\w*\\b`, 'gi');
    if (regex.test(lowerText)) {
      matches.push(keyword);
    }
  }

  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(...match);
    }
  }

  // Check for suspicious domains
  for (const domain of SUSPICIOUS_DOMAINS) {
    if (lowerText.includes(domain)) {
      matches.push(domain);
    }
  }

  // Check for excessive capitalization (spam indicator)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.7 && text.length > 20) {
    matches.push('EXCESSIVE_CAPS');
  }

  // Check for excessive special characters (spam indicator)
  const specialChars = (text.match(/[!@#$%^&*()_+=\[\]{};':"\\|,.<>?]/g) || []).length;
  if (specialChars > text.length * 0.4) {
    matches.push('EXCESSIVE_SPECIAL_CHARS');
  }

  // Check for repeated characters (spam indicator)
  if (/(.)\1{6,}/.test(text)) {
    matches.push('REPEATED_CHARACTERS');
  }

  if (matches.length > 0) {
    return {
      isInappropriate: true,
      reason: 'Content contains inappropriate or suspicious material',
      matches: [...new Set(matches)], // Remove duplicates
      severity: matches.length > 3 ? 'high' : 'medium'
    };
  }

  return { isInappropriate: false, reason: null, matches: [] };
}

/**
 * Moderate question content
 * @param {Object} questionData - Question data with title and content
 * @returns {Object} - Moderation result
 */
function moderateQuestion(questionData) {
  const { title, content } = questionData;
  
  // Check title
  const titleCheck = checkInappropriateContent(title);
  if (titleCheck.isInappropriate) {
    return {
      allowed: false,
      reason: 'Question title contains inappropriate content',
      field: 'title',
      matches: titleCheck.matches,
      severity: titleCheck.severity
    };
  }

  // Check content
  const contentCheck = checkInappropriateContent(content);
  if (contentCheck.isInappropriate) {
    return {
      allowed: false,
      reason: 'Question content contains inappropriate material',
      field: 'content',
      matches: contentCheck.matches,
      severity: contentCheck.severity
    };
  }

  // Check for minimum quality
  if (title.length < 10) {
    return {
      allowed: false,
      reason: 'Question title is too short (minimum 10 characters)',
      field: 'title',
      matches: [],
      severity: 'low'
    };
  }

  if (content.length < 20) {
    return {
      allowed: false,
      reason: 'Question content is too short (minimum 20 characters)',
      field: 'content',
      matches: [],
      severity: 'low'
    };
  }

  return {
    allowed: true,
    reason: null,
    matches: [],
    severity: null
  };
}

/**
 * Moderate answer content
 * @param {string} content - Answer content
 * @returns {Object} - Moderation result
 */
function moderateAnswer(content) {
  const contentCheck = checkInappropriateContent(content);
  
  // Only block if severity is high (multiple violations)
  // Allow medium severity for AI-generated content
  if (contentCheck.isInappropriate && contentCheck.severity === 'high') {
    return {
      allowed: false,
      reason: 'Answer contains inappropriate content',
      matches: contentCheck.matches,
      severity: contentCheck.severity
    };
  }

  if (content.length < 10) {
    return {
      allowed: false,
      reason: 'Answer is too short (minimum 10 characters)',
      matches: [],
      severity: 'low'
    };
  }

  return {
    allowed: true,
    reason: null,
    matches: [],
    severity: null
  };
}

/**
 * Moderate comment content
 * @param {string} content - Comment content
 * @returns {Object} - Moderation result
 */
function moderateComment(content) {
  const contentCheck = checkInappropriateContent(content);
  
  if (contentCheck.isInappropriate) {
    return {
      allowed: false,
      reason: 'Comment contains inappropriate content',
      matches: contentCheck.matches,
      severity: contentCheck.severity
    };
  }

  if (content.length < 2) {
    return {
      allowed: false,
      reason: 'Comment is too short',
      matches: [],
      severity: 'low'
    };
  }

  return {
    allowed: true,
    reason: null,
    matches: [],
    severity: null
  };
}

/**
 * Log moderation action
 * @param {string} userId - User ID
 * @param {string} contentType - Type of content (question, answer, comment)
 * @param {Object} moderationResult - Result from moderation
 */
function logModerationAction(userId, contentType, moderationResult) {
  if (!moderationResult.allowed) {
    console.warn(`🚫 Content blocked - User: ${userId}, Type: ${contentType}, Reason: ${moderationResult.reason}`);
    console.warn(`   Matches: ${moderationResult.matches.join(', ')}`);
    console.warn(`   Severity: ${moderationResult.severity}`);
  }
}

module.exports = {
  checkInappropriateContent,
  moderateQuestion,
  moderateAnswer,
  moderateComment,
  logModerationAction
};

const aiService = require('../services/ai.service');
const prisma = require('../lib/prisma');

class AIController {
  /**
   * Check if AI service is available
   */
  async checkAvailability(req, res) {
    try {
      const isAvailable = aiService.isAvailable();
      res.json({
        available: isAvailable,
        message: isAvailable
          ? 'AI service is available'
          : 'AI service is not configured. Add OPENAI_API_KEY to enable AI features.',
      });
    } catch (error) {
      console.error('Error checking AI availability:', error);
      res.status(500).json({ error: 'Failed to check AI availability' });
    }
  }

  /**
   * Generate answer suggestion for a question
   */
  async suggestAnswer(req, res) {
    try {
      const { questionId } = req.params;

      // Get question details
      const question = await prisma.question.findUnique({
        where: { id: questionId },
      });

      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      const suggestion = await aiService.suggestAnswer(
        question.title,
        question.content
      );

      res.json({
        success: true,
        suggestion,
      });
    } catch (error) {
      console.error('Error suggesting answer:', error);
      
      // Handle OpenAI quota errors gracefully
      if (error.message && error.message.includes('quota')) {
        return res.status(503).json({
          error: 'AI service temporarily unavailable',
          message: 'OpenAI API quota exceeded. Please try again later or contact support.',
          code: 'QUOTA_EXCEEDED'
        });
      }
      
      // Handle rate limit errors
      if (error.status === 429) {
        return res.status(429).json({
          error: 'Too many requests',
          message: 'AI service rate limit reached. Please try again in a few moments.',
          code: 'RATE_LIMIT'
        });
      }
      
      res.status(500).json({
        error: error.message || 'Failed to generate answer suggestion',
      });
    }
  }

  /**
   * Suggest tags for a question
   */
  async suggestTags(req, res) {
    try {
      const { title, content } = req.body;

      if (!title || !content) {
        return res.status(400).json({
          error: 'Title and content are required',
        });
      }

      const tags = await aiService.suggestTags(title, content);

      res.json({
        success: true,
        tags,
      });
    } catch (error) {
      console.error('Error suggesting tags:', error);
      res.status(500).json({
        error: error.message || 'Failed to suggest tags',
      });
    }
  }

  /**
   * Find similar questions
   */
  async findSimilar(req, res) {
    try {
      const { title, content } = req.body;

      if (!title) {
        return res.status(400).json({
          error: 'Title is required',
        });
      }

      // Get recent questions to compare against
      const recentQuestions = await prisma.question.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          preview: true,
        },
      });

      const similarQuestions = await aiService.findSimilarQuestions(
        title,
        content || '',
        recentQuestions
      );

      res.json({
        success: true,
        similar: similarQuestions,
      });
    } catch (error) {
      console.error('Error finding similar questions:', error);
      res.status(500).json({
        error: error.message || 'Failed to find similar questions',
      });
    }
  }

  /**
   * Improve question quality
   */
  async improveQuestion(req, res) {
    try {
      const { title, content } = req.body;

      if (!title || !content) {
        return res.status(400).json({
          error: 'Title and content are required',
        });
      }

      const improved = await aiService.improveQuestion(title, content);

      res.json({
        success: true,
        improved,
      });
    } catch (error) {
      console.error('Error improving question:', error);
      res.status(500).json({
        error: error.message || 'Failed to improve question',
      });
    }
  }
}

module.exports = new AIController();

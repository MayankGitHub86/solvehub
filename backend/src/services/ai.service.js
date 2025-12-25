const OpenAI = require('openai');

class AIService {
  constructor() {
    this.openai = null;
    this.gemini = null;
    this.sambanova = null;
    this.provider = null; // 'openai', 'gemini', or 'sambanova'
    this.isEnabled = false;
    
    // Try SambaNova first (FREE and works!)
    if (process.env.SAMBANOVA_API_KEY && process.env.SAMBANOVA_API_KEY !== 'your-sambanova-key-here') {
      try {
        // SambaNova uses OpenAI-compatible API
        this.sambanova = new OpenAI({
          apiKey: process.env.SAMBANOVA_API_KEY,
          baseURL: 'https://api.sambanova.ai/v1'
        });
        this.provider = 'sambanova';
        this.isEnabled = true;
        console.log('✅ SambaNova AI service initialized (FREE)');
      } catch (error) {
        console.error('❌ Failed to initialize SambaNova:', error.message);
      }
    }
    // Try Gemini second (free tier)
    else if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-key-here') {
      try {
        this.provider = 'gemini';
        this.isEnabled = true;
        console.log('✅ Google Gemini AI service initialized (FREE)');
      } catch (error) {
        console.error('❌ Failed to initialize Gemini:', error.message);
      }
    }
    // Fallback to OpenAI if available
    else if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-proj-your-key-here') {
      try {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        this.provider = 'openai';
        this.isEnabled = true;
        console.log('✅ OpenAI service initialized');
      } catch (error) {
        console.error('❌ Failed to initialize OpenAI:', error.message);
      }
    } else {
      console.log('ℹ️  AI service disabled (no API key provided)');
      console.log('💡 Get free SambaNova API key: https://cloud.sambanova.ai/apis');
    }
  }

  /**
   * Check if AI service is available
   */
  isAvailable() {
    return this.isEnabled;
  }

  /**
   * Call Gemini API
   */
  async callGemini(prompt) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    
    if (!this.gemini) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      // Use gemini-1.5-pro-latest which is available for all API keys
      this.gemini = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-pro-latest',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      });
    }

    try {
      const result = await this.gemini.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      // If model not found, try fallback to gemini-1.5-flash
      if (error.status === 404) {
        console.log('Trying fallback model: gemini-1.5-flash...');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.gemini = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await this.gemini.generateContent(prompt);
        const response = await result.response;
        return response.text();
      }
      throw error;
    }
  }

  /**
   * Generate answer suggestions for a question
   */
  async suggestAnswer(questionTitle, questionContent) {
    if (!this.isAvailable()) {
      throw new Error('AI service is not available. Please configure SAMBANOVA_API_KEY, GEMINI_API_KEY or OPENAI_API_KEY.');
    }

    try {
      const prompt = `You are a helpful programming assistant. A developer has asked the following question:

Title: ${questionTitle}

Details: ${questionContent}

Please provide a helpful, concise answer that:
1. Addresses the specific problem
2. Includes code examples if relevant
3. Explains the solution clearly
4. Suggests best practices

Keep the answer under 500 words and format it in markdown.`;

      if (this.provider === 'sambanova') {
        // SambaNova uses OpenAI-compatible API
        const completion = await this.sambanova.chat.completions.create({
          model: 'Meta-Llama-3.1-8B-Instruct',
          messages: [
            {
              role: 'system',
              content: 'You are an expert programming assistant helping developers solve coding problems. Provide clear, concise, and accurate answers with code examples when appropriate.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        });

        return completion.choices[0].message.content;
      } else if (this.provider === 'gemini') {
        return await this.callGemini(prompt);
      } else {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert programming assistant helping developers solve coding problems. Provide clear, concise, and accurate answers with code examples when appropriate.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        });

        return completion.choices[0].message.content;
      }
    } catch (error) {
      console.error('Error generating answer suggestion:', error);
      throw new Error('Failed to generate answer suggestion');
    }
  }

  /**
   * Auto-tag a question based on its content
   */
  async suggestTags(questionTitle, questionContent) {
    if (!this.isAvailable()) {
      throw new Error('AI service is not available. Please configure GEMINI_API_KEY or OPENAI_API_KEY.');
    }

    try {
      const prompt = `Analyze this programming question and suggest 3-5 relevant tags:

Title: ${questionTitle}

Content: ${questionContent}

Return ONLY a comma-separated list of lowercase tags (e.g., javascript, react, hooks, async, api).
Focus on: programming languages, frameworks, libraries, concepts, and technologies mentioned.`;

      let tagsString;
      
      if (this.provider === 'gemini') {
        tagsString = await this.callGemini(prompt);
      } else {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a tag suggestion system. Analyze questions and return only relevant programming tags as a comma-separated list.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 100,
          temperature: 0.3,
        });
        tagsString = completion.choices[0].message.content.trim();
      }

      const tags = tagsString
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0 && tag.length < 30)
        .slice(0, 5);

      return tags;
    } catch (error) {
      console.error('Error suggesting tags:', error);
      throw new Error('Failed to suggest tags');
    }
  }

  /**
   * Find similar questions based on content
   */
  async findSimilarQuestions(questionTitle, questionContent, existingQuestions) {
    if (!this.isAvailable()) {
      // Fallback to simple keyword matching if AI is not available
      return this.fallbackSimilarQuestions(questionTitle, existingQuestions);
    }

    try {
      const questionsText = existingQuestions
        .map((q, i) => `${i + 1}. ${q.title}`)
        .join('\n');

      const prompt = `Given this new question:
"${questionTitle}"

And these existing questions:
${questionsText}

Which 3 existing questions are most similar? Return only the numbers (e.g., "1, 5, 8").`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a similarity detection system. Find the most similar questions based on topic and intent.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 50,
        temperature: 0.3,
      });

      const response = completion.choices[0].message.content.trim();
      const indices = response
        .split(',')
        .map(n => parseInt(n.trim()) - 1)
        .filter(i => !isNaN(i) && i >= 0 && i < existingQuestions.length)
        .slice(0, 3);

      return indices.map(i => existingQuestions[i]);
    } catch (error) {
      console.error('Error finding similar questions:', error);
      return this.fallbackSimilarQuestions(questionTitle, existingQuestions);
    }
  }

  /**
   * Fallback method for finding similar questions without AI
   */
  fallbackSimilarQuestions(questionTitle, existingQuestions) {
    const keywords = questionTitle
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3);

    const scored = existingQuestions.map(q => {
      const qTitle = q.title.toLowerCase();
      const score = keywords.reduce((acc, keyword) => {
        return acc + (qTitle.includes(keyword) ? 1 : 0);
      }, 0);
      return { question: q, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.question);
  }

  /**
   * Improve question quality
   */
  async improveQuestion(questionTitle, questionContent) {
    if (!this.isAvailable()) {
      throw new Error('AI service is not available. Please configure OPENAI_API_KEY.');
    }

    try {
      const prompt = `Improve this programming question to make it clearer and more likely to get good answers:

Title: ${questionTitle}

Content: ${questionContent}

Provide:
1. An improved title (clear, specific, searchable)
2. An improved content (well-structured, includes context, specific problem)

Format as JSON: {"title": "...", "content": "..."}`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a question improvement assistant. Help developers write better questions that are clear, specific, and likely to get helpful answers.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const response = completion.choices[0].message.content.trim();
      // Try to parse JSON, fallback to original if fails
      try {
        const improved = JSON.parse(response);
        return improved;
      } catch {
        return { title: questionTitle, content: questionContent };
      }
    } catch (error) {
      console.error('Error improving question:', error);
      throw new Error('Failed to improve question');
    }
  }
}

module.exports = new AIService();

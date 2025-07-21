const OpenAI = require('openai');

class AIProvider {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'openai';
    this.model = process.env.AI_MODEL || 'gpt-4o-mini';
    this.maxRequests = parseInt(process.env.AI_MAX_REQUESTS_PER_MINUTE) || 10;
    this.timeout = parseInt(process.env.AI_TIMEOUT_MS) || 30000;
    
    this.requestCount = 0;
    this.resetTime = Date.now() + 60000;
    
    this.initializeClient();
  }

  initializeClient() {
    if (this.provider === 'none') {
      console.log('AI provider disabled');
      return;
    }

    switch (this.provider) {
      case 'openai':
        if (!process.env.OPENAI_API_KEY) {
          console.warn('OPENAI_API_KEY not found - AI features disabled');
          this.provider = 'none';
          return;
        }
        this.client = new OpenAI({ 
          apiKey: process.env.OPENAI_API_KEY,
          timeout: this.timeout
        });
        break;
        
      case 'groq':
        // Groq uses OpenAI-compatible API
        if (!process.env.GROQ_API_KEY) {
          console.warn('GROQ_API_KEY not found - falling back to OpenAI');
          this.provider = 'openai';
          this.initializeClient();
          return;
        }
        this.client = new OpenAI({
          apiKey: process.env.GROQ_API_KEY,
          baseURL: 'https://api.groq.com/openai/v1',
          timeout: this.timeout
        });
        break;
        
      case 'anthropic':
        console.warn('Anthropic integration not implemented yet - falling back to OpenAI');
        this.provider = 'openai';
        this.initializeClient();
        break;
        
      case 'ollama':
        console.warn('Ollama integration not implemented yet - falling back to OpenAI');
        this.provider = 'openai';
        this.initializeClient();
        break;
        
      default:
        console.warn(`Unknown AI provider: ${this.provider} - AI features disabled`);
        this.provider = 'none';
    }
  }

  isRateLimited() {
    const now = Date.now();
    if (now > this.resetTime) {
      this.requestCount = 0;
      this.resetTime = now + 60000;
    }
    return this.requestCount >= this.maxRequests;
  }

  async classifyFile(frontMatter, bodyPreview, categories) {
    if (this.provider === 'none') {
      return {
        category: 'default',
        confidence: 0,
        reasoning: 'AI classification disabled'
      };
    }

    if (this.isRateLimited()) {
      console.warn('AI rate limit exceeded, using fallback classification');
      return {
        category: 'default',
        confidence: 0,
        reasoning: 'Rate limit exceeded'
      };
    }

    try {
      this.requestCount++;
      
      const categoryOptions = Object.entries(categories)
        .map(([id, cat]) => `${id}: ${cat.name} - ${cat.description}`)
        .join('\n');

      const prompt = `Classify this file based on its content. Choose ONE category ID.

Available categories:
${categoryOptions}

File front matter: ${JSON.stringify(frontMatter)}
Content preview: ${bodyPreview.substring(0, 500)}

Respond with just the category ID (e.g., "blog_idea").`;

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
        temperature: 0.1
      });

      const categoryId = response.choices[0].message.content.trim().toLowerCase();
      
      return {
        category: categories[categoryId] ? categoryId : 'default',
        confidence: categories[categoryId] ? 0.8 : 0.1,
        reasoning: `AI classified as: ${categoryId}`,
        model: this.model,
        provider: this.provider
      };

    } catch (error) {
      console.error('AI classification error:', error.message);
      return {
        category: 'default',
        confidence: 0,
        reasoning: `AI error: ${error.message}`
      };
    }
  }

  async generateTags(content) {
    if (this.provider === 'none' || this.isRateLimited()) {
      return [];
    }

    try {
      this.requestCount++;
      
      const prompt = `Generate 3-5 relevant tags for this content. Return as comma-separated values.

Content: ${content.substring(0, 1000)}

Tags:`;

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
        temperature: 0.3
      });

      const tags = response.choices[0].message.content
        .trim()
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);

      return tags.slice(0, 5); // Limit to 5 tags

    } catch (error) {
      console.error('AI tag generation error:', error.message);
      return [];
    }
  }

  getStatus() {
    return {
      provider: this.provider,
      model: this.model,
      enabled: this.provider !== 'none',
      requestsRemaining: Math.max(0, this.maxRequests - this.requestCount),
      resetTime: this.resetTime
    };
  }
}

module.exports = AIProvider; 
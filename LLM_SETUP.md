# 🤖 LLM Setup Guide

## 🔑 Environment Configuration

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Add your API key:**
   ```bash
   # For OpenAI
   OPENAI_API_KEY=sk-your-key-here
   
   # For Groq (free alternative)
   GROQ_API_KEY=gsk_your-key-here
   AI_PROVIDER=groq
   ```

## 💰 **Economical Model Options** (Ranked by Cost)

### 🥇 **Most Economical - Groq**
- **Provider:** `groq`
- **Model:** `llama3-8b-8192` or `mixtral-8x7b-32768`
- **Cost:** FREE with rate limits
- **Setup:** Get free API key at [console.groq.com](https://console.groq.com)
- **Best for:** High volume usage, experimentation

```bash
AI_PROVIDER=groq
AI_MODEL=llama3-8b-8192
GROQ_API_KEY=gsk_your-key-here
```

### 🥈 **Very Economical - OpenAI GPT-4o-mini**
- **Provider:** `openai`
- **Model:** `gpt-4o-mini`
- **Cost:** ~$0.15/million input tokens, $0.60/million output tokens
- **Best for:** High accuracy, reliable classification

```bash
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
OPENAI_API_KEY=sk-your-key-here
```

### 🥉 **Budget Option - OpenAI GPT-3.5-turbo**
- **Provider:** `openai`
- **Model:** `gpt-3.5-turbo`
- **Cost:** ~$0.50/million input tokens, $1.50/million output tokens
- **Best for:** Fallback option

### 🚀 **Free Option - Disable AI**
```bash
AI_PROVIDER=none
```

## 📊 **Rate Limiting & Cost Control**

```bash
# Limit requests per minute (default: 10)
AI_MAX_REQUESTS_PER_MINUTE=5

# Timeout for AI requests (default: 30000ms)
AI_TIMEOUT_MS=15000
```

## 🔧 **Provider Setup Instructions**

### Groq Setup (Recommended - FREE)
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for free account
3. Generate API key
4. Set in `.env`:
   ```bash
   AI_PROVIDER=groq
   AI_MODEL=llama3-8b-8192
   GROQ_API_KEY=gsk_your-key-here
   ```

### OpenAI Setup
1. Visit [platform.openai.com](https://platform.openai.com/api-keys)
2. Create API key
3. Add credit to account ($5 minimum)
4. Set in `.env`:
   ```bash
   AI_PROVIDER=openai
   AI_MODEL=gpt-4o-mini
   OPENAI_API_KEY=sk-your-key-here
   ```

## 💡 **Cost Optimization Tips**

1. **Use Groq for development** - It's free!
2. **Set conservative rate limits** - Prevent unexpected charges
3. **Use shorter prompts** - Input tokens cost money
4. **Cache results** - Don't re-classify the same content
5. **Disable AI for testing** - Set `AI_PROVIDER=none`

## 🎯 **Expected Usage & Costs**

### For 100 files/day with GPT-4o-mini:
- **Input:** ~500 tokens/file = 50K tokens/day
- **Output:** ~20 tokens/file = 2K tokens/day
- **Daily cost:** ~$0.01
- **Monthly cost:** ~$0.30

### For 100 files/day with Groq:
- **Cost:** FREE (within rate limits)
- **Rate limit:** Usually 30 requests/minute

## 🔍 **Testing Your Setup**

After configuration, the AI status is available at:
```
GET /api/ai/status
```

Example response:
```json
{
  "provider": "groq",
  "model": "llama3-8b-8192",
  "enabled": true,
  "requestsRemaining": 8,
  "resetTime": 1703123456789
}
```

## 🚨 **Troubleshooting**

**AI not working?**
1. Check your `.env` file exists and has the right keys
2. Verify API key is valid
3. Check rate limits haven't been exceeded
4. Look at server logs for error messages

**Costs too high?**
1. Switch to Groq: `AI_PROVIDER=groq`
2. Lower rate limit: `AI_MAX_REQUESTS_PER_MINUTE=3`
3. Disable temporarily: `AI_PROVIDER=none` 
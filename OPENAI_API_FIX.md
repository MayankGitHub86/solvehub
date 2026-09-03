# 🔧 OpenAI API Quota Error - Fix Guide

## 🔴 Error: "You exceeded your current quota"

This error occurs when your OpenAI API key has run out of credits or exceeded its usage limit.

---

## ✅ Solutions

### **Option 1: Add Credits to OpenAI Account** (Recommended)

1. **Go to OpenAI Platform**
   - Visit: https://platform.openai.com/account/billing

2. **Add Payment Method**
   - Click "Add payment method"
   - Enter your credit card details

3. **Add Credits**
   - Click "Add to credit balance"
   - Add at least $5-10 for testing
   - Or set up auto-recharge

4. **Wait 1-2 minutes**
   - Credits take a moment to activate

5. **Test the feature**
   - Try the AI Answer Suggestion again

---

### **Option 2: Get a New API Key**

1. **Go to API Keys page**
   - Visit: https://platform.openai.com/api-keys

2. **Create new key**
   - Click "Create new secret key"
   - Name it (e.g., "SolveHub Dev")
   - Copy the key (starts with `sk-proj-...`)

3. **Update backend .env**
   ```env
   OPENAI_API_KEY=sk-proj-YOUR_NEW_KEY_HERE
   ```

4. **Restart backend**
   ```bash
   # Stop the backend (Ctrl+C)
   # Then restart:
   cd backend
   npm start
   ```

---

### **Option 3: Use Free Trial** (New Accounts Only)

If you haven't used OpenAI before:

1. **Create new OpenAI account**
   - Visit: https://platform.openai.com/signup
   - Use a different email

2. **Get free trial credits**
   - New accounts get $5 free credits
   - Valid for 3 months

3. **Create API key**
   - Go to: https://platform.openai.com/api-keys
   - Create new key

4. **Update .env and restart**

---

### **Option 4: Disable AI Features** (Temporary Fix)

If you don't want to add credits right now:

1. **Remove or comment out OPENAI_API_KEY**
   ```env
   # OPENAI_API_KEY=sk-proj-...
   ```

2. **Restart backend**
   ```bash
   cd backend
   npm start
   ```

3. **AI features will be hidden**
   - AI Answer Suggestion won't show
   - Auto-tagging won't work
   - Similar questions won't use AI
   - Question improvement won't work

4. **Platform still works**
   - All other features work normally
   - No errors will show

---

## 📊 OpenAI Pricing

### GPT-3.5-turbo (Used by SolveHub):
- **Input**: $0.50 per 1M tokens (~750K words)
- **Output**: $1.50 per 1M tokens (~750K words)

### Typical Usage:
- **1 AI Answer**: ~500 tokens = $0.001 (0.1 cents)
- **100 AI Answers**: ~50K tokens = $0.10 (10 cents)
- **1000 AI Answers**: ~500K tokens = $1.00 (1 dollar)

### Recommendation:
- **$5**: Good for 5,000+ AI suggestions
- **$10**: Good for 10,000+ AI suggestions
- **$20**: Good for 20,000+ AI suggestions

---

## 🔍 Check Your Usage

1. **Go to Usage page**
   - Visit: https://platform.openai.com/usage

2. **View current usage**
   - See how many tokens used
   - See cost breakdown
   - See remaining credits

3. **Set usage limits**
   - Click "Limits"
   - Set monthly budget
   - Get email alerts

---

## 🛡️ Prevent Future Quota Issues

### 1. Set Usage Limits
```
Platform → Settings → Limits
- Set monthly budget: $10
- Set email alerts: 80% usage
```

### 2. Enable Auto-Recharge
```
Platform → Billing → Auto-recharge
- Enable auto-recharge
- Set threshold: $5
- Set recharge amount: $10
```

### 3. Monitor Usage
- Check usage weekly
- Set up email alerts
- Review API logs

### 4. Optimize API Calls
- Cache AI responses
- Limit requests per user
- Add rate limiting

---

## 🔧 Backend Changes Made

### Better Error Handling:
```javascript
// Now returns user-friendly errors:
{
  error: 'AI service temporarily unavailable',
  message: 'OpenAI API quota exceeded. Please try again later.',
  code: 'QUOTA_EXCEEDED'
}
```

### Frontend Updates:
- Shows specific error messages
- Hides AI features when unavailable
- Graceful degradation

---

## 🧪 Test AI Features

### 1. Check Availability:
```bash
curl http://localhost:3001/api/ai/availability
```

**Expected Response:**
```json
{
  "available": true,
  "message": "AI service is available"
}
```

### 2. Test Answer Suggestion:
```bash
curl http://localhost:3001/api/ai/suggest-answer/QUESTION_ID
```

**If quota exceeded:**
```json
{
  "error": "AI service temporarily unavailable",
  "message": "OpenAI API quota exceeded...",
  "code": "QUOTA_EXCEEDED"
}
```

---

## 📝 Current Status

### Your API Key:
```
your_openai_api_key_here
```

### Issue:
- ❌ Quota exceeded
- ❌ No remaining credits
- ❌ AI features unavailable

### Solution:
1. Add credits to OpenAI account
2. Or get new API key with credits
3. Or disable AI features temporarily

---

## 🎯 Quick Fix Steps

**If you want AI features:**
1. Go to https://platform.openai.com/account/billing
2. Add $5-10 credits
3. Wait 1-2 minutes
4. Try AI feature again

**If you don't need AI features:**
1. Comment out `OPENAI_API_KEY` in backend `.env`
2. Restart backend: `npm start`
3. Platform works without AI

---

## 💡 Alternative: Use Different AI Provider

### Options:
1. **Anthropic Claude** - Similar pricing
2. **Google Gemini** - Free tier available
3. **Cohere** - Free tier available
4. **Hugging Face** - Free models available

### To Switch:
1. Get API key from alternative provider
2. Update `backend/src/services/ai.service.js`
3. Change API calls to new provider
4. Update `.env` with new key

---

## 📞 Need Help?

### OpenAI Support:
- Email: support@openai.com
- Help Center: https://help.openai.com

### Check Status:
- Status Page: https://status.openai.com
- API Status: https://status.openai.com/api

---

## ✅ Verification

After adding credits:

1. **Check availability**
   ```bash
   curl http://localhost:3001/api/ai/availability
   ```

2. **Test in browser**
   - Go to any question
   - Click "Generate AI Suggestion"
   - Should work without errors

3. **Check backend logs**
   - Should see: `POST /api/ai/suggest-answer/... 200`
   - No error messages

---

**Status**: 🔧 Quota Exceeded  
**Fix Time**: 5-10 minutes  
**Cost**: $5-10 (one-time)  
**Alternative**: Disable AI features (free)

---

*Last Updated: December 24, 2025*


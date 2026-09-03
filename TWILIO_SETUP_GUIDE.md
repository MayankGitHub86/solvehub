# 📱 Twilio SMS Setup Guide

## 🎯 Quick Setup (5 Minutes)

### Step 1: Create Twilio Account
1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free account
3. Verify your email and phone number

### Step 2: Get Your Credentials

#### A. Account SID & Auth Token
1. Go to https://console.twilio.com/
2. You'll see your dashboard with:
   - **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token**: Click "Show" to reveal

#### B. Get a Phone Number
1. In the Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a number**
2. For **Trial Account**:
   - You get 1 free US phone number (+1)
   - Can send SMS to verified numbers only
   - Each SMS shows "Sent from your Twilio trial account"
3. For **Paid Account** ($20 minimum):
   - Can send to any number
   - No trial message
   - Better for production

### Step 3: Add to Your Project

#### Update `.env` file
```env
# Twilio Configuration (for SMS OTP)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

#### Restart Backend
```bash
# Stop current backend (Ctrl+C or stop process)
cd lumina-share/backend
npm run dev
```

### Step 4: Test It!

#### For Trial Account
1. Add your phone number to Twilio's verified numbers:
   - Go to **Phone Numbers** → **Manage** → **Verified Caller IDs**
   - Add your phone number
   - Verify with code sent to your phone

2. Test the flow:
   - Go to http://localhost:8080/forgot-password
   - Enter your verified phone number
   - You should receive SMS with OTP!

#### For Development (Without Twilio)
- OTP will be logged to backend console
- Check terminal running backend for OTP code
- No SMS costs during development

## 💰 Pricing

### Free Trial
- **$15.50 trial credit**
- 1 free US phone number
- SMS: $0.0079 per message
- ~1,962 SMS messages with trial credit
- Can only send to verified numbers

### Paid Account
- **Minimum**: $20 top-up
- **Phone Number**: $1.15/month
- **SMS**: $0.0079 per message (US)
- Can send to any number
- No trial message

### Cost Estimate for Your App
```
100 users/month × 2 SMS each (OTP + confirmation) = 200 SMS
200 × $0.0079 = $1.58/month + $1.15 phone = $2.73/month
```

## 🌍 International SMS

### Pricing by Country
- **India**: $0.0073 per SMS
- **UK**: $0.0520 per SMS
- **Canada**: $0.0075 per SMS
- **Australia**: $0.0850 per SMS

### Setup for International
1. Enable international SMS in Twilio Console
2. Add country permissions
3. Users must include country code (+91, +44, etc.)

## 🔒 Security Best Practices

### 1. Protect Your Credentials
```env
# ❌ NEVER commit .env to git
# ✅ Add to .gitignore
.env
```

### 2. Use Environment Variables
```javascript
// ✅ Good
const accountSid = process.env.TWILIO_ACCOUNT_SID;

// ❌ Bad
const accountSid = "ACxxxxxxxx"; // Hardcoded
```

### 3. Rotate Credentials
- Change Auth Token every 90 days
- Use Twilio's API Key for production (more secure)

### 4. Monitor Usage
- Set up usage alerts in Twilio Console
- Monitor for unusual activity
- Set spending limits

## 🧪 Testing Without SMS Costs

### Development Mode (Current Setup)
```javascript
// Backend automatically detects if Twilio is configured
if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
  // Send real SMS
} else {
  // Log OTP to console
  console.log('OTP:', otp);
}
```

### Test Flow
1. Don't add Twilio credentials to `.env`
2. Request OTP from frontend
3. Check backend console for OTP
4. Use OTP from console to verify
5. Complete password reset

## 📱 SMS Message Examples

### OTP Message
```
Your SolveHub password reset OTP is: 123456

This code will expire in 10 minutes.

If you didn't request this, please ignore this message.
```

### Confirmation Message
```
Your SolveHub password has been changed successfully. If you didn't make this change, please contact support immediately.
```

### Trial Account Message
```
Sent from your Twilio trial account - Your SolveHub password reset OTP is: 123456

This code will expire in 10 minutes.

If you didn't request this, please ignore this message.
```

## 🚀 Production Deployment

### Vercel Environment Variables
1. Go to your Vercel project
2. Settings → Environment Variables
3. Add:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxx
   TWILIO_PHONE_NUMBER=+1234567890
   ```
4. Redeploy your backend

### Render Environment Variables
1. Go to your Render service
2. Environment → Add Environment Variable
3. Add the same 3 variables
4. Service will auto-redeploy

## 🐛 Troubleshooting

### Issue: "Failed to send SMS"
**Solution**: Check if:
- Twilio credentials are correct
- Phone number is in E.164 format (+1234567890)
- You have sufficient balance
- Number is verified (trial account)

### Issue: "Invalid phone number"
**Solution**: 
- Include country code (+1, +91, etc.)
- Remove spaces and dashes
- Use format: +1234567890

### Issue: "SMS not received"
**Solution**:
- Check if number is verified (trial account)
- Check Twilio logs in console
- Verify phone number is correct
- Check carrier restrictions

### Issue: "OTP expired"
**Solution**:
- OTP expires in 10 minutes
- Request new OTP
- Complete flow faster

## 📊 Monitoring

### Twilio Console
1. Go to **Monitor** → **Logs** → **Messaging**
2. See all SMS sent/failed
3. Check error messages
4. Monitor costs

### Your Backend
```javascript
// Add logging
console.log(`✅ OTP sent to ${phone}`);
console.log(`❌ Failed to send OTP: ${error.message}`);
```

## 🎯 Quick Reference

### Essential Links
- **Console**: https://console.twilio.com/
- **Docs**: https://www.twilio.com/docs/sms
- **Pricing**: https://www.twilio.com/sms/pricing
- **Support**: https://support.twilio.com/

### Phone Number Format
```javascript
// ✅ Correct
+1234567890
+919876543210
+442079460958

// ❌ Wrong
1234567890      // Missing +
+1 234-567-890  // Has spaces/dashes
```

### Environment Variables
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

## ✅ Checklist

Before going to production:
- [ ] Twilio account created
- [ ] Phone number purchased
- [ ] Credentials added to `.env`
- [ ] Backend restarted
- [ ] Test SMS received successfully
- [ ] Environment variables added to hosting platform
- [ ] Usage alerts configured
- [ ] Spending limits set
- [ ] Backup contact method available

## 💡 Pro Tips

1. **Start with Trial**: Test everything before upgrading
2. **Verify Numbers**: Add your team's numbers to verified list
3. **Monitor Costs**: Set up alerts at $5, $10, $15
4. **Use Webhooks**: Get delivery status updates
5. **Cache OTPs**: Don't regenerate on every request
6. **Rate Limit**: Prevent abuse (max 3 OTPs per 15 min)
7. **Log Everything**: Track all OTP requests for debugging

## 🎉 You're Ready!

Your SMS OTP system is configured and ready to use. Start with development mode (no Twilio), then add credentials when ready for production!

**Need Help?**
- Check backend console for OTP in development mode
- Review Twilio logs for SMS issues
- Contact Twilio support for account issues

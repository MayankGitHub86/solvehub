# 📧 Email Setup Guide - Contact Form

## 🎯 Problem
Contact form emails are not being sent to `pandeymp8602@gmail.com`

## ✅ Solution
You need to generate a Gmail App Password (not your regular Gmail password)

---

## 📝 Step-by-Step Setup

### Step 1: Enable 2-Step Verification

1. Go to: https://myaccount.google.com/security
2. Scroll down to "How you sign in to Google"
3. Click on "2-Step Verification"
4. Follow the prompts to enable it (if not already enabled)
5. You'll need your phone for verification

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
   - Or search "App passwords" in Google Account settings
2. You might need to sign in again
3. Under "Select app", choose **"Mail"**
4. Under "Select device", choose **"Other (Custom name)"**
5. Enter name: **"SolveHub"**
6. Click **"Generate"**
7. You'll see a 16-character password like: `abcd efgh ijkl mnop`
8. **Copy this password** (you won't see it again!)

### Step 3: Update Backend .env File

Open `lumina-share/backend/.env` and update:

```env
# Email Configuration (for contact form)
EMAIL_USER=pandeymp8602@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
```

**Important**: 
- Remove all spaces from the app password
- It should be exactly 16 characters
- Example: `abcdefghijklmnop` (no spaces)

### Step 4: Restart Backend Server

Stop and restart your backend server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd backend
npm start
```

Or if using the process manager, restart process ID 10.

---

## 🧪 Test the Contact Form

1. Go to: http://localhost:8080/contact
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Subject: Test Message
   - Message: This is a test message
3. Click "Send Message"
4. Check your Gmail: `pandeymp8602@gmail.com`
5. You should receive an email with the subject: `[SolveHub Contact] Test Message`

---

## 🔍 Troubleshooting

### Issue 1: "Email authentication failed"

**Cause**: Wrong app password or not using app password

**Solution**:
1. Make sure you're using the 16-character App Password (not your Gmail password)
2. Remove all spaces from the password
3. Generate a new App Password if needed
4. Update `.env` file
5. Restart backend server

### Issue 2: "Email service not configured"

**Cause**: Environment variables not set

**Solution**:
1. Check `backend/.env` file has:
   ```
   EMAIL_USER=pandeymp8602@gmail.com
   EMAIL_PASSWORD=your_16_char_password
   ```
2. Make sure there are no typos
3. Restart backend server

### Issue 3: "Could not connect to email server"

**Cause**: Network or firewall issue

**Solution**:
1. Check your internet connection
2. Try disabling VPN if using one
3. Check if Gmail is accessible
4. Wait a few minutes and try again

### Issue 4: Still not receiving emails

**Check**:
1. Look in Gmail **Spam** folder
2. Check Gmail **All Mail** folder
3. Search for "SolveHub" in Gmail
4. Check backend console logs for errors
5. Verify the email address is correct

---

## 📊 Backend Logs

When the contact form is submitted, you should see in backend console:

**Success:**
```
✅ Email transporter verified successfully
✅ Email sent successfully: <message-id>
```

**Failure:**
```
❌ Email transporter verification failed: Invalid login
💡 Hint: Check EMAIL_USER and EMAIL_PASSWORD in .env file
💡 Gmail requires App Password: https://myaccount.google.com/apppasswords
```

---

## 🔐 Security Notes

### App Password vs Regular Password

**Regular Gmail Password:**
- ❌ Won't work for apps
- ❌ Less secure for third-party apps
- ❌ Gmail blocks it

**App Password:**
- ✅ Designed for apps
- ✅ More secure
- ✅ Can be revoked anytime
- ✅ Doesn't give full account access

### Best Practices:

1. **Never share** your app password
2. **Don't commit** `.env` file to Git (it's in `.gitignore`)
3. **Revoke** app passwords you're not using
4. **Use different** app passwords for different apps
5. **Regenerate** if compromised

---

## 📧 Email Format

When someone submits the contact form, you'll receive:

**Subject:** `[SolveHub Contact] {their subject}`

**Body:**
```
New Contact Form Submission

Name: John Doe
Email: john@example.com
Subject: Question about features
Date: 12/26/2024, 11:30:00 PM

Message:
Hi, I have a question about...

---
This email was sent from the SolveHub contact form.
Reply to: john@example.com
```

---

## 🎯 Quick Fix Checklist

- [ ] 2-Step Verification enabled on Gmail
- [ ] App Password generated (16 characters)
- [ ] `EMAIL_USER` set in `.env`
- [ ] `EMAIL_PASSWORD` set in `.env` (no spaces)
- [ ] Backend server restarted
- [ ] Test email sent from contact form
- [ ] Email received in `pandeymp8602@gmail.com`

---

## 🚀 Alternative: Using Other Email Services

If Gmail doesn't work, you can use:

### 1. SendGrid (Free tier: 100 emails/day)
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_api_key
```

### 2. Mailgun (Free tier: 5,000 emails/month)
```env
EMAIL_SERVICE=mailgun
MAILGUN_API_KEY=your_api_key
MAILGUN_DOMAIN=your_domain
```

### 3. AWS SES (Very cheap)
```env
EMAIL_SERVICE=ses
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
```

---

## 📞 Need Help?

If you're still having issues:

1. Check backend console for error messages
2. Try generating a new App Password
3. Make sure 2-Step Verification is enabled
4. Test with a simple email first
5. Check Gmail security settings

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Backend logs show: "Email transporter verified successfully"
2. ✅ Backend logs show: "Email sent successfully"
3. ✅ Frontend shows: "Message sent successfully!"
4. ✅ You receive email in `pandeymp8602@gmail.com`
5. ✅ Email has proper formatting and content

---

**Current Status**: ⚠️ Needs App Password Configuration

**Next Step**: Generate Gmail App Password and update `.env` file

---

**Good luck! Your contact form will be working in 5 minutes!** 🚀

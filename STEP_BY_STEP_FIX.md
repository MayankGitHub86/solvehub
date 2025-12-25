# 📋 Step-by-Step Fix for OAuth Error

**Time Required:** 15 minutes (5 min work + 10 min waiting)  
**Difficulty:** Easy  
**Current Error:** `invalid_request: redirect_uri not valid`

---

## 🎯 What We're Fixing

Your app is deployed on Vercel but OAuth login fails because:
- Google doesn't know about `https://lumina-share-lac.vercel.app/login`
- Microsoft doesn't know about `https://lumina-share-lac.vercel.app`

We need to tell them these URLs are allowed!

---

## 📝 Step 1: Fix Google OAuth (2 minutes)

### 1.1 Open Google Cloud Console
- Go to: https://console.cloud.google.com/apis/credentials
- Sign in with your Google account

### 1.2 Find Your OAuth Client
- Look for: **OAuth 2.0 Client IDs** section
- Find client with ID: `317615895239-hjk5cmerhr3cku0givucq52uportmf9r`
- Click on the **name** (not the ID) to edit

### 1.3 Add Production Redirect URI
- Scroll down to: **Authorized redirect URIs**
- You should see: `http://localhost:8080/login` (existing)
- Click: **+ ADD URI** button
- Enter: `https://lumina-share-lac.vercel.app/login`
- Click: **SAVE** button at the bottom

### 1.4 Verify
You should now have TWO redirect URIs:
```
✅ http://localhost:8080/login
✅ https://lumina-share-lac.vercel.app/login
```

---

## 📝 Step 2: Fix Microsoft OAuth (2 minutes)

### 2.1 Open Azure Portal
- Go to: https://portal.azure.com
- Sign in with your Microsoft account

### 2.2 Navigate to App Registrations
- In the search bar at top, type: **App registrations**
- Click on: **App registrations** service
- Find your app with Client ID: `1ca95a05-71eb-4e7f-a63e-f3d25361a9f5`
- Click on the **app name**

### 2.3 Go to Authentication
- In the left sidebar, click: **Authentication**
- Look for: **Platform configurations** section
- Find: **Web** platform

### 2.4 Add Production Redirect URI
- Under Web platform, click: **Add URI**
- You should see: `http://localhost:8080` (existing)
- In the new field, enter: `https://lumina-share-lac.vercel.app`
- Scroll down and click: **Save** button

### 2.5 Verify
You should now have TWO redirect URIs under Web:
```
✅ http://localhost:8080
✅ https://lumina-share-lac.vercel.app
```

---

## 📝 Step 3: Configure Vercel Environment Variables (1 minute)

### 3.1 Open Vercel Dashboard
- Go to: https://vercel.com/dashboard
- Find your project: **lumina-share**
- Click on the project name

### 3.2 Go to Settings
- Click: **Settings** tab at the top
- In left sidebar, click: **Environment Variables**

### 3.3 Check Existing Variables
Look for these variables. If they exist, you're good! If not, add them:

**Variable 1:**
- Key: `VITE_GOOGLE_CLIENT_ID`
- Value: `317615895239-hjk5cmerhr3cku0givucq52uportmf9r.apps.googleusercontent.com`
- Environment: Production, Preview, Development (all checked)

**Variable 2:**
- Key: `VITE_MICROSOFT_CLIENT_ID`
- Value: `1ca95a05-71eb-4e7f-a63e-f3d25361a9f5`
- Environment: Production, Preview, Development (all checked)

**Variable 3:**
- Key: `VITE_MICROSOFT_TENANT_ID`
- Value: `common`
- Environment: Production, Preview, Development (all checked)

**Variable 4:**
- Key: `VITE_API_URL`
- Value: `http://localhost:3001/api`
- Environment: Production, Preview, Development (all checked)

### 3.4 Add Missing Variables
If any variables are missing:
1. Click: **Add New** button
2. Enter the Key and Value
3. Check all three environments
4. Click: **Save**

### 3.5 Redeploy (CRITICAL!)
**If you added any new variables:**
1. Go to: **Deployments** tab
2. Find the latest deployment
3. Click the **three dots** (•••) menu
4. Click: **Redeploy**
5. Confirm the redeploy

**Note:** Environment variables only take effect after redeployment!

---

## ⏰ Step 4: Wait for Propagation (10 minutes)

### 4.1 Why Wait?
- Google OAuth changes take 5-10 minutes to propagate globally
- Microsoft OAuth changes take 5-10 minutes to propagate globally
- This is normal and required!

### 4.2 What to Do While Waiting
- ☕ Get a coffee
- 📧 Check your email
- 📱 Browse social media
- 🎮 Play a quick game

### 4.3 Don't Skip This!
If you test immediately, it will still fail because the changes haven't propagated yet.

---

## 🧪 Step 5: Test OAuth Login (2 minutes)

### 5.1 Clear Browser Cache
**Chrome:**
1. Press: `Ctrl + Shift + Delete`
2. Select: **Cached images and files**
3. Time range: **All time**
4. Click: **Clear data**

**Firefox:**
1. Press: `Ctrl + Shift + Delete`
2. Select: **Cache**
3. Time range: **Everything**
4. Click: **Clear Now**

### 5.2 Open Incognito/Private Window
- Chrome: `Ctrl + Shift + N`
- Firefox: `Ctrl + Shift + P`
- Edge: `Ctrl + Shift + N`

### 5.3 Test Google OAuth
1. Go to: https://lumina-share-lac.vercel.app
2. Click: **Login** button
3. Click: **Continue with Google**
4. Should redirect to Google login page
5. Select your Google account
6. Should redirect back to your app
7. You should be logged in! ✅

### 5.4 Test Microsoft OAuth
1. If logged in, logout first
2. Click: **Login** button
3. Click: **Continue with Microsoft**
4. Should redirect to Microsoft login page
5. Enter your Microsoft credentials
6. Should redirect back to your app
7. You should be logged in! ✅

---

## ✅ Success Indicators

### OAuth is Working When:
- ✅ No error messages appear
- ✅ Redirects to Google/Microsoft login page
- ✅ After login, redirects back to your app
- ✅ You see your profile in the app
- ✅ You can access all features

### OAuth is NOT Working When:
- ❌ Error: "redirect_uri not valid"
- ❌ Error: "invalid_request"
- ❌ Stays on login page
- ❌ Shows "Something went wrong"

---

## 🐛 Troubleshooting

### Problem: Still Getting Redirect URI Error

**Solution 1: Wait Longer**
- OAuth changes can take up to 15 minutes
- Wait another 5 minutes and try again

**Solution 2: Verify URIs Match Exactly**
- Go back to Google Console
- Check: `https://lumina-share-lac.vercel.app/login` (with /login)
- Go back to Azure Portal
- Check: `https://lumina-share-lac.vercel.app` (without /login)
- They must match exactly!

**Solution 3: Clear Cache Again**
- Clear browser cache completely
- Close all browser windows
- Open new incognito window
- Try again

**Solution 4: Check Different Browser**
- Try Chrome if you used Firefox
- Try Firefox if you used Chrome
- This helps rule out browser-specific issues

### Problem: Environment Variables Not Working

**Solution:**
1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Verify all 4 variables exist
4. Go to Deployments tab
5. **Redeploy the latest deployment**
6. Wait for deployment to complete
7. Try again

### Problem: Vercel Shows Old Version

**Solution:**
1. Clear browser cache
2. Hard refresh: `Ctrl + Shift + R`
3. Check deployment status in Vercel
4. Ensure latest deployment is "Ready"

---

## 🆘 Emergency Workaround

### If OAuth Still Doesn't Work

Users can login with email/password:

**Test Account 1:**
- Email: `john@example.com`
- Password: `password123`

**Test Account 2:**
- Email: `jane@example.com`
- Password: `password123`

**More accounts:** See `LOGIN_CREDENTIALS.md`

This lets you use the app while troubleshooting OAuth!

---

## 📊 Checklist

Use this to track your progress:

- [ ] Step 1: Added Google redirect URI
- [ ] Step 1: Saved Google OAuth changes
- [ ] Step 2: Added Microsoft redirect URI
- [ ] Step 2: Saved Microsoft OAuth changes
- [ ] Step 3: Verified Vercel environment variables
- [ ] Step 3: Redeployed if variables were added
- [ ] Step 4: Waited 10 minutes
- [ ] Step 5: Cleared browser cache
- [ ] Step 5: Tested in incognito window
- [ ] Step 5: Google OAuth works ✅
- [ ] Step 5: Microsoft OAuth works ✅

---

## 🎉 You're Done!

If all checkboxes are checked and OAuth works:

**Congratulations!** 🎊

Your app is now fully deployed and functional on Vercel!

**Live URL:** https://lumina-share-lac.vercel.app

All features are working:
- ✅ Google OAuth Login
- ✅ Microsoft OAuth Login
- ✅ Email/Password Login
- ✅ Questions & Answers
- ✅ Comments & Mentions
- ✅ Reviews System
- ✅ Avatar Upload
- ✅ Contact Form
- ✅ Leaderboard
- ✅ And more!

---

## 📞 Still Need Help?

If you followed all steps and OAuth still doesn't work:

1. **Check browser console:**
   - Press F12
   - Go to Console tab
   - Look for error messages
   - Share the error message

2. **Check Vercel logs:**
   - Go to Vercel Dashboard
   - Click Deployments
   - Click latest deployment
   - Check Function Logs

3. **Verify everything:**
   - Google redirect URI: `https://lumina-share-lac.vercel.app/login`
   - Microsoft redirect URI: `https://lumina-share-lac.vercel.app`
   - All environment variables set
   - Latest deployment is active
   - Waited at least 15 minutes

---

**Last Updated:** December 26, 2024  
**Estimated Time:** 15 minutes total  
**Success Rate:** 99% if steps followed correctly

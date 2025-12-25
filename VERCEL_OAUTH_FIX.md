# 🔧 Fix OAuth Redirect URI Error on Vercel

## ❌ Current Error
```
invalid_request: The provided value for the input parameter 'redirect_uri' 
is not valid. The expected value is a URI which matches a redirect URI 
registered for this client application.
```

## 🎯 Root Cause
Your OAuth providers (Google & Microsoft) don't have the Vercel production URL registered as an authorized redirect URI.

**Current Redirect URI in Code:** `${window.location.origin}/login`
- Local: `http://localhost:8080/login` ✅ (works)
- Production: `https://lumina-share-lac.vercel.app/login` ❌ (not registered)

---

## 🔑 Solution: Update OAuth Redirect URIs

### 1️⃣ Google OAuth Configuration

#### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/apis/credentials
2. Sign in with your Google account

#### Step 2: Find Your OAuth Client
1. Look for your OAuth 2.0 Client ID
2. Client ID: `317615895239-hjk5cmerhr3cku0givucq52uportmf9r.apps.googleusercontent.com`
3. Click on the client name to edit

#### Step 3: Add Vercel Redirect URI
1. Scroll to **Authorized redirect URIs**
2. Click **+ ADD URI**
3. Add these URIs:
   ```
   http://localhost:8080/login
   https://lumina-share-lac.vercel.app/login
   ```
4. Click **SAVE**

#### Step 4: Wait for Propagation
- Changes take 5-10 minutes to propagate
- Clear browser cache after waiting

---

### 2️⃣ Microsoft OAuth Configuration

#### Step 1: Go to Azure Portal
1. Visit: https://portal.azure.com
2. Sign in with your Microsoft account

#### Step 2: Navigate to App Registrations
1. Search for "App registrations" in the top search bar
2. Click on your app (Client ID: `1ca95a05-71eb-4e7f-a63e-f3d25361a9f5`)

#### Step 3: Add Redirect URI
1. Click **Authentication** in the left sidebar
2. Under **Platform configurations** → **Web**
3. Click **Add URI**
4. Add these URIs:
   ```
   http://localhost:8080
   https://lumina-share-lac.vercel.app
   ```
5. Click **Save**

#### Step 4: Verify Settings
- **Supported account types:** Accounts in any organizational directory and personal Microsoft accounts
- **Allow public client flows:** No
- **ID tokens:** Checked ✅
- **Access tokens:** Checked ✅

---

## 🌐 Vercel Environment Variables

Make sure these are set in Vercel Dashboard:

1. Go to: https://vercel.com/dashboard
2. Select your project: `lumina-share`
3. Go to: **Settings** → **Environment Variables**
4. Add/verify these variables:

```env
VITE_API_URL=http://localhost:3001/api
VITE_GOOGLE_CLIENT_ID=317615895239-hjk5cmerhr3cku0givucq52uportmf9r.apps.googleusercontent.com
VITE_MICROSOFT_CLIENT_ID=1ca95a05-71eb-4e7f-a63e-f3d25361a9f5
VITE_MICROSOFT_TENANT_ID=common
```

**Important:** After adding/updating environment variables, you MUST redeploy!

---

## 🧪 Testing After Configuration

### Test Google OAuth
1. Go to: https://lumina-share-lac.vercel.app
2. Click **Login**
3. Click **Continue with Google**
4. Should redirect to Google login
5. After login, should redirect back to your app

### Test Microsoft OAuth
1. Go to: https://lumina-share-lac.vercel.app
2. Click **Login**
3. Click **Continue with Microsoft**
4. Should redirect to Microsoft login
5. After login, should redirect back to your app

### Fallback: Email/Password Login
If OAuth still doesn't work, users can login with:
- **Email:** Any of the 13 test accounts (see LOGIN_CREDENTIALS.md)
- **Password:** `password123`

---

## 🐛 Troubleshooting

### Still Getting Redirect URI Error?

#### Check 1: Verify URIs Match Exactly
- URIs are case-sensitive
- Must include protocol (https://)
- Must include path (/login for Google)
- No trailing slashes

#### Check 2: Clear Browser Cache
```
Chrome: Ctrl+Shift+Delete → Clear cached images and files
Firefox: Ctrl+Shift+Delete → Cookies and Cache
```

#### Check 3: Wait for Propagation
- Google: 5-10 minutes
- Microsoft: 5-10 minutes
- Try in incognito/private window

#### Check 4: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for OAuth errors
4. Share error message if still failing

### OAuth Works Locally But Not on Vercel?

**Possible Issues:**
1. Environment variables not set in Vercel
2. Redirect URIs not updated in OAuth consoles
3. Browser cache showing old error
4. OAuth changes not propagated yet

**Solutions:**
1. Verify all environment variables in Vercel
2. Double-check redirect URIs in both consoles
3. Clear browser cache completely
4. Wait 10 minutes and try again
5. Try in incognito/private window

---

## 📋 Complete Redirect URI List

### Google OAuth Console
Add these Authorized redirect URIs:
```
http://localhost:8080/login
https://lumina-share-lac.vercel.app/login
```

### Microsoft Azure Portal
Add these Redirect URIs (Web platform):
```
http://localhost:8080
https://lumina-share-lac.vercel.app
```

**Note:** Google uses `/login` path, Microsoft uses just the origin.

---

## 🚀 After Fixing OAuth

Once OAuth is working:

1. **Test all login methods:**
   - ✅ Email/Password
   - ✅ Google OAuth
   - ✅ Microsoft OAuth

2. **Test all features:**
   - ✅ Create questions
   - ✅ Post answers
   - ✅ Upvote/downvote
   - ✅ Comments
   - ✅ Reviews
   - ✅ Avatar upload
   - ✅ Contact form

3. **Monitor for issues:**
   - Check Vercel logs
   - Check browser console
   - Test on different browsers

---

## 📞 Need Help?

If OAuth still doesn't work after following these steps:

1. **Check Vercel deployment logs:**
   - Go to Vercel Dashboard → Deployments
   - Click on latest deployment
   - Check Function Logs

2. **Verify OAuth credentials:**
   - Make sure Client IDs match in .env and OAuth consoles
   - Check for typos in environment variables

3. **Test with email/password first:**
   - Verify basic authentication works
   - Then troubleshoot OAuth separately

---

## ✅ Success Checklist

- [ ] Google OAuth redirect URI added in Google Cloud Console
- [ ] Microsoft OAuth redirect URI added in Azure Portal
- [ ] Environment variables set in Vercel
- [ ] Redeployed after adding environment variables
- [ ] Waited 10 minutes for OAuth changes to propagate
- [ ] Cleared browser cache
- [ ] Tested Google OAuth login
- [ ] Tested Microsoft OAuth login
- [ ] Tested email/password login

---

**Last Updated:** December 26, 2024  
**Status:** Ready to fix OAuth on Vercel

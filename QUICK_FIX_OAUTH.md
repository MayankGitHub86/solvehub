# ⚡ Quick Fix: OAuth Redirect URI Error

## 🎯 The Problem
```
invalid_request: The provided value for the input parameter 'redirect_uri' 
is not valid.
```

## ✅ The Solution (5 Minutes)

### 1. Google OAuth Console
🔗 https://console.cloud.google.com/apis/credentials

1. Find OAuth Client: `317615895239-hjk5cmerhr3cku0givucq52uportmf9r`
2. Click to edit
3. Add Authorized redirect URI:
   ```
   https://lumina-share-lac.vercel.app/login
   ```
4. Save

### 2. Microsoft Azure Portal
🔗 https://portal.azure.com

1. Search "App registrations"
2. Find app: `1ca95a05-71eb-4e7f-a63e-f3d25361a9f5`
3. Click "Authentication"
4. Add Web redirect URI:
   ```
   https://lumina-share-lac.vercel.app
   ```
5. Save

### 3. Vercel Environment Variables
🔗 https://vercel.com/dashboard

1. Go to your project settings
2. Environment Variables section
3. Verify these exist:
   ```
   VITE_GOOGLE_CLIENT_ID=317615895239-hjk5cmerhr3cku0givucq52uportmf9r.apps.googleusercontent.com
   VITE_MICROSOFT_CLIENT_ID=1ca95a05-71eb-4e7f-a63e-f3d25361a9f5
   VITE_MICROSOFT_TENANT_ID=common
   ```
4. If missing, add them
5. **Redeploy after adding!**

### 4. Wait & Test
⏰ Wait 10 minutes for OAuth changes to propagate

Then test:
1. Go to: https://lumina-share-lac.vercel.app
2. Click Login
3. Try Google OAuth
4. Try Microsoft OAuth

---

## 🔄 If Still Not Working

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Try incognito/private window**
3. **Check browser console** for errors (F12)
4. **Wait longer** (up to 15 minutes)

---

## 🆘 Temporary Workaround

Users can login with email/password:
- **Email:** `john@example.com`
- **Password:** `password123`

(See LOGIN_CREDENTIALS.md for all test accounts)

---

## ✅ Success Checklist

- [ ] Added Google redirect URI
- [ ] Added Microsoft redirect URI
- [ ] Verified Vercel environment variables
- [ ] Redeployed Vercel (if variables added)
- [ ] Waited 10 minutes
- [ ] Cleared browser cache
- [ ] Tested Google OAuth
- [ ] Tested Microsoft OAuth

---

**That's it! OAuth should work now.** 🎉

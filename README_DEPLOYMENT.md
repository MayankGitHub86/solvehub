# 🚀 SolveHub - Deployment Guide

**Production URL:** https://lumina-share-lac.vercel.app  
**Status:** Deployed - OAuth Configuration Needed  
**Last Updated:** December 26, 2024

---

## 📚 Quick Navigation

### 🔥 Start Here
- **STEP_BY_STEP_FIX.md** - Complete walkthrough with detailed instructions
- **QUICK_FIX_OAUTH.md** - 5-minute quick reference

### 📖 Detailed Guides
- **PRODUCTION_DEPLOYMENT_COMPLETE.md** - Full deployment documentation
- **VERCEL_OAUTH_FIX.md** - OAuth troubleshooting guide
- **DEPLOYMENT_STATUS.md** - Current status and next steps

### 🔧 Configuration Files
- **vercel.json** - Vercel deployment configuration
- **backend/railway.json** - Railway deployment config
- **backend/render.yaml** - Render deployment config

---

## ⚡ Quick Start (15 Minutes)

### Current Issue
```
Error: invalid_request: redirect_uri not valid
```

### Quick Fix
1. **Add Google redirect URI** (2 min)
   - https://console.cloud.google.com/apis/credentials
   - Add: `https://lumina-share-lac.vercel.app/login`

2. **Add Microsoft redirect URI** (2 min)
   - https://portal.azure.com
   - Add: `https://lumina-share-lac.vercel.app`

3. **Set Vercel environment variables** (1 min)
   - https://vercel.com/dashboard
   - Add OAuth client IDs

4. **Wait 10 minutes** for propagation

5. **Test OAuth login** (2 min)
   - Clear cache, test in incognito

**Detailed instructions:** See STEP_BY_STEP_FIX.md

---

## 🎯 What's Deployed

### ✅ Frontend (Vercel)
- React + Vite application
- All UI components
- OAuth integration
- Real-time features (client-side)
- Auto-deploys from GitHub

### ⚠️ Backend (Local)
- Express.js + Socket.IO
- Running on localhost:3001
- Needs separate deployment for production
- Optional but recommended

---

## 🔑 Environment Variables

### Required in Vercel
```env
VITE_GOOGLE_CLIENT_ID=317615895239-hjk5cmerhr3cku0givucq52uportmf9r.apps.googleusercontent.com
VITE_MICROSOFT_CLIENT_ID=1ca95a05-71eb-4e7f-a63e-f3d25361a9f5
VITE_MICROSOFT_TENANT_ID=common
VITE_API_URL=http://localhost:3001/api
```

### Required for Backend (When Deployed)
```env
DATABASE_URL=<your-mongodb-url>
JWT_SECRET=<your-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-secret>
MICROSOFT_CLIENT_ID=<your-microsoft-client-id>
SAMBANOVA_API_KEY=<your-sambanova-key>
EMAIL_USER=pandeymp8602@gmail.com
EMAIL_PASSWORD=<your-email-password>
```

---

## 🧪 Testing

### Test Accounts
All accounts use password: `password123`

```
john@example.com
jane@example.com
alice@example.com
bob@example.com
charlie@example.com
diana@example.com
eve@example.com
frank@example.com
grace@example.com
henry@example.com
ivy@example.com
jack@example.com
kate@example.com
```

**Full list:** See LOGIN_CREDENTIALS.md

### OAuth Testing
- Google OAuth: Use any Google account
- Microsoft OAuth: Use any Microsoft account

---

## 📋 Features

### Authentication
- ✅ Email/Password login
- ✅ Google OAuth
- ✅ Microsoft OAuth
- ✅ JWT-based sessions

### Core Features
- ✅ Questions & Answers
- ✅ Upvote/Downvote system
- ✅ Comments on answers
- ✅ User mentions (@username)
- ✅ Tags & filtering
- ✅ Search functionality

### Advanced Features
- ✅ Reviews system
- ✅ Avatar upload
- ✅ Contact form with email
- ✅ Live points & leaderboard
- ✅ Real-time notifications
- ✅ AI-powered suggestions
- ✅ Achievement badges
- ✅ User profiles

---

## 🐛 Common Issues

### Issue: OAuth Redirect Error
**Fix:** Add production URLs to OAuth consoles  
**Guide:** STEP_BY_STEP_FIX.md

### Issue: Environment Variables Not Working
**Fix:** Redeploy after adding variables  
**Guide:** PRODUCTION_DEPLOYMENT_COMPLETE.md

### Issue: API Calls Failing
**Fix:** Deploy backend or update VITE_API_URL  
**Guide:** PRODUCTION_DEPLOYMENT_COMPLETE.md

### Issue: Real-time Features Not Working
**Fix:** Deploy backend to Railway/Render  
**Guide:** PRODUCTION_DEPLOYMENT_COMPLETE.md

---

## 🚀 Deployment Options

### Frontend (Current)
- **Platform:** Vercel
- **Status:** ✅ Deployed
- **URL:** https://lumina-share-lac.vercel.app
- **Auto-deploy:** Enabled

### Backend (Optional)
- **Option 1:** Railway (Recommended)
  - Config: backend/railway.json
  - Free tier available
  - WebSocket support

- **Option 2:** Render
  - Config: backend/render.yaml
  - Free tier available
  - Good for Node.js

- **Option 3:** Keep Local
  - Works for development
  - Limited real-time features
  - Not recommended for production

---

## 📊 Architecture

```
User Browser
     ↓
Vercel (Frontend)
     ↓
Railway/Render (Backend) ← Optional
     ↓
MongoDB Atlas (Database)
```

---

## ✅ Deployment Checklist

### Immediate (Required)
- [ ] Add Google OAuth redirect URI
- [ ] Add Microsoft OAuth redirect URI
- [ ] Set Vercel environment variables
- [ ] Redeploy Vercel
- [ ] Wait 10 minutes
- [ ] Test OAuth login

### Short Term (Recommended)
- [ ] Deploy backend to Railway/Render
- [ ] Update VITE_API_URL in Vercel
- [ ] Test real-time features
- [ ] Monitor for errors

### Long Term (Optional)
- [ ] Set up custom domain
- [ ] Enable Vercel Analytics
- [ ] Add monitoring/logging
- [ ] Optimize performance

---

## 📞 Support

### Documentation
- **STEP_BY_STEP_FIX.md** - Detailed walkthrough
- **QUICK_FIX_OAUTH.md** - Quick reference
- **PRODUCTION_DEPLOYMENT_COMPLETE.md** - Full guide
- **VERCEL_OAUTH_FIX.md** - OAuth troubleshooting
- **DEPLOYMENT_STATUS.md** - Current status

### Credentials
- **LOGIN_CREDENTIALS.md** - Test account list
- **backend/.env** - Backend configuration
- **frontend/.env** - Frontend configuration

---

## 🎉 Success Criteria

### OAuth Working
- ✅ No redirect URI errors
- ✅ Google login works
- ✅ Microsoft login works
- ✅ Users can authenticate

### Full Deployment
- ✅ All pages load
- ✅ All features work
- ✅ No console errors
- ✅ Real-time updates work

---

## 🔗 Important Links

### Production
- **Live App:** https://lumina-share-lac.vercel.app
- **Vercel Dashboard:** https://vercel.com/dashboard

### OAuth Configuration
- **Google Console:** https://console.cloud.google.com/apis/credentials
- **Microsoft Portal:** https://portal.azure.com

### Backend Deployment
- **Railway:** https://railway.app
- **Render:** https://render.com

---

## 📝 Notes

### Current State
- Frontend is deployed and accessible
- OAuth needs configuration (15 min fix)
- Backend running locally (optional deployment)
- All features working locally

### Next Steps
1. Fix OAuth redirect URIs (priority)
2. Test OAuth login
3. Optionally deploy backend
4. Monitor and optimize

---

**Project:** SolveHub (Lumina Share)  
**Version:** 1.0.0  
**Status:** Production Ready (OAuth config needed)  
**Maintainer:** Mayank Pandey  
**Contact:** pandeymp8602@gmail.com

---

## 🎯 TL;DR

**Problem:** OAuth login fails on Vercel  
**Solution:** Add production URLs to OAuth consoles  
**Time:** 15 minutes  
**Guide:** STEP_BY_STEP_FIX.md  

**That's it!** Follow the guide and your app will work perfectly.

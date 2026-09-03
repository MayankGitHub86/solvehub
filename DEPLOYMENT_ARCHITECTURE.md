# 🏗️ Deployment Architecture

## 📊 Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER BROWSER                         │
│                  https://lumina-share-lac.vercel.app        │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      VERCEL (Frontend)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React + Vite Application                              │ │
│  │  - Static files served via CDN                         │ │
│  │  - Client-side routing                                 │ │
│  │  - OAuth redirect handling                             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Environment Variables:                                      │
│  - VITE_GOOGLE_CLIENT_ID                                    │
│  - VITE_MICROSOFT_CLIENT_ID                                 │
│  - VITE_API_URL                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ REST API / WebSocket
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Currently Local - Port 3001)           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Express.js + Socket.IO Server                         │ │
│  │  - REST API endpoints                                  │ │
│  │  - WebSocket connections                               │ │
│  │  - OAuth token exchange                                │ │
│  │  - Email sending                                       │ │
│  │  - AI integration                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Environment Variables:                                      │
│  - DATABASE_URL                                             │
│  - JWT_SECRET                                               │
│  - GOOGLE_CLIENT_SECRET                                     │
│  - MICROSOFT_CLIENT_SECRET                                  │
│  - SAMBANOVA_API_KEY                                        │
│  - EMAIL_USER / EMAIL_PASSWORD                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ MongoDB Protocol
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Atlas (Database)                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Collections:                                          │ │
│  │  - users                                               │ │
│  │  - questions                                           │ │
│  │  - answers                                             │ │
│  │  - comments                                            │ │
│  │  - reviews                                             │ │
│  │  - notifications                                       │ │
│  │  - messages                                            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 OAuth Flow

### Google OAuth Flow

```
┌──────────┐                                    ┌──────────────┐
│  User    │                                    │   Google     │
│ Browser  │                                    │   OAuth      │
└──────────┘                                    └──────────────┘
     │                                                  │
     │ 1. Click "Login with Google"                    │
     ├─────────────────────────────────────────────────▶
     │                                                  │
     │ 2. Redirect to Google login                     │
     │    with redirect_uri:                           │
     │    https://lumina-share-lac.vercel.app/login    │
     ◀─────────────────────────────────────────────────┤
     │                                                  │
     │ 3. User enters credentials                      │
     ├─────────────────────────────────────────────────▶
     │                                                  │
     │ 4. Google validates & returns code              │
     ◀─────────────────────────────────────────────────┤
     │                                                  │
     │ 5. Frontend sends code to backend               │
     ├──────────────────────────▶                      │
     │                           │                      │
     │                      ┌────────┐                 │
     │                      │Backend │                 │
     │                      └────────┘                 │
     │                           │                      │
     │ 6. Backend exchanges code for token             │
     │                           ├──────────────────────▶
     │                           │                      │
     │ 7. Google returns user info                     │
     │                           ◀──────────────────────┤
     │                           │                      │
     │ 8. Backend creates/updates user                 │
     │                           │                      │
     │ 9. Backend returns JWT                          │
     ◀──────────────────────────┤                      │
     │                                                  │
     │ 10. User logged in!                             │
     │                                                  │
```

### Microsoft OAuth Flow

```
Similar to Google, but:
- Redirect URI: https://lumina-share-lac.vercel.app (no /login)
- Uses Microsoft Identity Platform
- Returns different token format
```

---

## 🚀 Deployment Scenarios

### Scenario 1: Current Setup (Frontend Only)

```
✅ Pros:
- Simple deployment
- Free hosting on Vercel
- Fast CDN delivery
- Auto-deploy from GitHub

❌ Cons:
- Backend runs locally
- No real-time features in production
- OAuth requires local backend
- Not suitable for production use

📊 Use Case:
- Development
- Testing
- Demo purposes
```

### Scenario 2: Frontend + Backend (Recommended)

```
✅ Pros:
- Full feature support
- Real-time updates work
- OAuth works in production
- Scalable architecture
- Professional setup

❌ Cons:
- Requires backend deployment
- Slightly more complex
- May have hosting costs

📊 Use Case:
- Production deployment
- Full feature access
- Real users
- Professional use
```

### Scenario 3: Full Stack on Vercel (Not Recommended)

```
❌ Why Not:
- Vercel serverless doesn't support WebSocket
- Socket.IO won't work properly
- Long-running connections fail
- Real-time features broken

📊 Verdict:
- Don't use this approach
- Deploy backend separately
```

---

## 🔧 Backend Deployment Options

### Option 1: Railway

```
┌─────────────────────────────────────────┐
│           Railway Platform              │
│                                         │
│  ✅ WebSocket support                   │
│  ✅ Free tier available                 │
│  ✅ Auto-deploy from GitHub             │
│  ✅ Easy environment variables          │
│  ✅ Built-in monitoring                 │
│  ✅ Custom domains                      │
│                                         │
│  📦 Deployment:                         │
│  - Connect GitHub repo                  │
│  - Set root directory: backend          │
│  - Add environment variables            │
│  - Deploy!                              │
│                                         │
│  💰 Cost: Free tier → $5/month          │
└─────────────────────────────────────────┘
```

### Option 2: Render

```
┌─────────────────────────────────────────┐
│            Render Platform              │
│                                         │
│  ✅ WebSocket support                   │
│  ✅ Free tier available                 │
│  ✅ Auto-deploy from GitHub             │
│  ✅ Easy configuration                  │
│  ✅ Good documentation                  │
│  ✅ Health checks                       │
│                                         │
│  📦 Deployment:                         │
│  - Create web service                   │
│  - Connect GitHub repo                  │
│  - Set root directory: backend          │
│  - Add environment variables            │
│  - Deploy!                              │
│                                         │
│  💰 Cost: Free tier → $7/month          │
└─────────────────────────────────────────┘
```

### Option 3: Heroku

```
┌─────────────────────────────────────────┐
│           Heroku Platform               │
│                                         │
│  ✅ WebSocket support                   │
│  ⚠️  No free tier (since 2022)          │
│  ✅ Auto-deploy from GitHub             │
│  ✅ Mature platform                     │
│  ✅ Many add-ons                        │
│  ✅ Good documentation                  │
│                                         │
│  📦 Deployment:                         │
│  - Create new app                       │
│  - Connect GitHub repo                  │
│  - Set buildpack: Node.js               │
│  - Add environment variables            │
│  - Deploy!                              │
│                                         │
│  💰 Cost: $7/month minimum              │
└─────────────────────────────────────────┘
```

---

## 📊 Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION SETUP                          │
└─────────────────────────────────────────────────────────────┘

Frontend (Vercel)
├── Static files via CDN
├── Client-side routing
├── OAuth redirect handling
└── Environment variables
    ├── VITE_GOOGLE_CLIENT_ID
    ├── VITE_MICROSOFT_CLIENT_ID
    └── VITE_API_URL → Points to Railway/Render

Backend (Railway/Render)
├── Express.js REST API
├── Socket.IO WebSocket server
├── OAuth token exchange
├── Email sending
├── AI integration
└── Environment variables
    ├── DATABASE_URL → MongoDB Atlas
    ├── JWT_SECRET
    ├── OAuth secrets
    ├── API keys
    └── Email credentials

Database (MongoDB Atlas)
├── Free tier (512MB)
├── Automatic backups
├── Global distribution
└── High availability

External Services
├── Google OAuth
├── Microsoft OAuth
├── SambaNova AI (Free)
└── Email (Gmail SMTP)
```

---

## 🔐 Security Considerations

### Frontend (Public)
```
✅ Safe to expose:
- OAuth Client IDs
- API URL
- Public configuration

❌ Never expose:
- OAuth Client Secrets
- JWT Secret
- Database credentials
- API keys
- Email passwords
```

### Backend (Private)
```
✅ Keep secret:
- OAuth Client Secrets
- JWT Secret
- Database URL
- API keys
- Email credentials

✅ Security measures:
- CORS configuration
- Rate limiting
- Input validation
- JWT verification
- HTTPS only
```

---

## 📈 Scaling Strategy

### Phase 1: MVP (Current)
```
- Vercel frontend
- Railway/Render backend (single instance)
- MongoDB Atlas (free tier)
- Good for: 0-1000 users
```

### Phase 2: Growth
```
- Vercel frontend (same)
- Railway/Render backend (scaled instances)
- MongoDB Atlas (paid tier)
- Redis for caching
- Good for: 1000-10000 users
```

### Phase 3: Scale
```
- Vercel frontend (same)
- Kubernetes cluster for backend
- MongoDB Atlas (dedicated cluster)
- Redis cluster
- CDN for assets
- Load balancer
- Good for: 10000+ users
```

---

## 🎯 Current Status

```
┌─────────────────────────────────────────┐
│         DEPLOYMENT STATUS               │
├─────────────────────────────────────────┤
│ Frontend:  ✅ Deployed on Vercel        │
│ Backend:   ⚠️  Running locally          │
│ Database:  ✅ MongoDB Atlas             │
│ OAuth:     ⚠️  Needs configuration      │
│ DNS:       ✅ Vercel subdomain          │
│ SSL:       ✅ Automatic (Vercel)        │
└─────────────────────────────────────────┘

Next Steps:
1. Configure OAuth redirect URIs
2. Set Vercel environment variables
3. Test OAuth login
4. (Optional) Deploy backend
```

---

## 🔗 Data Flow

### User Login Flow
```
User → Frontend → OAuth Provider → Frontend → Backend → Database
  ↓                                                         ↓
  └─────────────────── JWT Token ◀──────────────────────────┘
```

### Question Creation Flow
```
User → Frontend → Backend → Database
  ↓                           ↓
  └──── WebSocket ◀───────────┘
         (Real-time update to other users)
```

### Real-time Notification Flow
```
Action → Backend → Socket.IO → All Connected Clients
  ↓
Database
```

---

## ✅ Deployment Checklist

### Frontend (Vercel)
- [x] Code pushed to GitHub
- [x] Vercel project created
- [x] Auto-deploy configured
- [x] vercel.json configured
- [ ] Environment variables set
- [ ] OAuth redirect URIs configured
- [ ] Custom domain (optional)

### Backend (Railway/Render)
- [ ] Platform account created
- [ ] Project created
- [ ] GitHub connected
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Health check passing
- [ ] WebSocket working

### Database (MongoDB Atlas)
- [x] Cluster created
- [x] Database user created
- [x] Network access configured
- [x] Connection string obtained
- [x] Collections created
- [x] Indexes configured

### OAuth Providers
- [ ] Google redirect URI added
- [ ] Microsoft redirect URI added
- [ ] Client IDs configured
- [ ] Client secrets secured
- [ ] Scopes configured
- [ ] Testing completed

---

**Last Updated:** December 26, 2024  
**Architecture Version:** 1.0  
**Status:** Production Ready (OAuth config needed)

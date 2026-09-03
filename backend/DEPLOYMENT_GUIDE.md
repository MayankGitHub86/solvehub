# SolveHub Backend Deployment Guide

## Prerequisites
- GitHub account with repository: `git@github.com:MayankGitHub86/solvehub.git`
- Vercel account (sign up at https://vercel.com)
- MongoDB Atlas database (already configured)

## Step 1: Push Backend to GitHub

```bash
# Navigate to backend directory
cd lumina-share/backend

# Add all files (excluding .env which is in .gitignore)
git add .

# Commit changes
git commit -m "Prepare backend for Vercel deployment"

# Push to GitHub
git push origin main
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from backend directory:
```bash
cd lumina-share/backend
vercel
```

4. Follow the prompts:
   - Link to existing project? **No**
   - Project name: **solvehub-backend**
   - Directory: **./lumina-share/backend**
   - Override settings? **No**

5. Deploy to production:
```bash
vercel --prod
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub repository: `MayankGitHub86/solvehub`
4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `lumina-share/backend`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

## Step 3: Configure Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables and add:

### Required Variables:
```
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_strong_random_jwt_secret
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### OAuth Configuration:
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
```

### AI Configuration:
```
SAMBANOVA_API_KEY=your_sambanova_api_key
```

### Email Configuration:
```
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

## Step 4: Update OAuth Redirect URIs

### Google OAuth Console:
1. Go to https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. Add Authorized redirect URIs:
   - `https://your-backend.vercel.app/api/auth/oauth/google/callback`
   - `https://your-frontend.vercel.app` (for CORS)

### Microsoft Azure Portal:
1. Go to https://portal.azure.com
2. Navigate to Azure Active Directory → App registrations
3. Select your app
4. Add redirect URI:
   - `https://your-backend.vercel.app/api/auth/oauth/microsoft/callback`

## Step 5: Update Frontend Environment Variables

Update your frontend `.env` file with the deployed backend URL:

```env
VITE_API_URL=https://your-backend.vercel.app/api
```

Then redeploy your frontend on Vercel.

## Step 6: Update CORS Configuration

After deployment, update the `FRONTEND_URL` environment variable in Vercel with your actual frontend URL:

```
FRONTEND_URL=https://your-frontend.vercel.app
```

## Step 7: Test Your Deployment

1. Check health endpoint:
```bash
curl https://your-backend.vercel.app/api/health
```

2. Test authentication:
   - Try registering a new user
   - Try logging in
   - Test OAuth flows

## Troubleshooting

### CORS Issues:
- Ensure `FRONTEND_URL` in backend matches your frontend domain
- Check that OAuth redirect URIs are updated
- Verify Vercel environment variables are set

### Database Connection:
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Check DATABASE_URL is correctly set in Vercel

### OAuth Not Working:
- Verify redirect URIs in Google/Microsoft consoles
- Check that client IDs and secrets are correct
- Ensure callback URLs use HTTPS

## Important Security Notes

⚠️ **BEFORE PRODUCTION:**
1. Change `JWT_SECRET` to a strong random string
2. Update `MICROSOFT_CLIENT_SECRET` with actual value
3. Consider using environment-specific secrets
4. Enable MongoDB IP whitelist for production
5. Review and update CORS origins

## Your Deployment URLs

After deployment, you'll have:
- **Backend API**: `https://solvehub-backend.vercel.app/api`
- **Frontend**: `https://your-frontend.vercel.app`

Update these in your respective environment variables!

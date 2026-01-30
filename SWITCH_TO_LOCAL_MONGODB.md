# Switch to Local MongoDB (Recommended)

Since MongoDB Atlas connection is unstable, use local MongoDB for development.

## Step 1: Install MongoDB Locally

### Download MongoDB Community Edition
1. Go to: https://www.mongodb.com/try/download/community
2. Select: **Windows** → **MSI** → Download
3. Run installer
4. Choose **"Complete"** installation
5. Check **"Install MongoDB as a Service"**
6. Check **"Install MongoDB Compass"** (optional GUI)
7. Click **Install**

## Step 2: Verify MongoDB is Running

```bash
# Check if MongoDB service is running
net start | findstr MongoDB

# Should show: MongoDB
```

## Step 3: Update Backend .env

Edit `backend/.env` and change DATABASE_URL:

```env
# Comment out MongoDB Atlas
# DATABASE_URL="mongodb+srv://mayank_pandey:nuPMc1ikvJGZ2LTF@eduhub.pxeer8t.mongodb.net/solvehub?retryWrites=true&w=majority&appName=eduhub"

# Use Local MongoDB
DATABASE_URL="mongodb://localhost:27017/solvehub"
```

## Step 4: Push Schema to Local Database

```bash
cd lumina-share/backend
npx prisma db push
```

## Step 5: Seed Database with Test Data

```bash
# Seed users and questions
node prisma/seed-indian.js

# Seed badges
node prisma/seed-badges.js
```

## Step 6: Test Connection

```bash
node quick-db-test.js
```

Expected output:
```
Testing database...
✅ SUCCESS! Database connected. Users: 5
```

## Step 7: Restart Backend

The backend will auto-restart with nodemon, or manually:
```bash
npm run dev
```

## Benefits of Local MongoDB

✅ No network issues
✅ Faster response times
✅ Works offline
✅ No IP whitelist needed
✅ Free and unlimited
✅ Full control

## For Production

Keep using MongoDB Atlas for production deployment:
- Vercel/Render will use the Atlas connection string
- Local MongoDB is only for development

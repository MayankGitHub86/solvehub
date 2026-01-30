# 🔧 Quick Fix: Database Connection Issue

## Problem
❌ **Database connection is failing with network error**

Error: `Error creating a database connection. (Kind: An error occurred during DNS resolution: proto error: io error: A socket operation was attempted to an unreachable network. (os error 10051))`

---

## ✅ Solution: Whitelist Your IP in MongoDB Atlas

### Step 1: Go to MongoDB Atlas
1. Open browser and go to: https://cloud.mongodb.com
2. Log in with your credentials

### Step 2: Check Cluster Status
1. Click on "Database" in left sidebar
2. Verify your cluster "eduhub" is **RUNNING** (not paused)
3. If paused, click "Resume" button

### Step 3: Whitelist Your IP
1. Click on "Network Access" in left sidebar
2. Click "Add IP Address" button
3. **RECOMMENDED:** Click "Allow Access from Anywhere"
   - This adds `0.0.0.0/0` to whitelist
   - Good for development and testing
4. Click "Confirm"
5. **Wait 2-3 minutes** for changes to take effect

### Step 4: Verify Connection
```bash
cd lumina-share/backend
node test-connection.js
```

You should see:
```
✅ Database connected successfully!
✅ Users in database: 5
✅ Questions in database: 50
✅ Answers in database: 20
```

---

## Alternative Solutions

### Option 2: Check Your Internet Connection
1. Ensure you have stable internet
2. Try disabling VPN if active
3. Check Windows Firewall settings
4. Try using mobile hotspot

### Option 3: Verify Database Credentials
1. Go to MongoDB Atlas → Database Access
2. Verify user `mayank_pandey` exists
3. Password should match in `.env` file

### Option 4: Use Local MongoDB (If Atlas doesn't work)
```bash
# Install MongoDB locally
# Download from: https://www.mongodb.com/try/download/community

# Update backend/.env
DATABASE_URL="mongodb://localhost:27017/solvehub"

# Push schema
cd lumina-share/backend
npx prisma db push

# Seed database
node prisma/seed-indian.js
```

---

## After Fixing

### 1. Restart Backend Server
```bash
# Stop current server (Ctrl+C in terminal)
cd lumina-share/backend
npm run dev
```

### 2. Test the Application
1. Open http://localhost:8080
2. Try logging in with test account:
   - Email: `rahul.kumar@example.com`
   - Password: `password123`
3. Try creating a question
4. Check if data is saved

---

## Still Not Working?

### Check MongoDB Atlas Status
- Visit: https://status.mongodb.com
- Check if there are any ongoing incidents

### Contact Support
- MongoDB Atlas Support: https://support.mongodb.com
- Check MongoDB community forums

### Use Alternative Database
Consider using:
- Local MongoDB
- MongoDB Docker container
- Different cloud provider (AWS DocumentDB, etc.)

---

## Prevention

### For Production
1. Always whitelist specific IPs (not 0.0.0.0/0)
2. Use environment-specific connection strings
3. Enable MongoDB Atlas monitoring
4. Set up alerts for connection issues

---

**Note:** The most common cause is IP not being whitelisted in MongoDB Atlas Network Access settings. This takes 2-3 minutes to propagate after adding.

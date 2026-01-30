# Use MongoDB Compass to Add Test Data

Since local MongoDB needs replica set configuration and Atlas has DNS issues, the easiest solution is to use MongoDB Compass to manually add test data to your Atlas database.

## Step 1: Open MongoDB Compass

1. Open **MongoDB Compass** application
2. Click **"New Connection"**

## Step 2: Connect to MongoDB Atlas

Paste this connection string:
```
mongodb+srv://mayank_pandey:nuPMc1ikvJGZ2LTF@eduhub.pxeer8t.mongodb.net/
```

Click **"Connect"**

## Step 3: Select Database

1. In the left sidebar, find database: **"solvehub"**
2. Click on it to expand

## Step 4: Add Test User

1. Click on **"User"** collection
2. Click **"ADD DATA"** → **"Insert Document"**
3. Paste this JSON:

```json
{
  "name": "Rahul Kumar",
  "email": "rahul.kumar@example.com",
  "username": "rahul_kumar",
  "password": "$2a$10$rN8qN5Z5Z5Z5Z5Z5Z5Z5ZuK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5",
  "bio": "Full-stack developer",
  "points": 150,
  "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
  "createdAt": {"$date": "2025-12-27T00:00:00.000Z"},
  "updatedAt": {"$date": "2025-12-27T00:00:00.000Z"}
}
```

4. Click **"Insert"**

## Step 5: Verify Data

1. You should see the user in the collection
2. The application should now be able to read this data

## Alternative: Keep Using Existing Data

Your Atlas database already has data (we saw 51 questions, 5 users earlier). The issue is just the connection from your local machine.

## Solution: Use Mobile Hotspot

The DNS issue is likely from your network/ISP. Try:

1. Enable mobile hotspot on your phone
2. Connect your computer to the hotspot
3. Restart the backend server
4. Test connection: `node quick-db-test.js`

This often bypasses network restrictions that block MongoDB Atlas.

## Or: Wait and Retry

Sometimes DNS issues resolve themselves. Try again in 10-15 minutes.

The data is already in Atlas - it's just a connectivity issue from your current network.

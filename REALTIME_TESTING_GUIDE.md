# 🧪 Real-Time Features Testing Guide

## Quick Start

Your servers are already running:
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:8080

---

## 🎯 Testing Real-Time Features

### 1. **Test Live Viewers** 👀

**Steps:**
1. Open http://localhost:8080 in **Browser 1**
2. Login with: `priya.sharma@example.com` / `password123`
3. Navigate to any question
4. Open http://localhost:8080 in **Browser 2** (incognito/different browser)
5. Login with different account
6. Navigate to the **same question**

**Expected Result:**
- ✅ You should see "2 viewers watching" badge at the top
- ✅ Badge updates in real-time as users join/leave
- ✅ Green pulsing dot indicates live status

---

### 2. **Test Connection Status** 🌐

**Steps:**
1. Login to the application
2. Look at the top-right corner of Navbar

**Expected Result:**
- ✅ Green WiFi icon with "Live" badge
- ✅ Blue badge showing "X online" users
- ✅ Hover for tooltip information

**Test Disconnect:**
1. Open DevTools (F12)
2. Go to Network tab
3. Set throttling to "Offline"
4. Watch status change to red "Offline"

---

### 3. **Test Live Voting** 📊

**Steps:**
1. Open same question in **two browsers**
2. In Browser 1: Click upvote on the question
3. Watch Browser 2

**Expected Result:**
- ✅ Vote count updates instantly in Browser 2
- ✅ Number scales up with animation
- ✅ Green arrow flies up briefly
- ✅ No page refresh needed

**Test Downvote:**
1. Click downvote in Browser 1
2. Watch red arrow fly down in Browser 2

---

### 4. **Test Typing Indicators** ⌨️

**Steps:**
1. Open same question in **two browsers**
2. In Browser 1: Start typing an answer
3. Watch Browser 2 (below the answer form)

**Expected Result:**
- ✅ "Username is typing..." appears
- ✅ Three animated dots pulse
- ✅ Disappears after 3 seconds of inactivity

**Test Multiple Users:**
1. Start typing in Browser 1
2. Start typing in Browser 2
3. Should show "User1 and User2 are typing..."

---

### 5. **Test Live Activity Feed** 📡

**Steps:**
1. Login and go to Dashboard
2. Scroll to right sidebar
3. Look for "Live Activity" card with 🔴 indicator

**Test Activity Updates:**
1. In another browser: Post a question
2. Watch Dashboard - new activity appears
3. In another browser: Vote on something
4. Watch Dashboard - vote activity appears

**Expected Result:**
- ✅ Activities appear instantly
- ✅ Smooth slide-in animation
- ✅ Color-coded icons
- ✅ Relative timestamps ("2 seconds ago")
- ✅ Last 10 activities shown

---

### 6. **Test Real-Time Answers** 💬

**Steps:**
1. Open question in **Browser 1**
2. Open same question in **Browser 2**
3. In Browser 1: Post an answer
4. Watch Browser 2

**Expected Result:**
- ✅ Toast notification: "New answer posted!"
- ✅ Answer appears without refresh
- ✅ Answer count updates
- ✅ Smooth animation

---

### 7. **Test Online Users Count** 👥

**Steps:**
1. Open app in Browser 1 - note online count
2. Open app in Browser 2 - count increases
3. Close Browser 2 - count decreases in Browser 1

**Expected Result:**
- ✅ Count updates in real-time
- ✅ Accurate user tracking
- ✅ Smooth transitions

---

## 🐛 Troubleshooting

### Connection Issues:

**Problem**: Red "Offline" status
**Solutions:**
1. Check backend is running on port 3001
2. Check browser console for errors
3. Verify JWT token in localStorage
4. Try logout and login again

**Problem**: Features not updating
**Solutions:**
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache
3. Check Network tab for WebSocket connection
4. Restart backend server

**Problem**: "X online" shows 0
**Solutions:**
1. Ensure you're logged in
2. Check Socket.IO connection in Network tab
3. Look for WebSocket upgrade request
4. Verify backend Socket.IO is initialized

---

## 🔍 Developer Tools

### Check WebSocket Connection:

1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter by **WS** (WebSocket)
4. Look for connection to `localhost:3001`
5. Should show "101 Switching Protocols"

### Monitor Socket Events:

Add to browser console:
```javascript
// Listen to all socket events
const socket = window.socket; // If exposed
socket.onAny((event, ...args) => {
  console.log('Socket Event:', event, args);
});
```

### Check Connection Status:

```javascript
// In browser console
localStorage.getItem('token') // Should have JWT
```

---

## 📊 Performance Testing

### Load Test:
1. Open 5+ browser tabs
2. All navigate to same question
3. Check viewer count accuracy
4. Perform actions in different tabs
5. Verify all tabs update

### Stress Test:
1. Rapidly vote up/down
2. Type and stop repeatedly
3. Join/leave rooms quickly
4. Check for memory leaks
5. Monitor CPU usage

---

## ✅ Feature Checklist

Test each feature and check off:

- [ ] Live Viewers counter
- [ ] Connection Status widget
- [ ] Online Users count
- [ ] Live Vote Counter
- [ ] Typing Indicators
- [ ] Live Activity Feed
- [ ] Real-time Answers
- [ ] Real-time Comments
- [ ] Real-time Votes
- [ ] Disconnect/Reconnect handling

---

## 🎥 Demo Scenarios

### Scenario 1: Collaborative Q&A
1. User A posts question
2. User B sees it in Live Activity
3. User B opens question (viewer count: 2)
4. User B starts typing answer
5. User A sees "User B is typing..."
6. User B posts answer
7. User A sees answer instantly
8. User A upvotes
9. User B sees vote count increase

### Scenario 2: Live Engagement
1. Multiple users on same question
2. Viewer count shows all users
3. Users vote simultaneously
4. All see updates in real-time
5. Users comment
6. Comments appear instantly
7. Activity feed updates for all

---

## 🚀 Production Testing

Before deploying to production:

1. **Test with real users** (5-10 people)
2. **Monitor server logs** for errors
3. **Check memory usage** over time
4. **Test reconnection** after network issues
5. **Verify mobile responsiveness**
6. **Test different browsers** (Chrome, Firefox, Safari)
7. **Check CORS settings** for production URLs
8. **Monitor WebSocket connections** count
9. **Test with slow networks** (3G simulation)
10. **Verify security** (JWT validation)

---

## 📝 Test Results Template

```
Date: ___________
Tester: ___________

Feature: Live Viewers
Status: ✅ Pass / ❌ Fail
Notes: ___________

Feature: Connection Status
Status: ✅ Pass / ❌ Fail
Notes: ___________

Feature: Live Voting
Status: ✅ Pass / ❌ Fail
Notes: ___________

Feature: Typing Indicators
Status: ✅ Pass / ❌ Fail
Notes: ___________

Feature: Activity Feed
Status: ✅ Pass / ❌ Fail
Notes: ___________

Overall: ✅ Ready / ⚠️ Issues / ❌ Not Ready
```

---

## 🎉 Success Criteria

All features working = **READY FOR PRODUCTION** 🚀

**Happy Testing!** 🧪

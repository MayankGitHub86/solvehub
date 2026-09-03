# 🔧 Authorization Error - Troubleshooting Guide

## 🎯 Common Authorization Errors & Solutions

### Error: "Authentication token is required"
**Cause**: You're trying to access a protected feature without being logged in.

**Solutions**:
1. **Log in to your account**
   - Go to the login page
   - Enter your credentials
   - Or use OAuth (Google, GitHub, Microsoft)

2. **Check if you're logged in**
   - Look for your profile icon in the navbar
   - If not visible, you need to log in

---

### Error: "Token has expired"
**Cause**: Your JWT token has expired (default: 7 days).

**Solutions**:
1. **Clear browser storage and log in again**
   ```
   1. Open browser DevTools (F12)
   2. Go to Application/Storage tab
   3. Clear Local Storage
   4. Clear Session Storage
   5. Refresh page
   6. Log in again
   ```

2. **Quick fix - Logout and Login**
   - Click your profile icon
   - Click "Logout"
   - Log in again

---

### Error: "Invalid token"
**Cause**: Token is corrupted or malformed.

**Solutions**:
1. **Clear browser cache**
   ```
   Windows: Ctrl + Shift + Delete
   Mac: Cmd + Shift + Delete
   ```
   - Select "Cached images and files"
   - Select "Cookies and other site data"
   - Click "Clear data"

2. **Hard refresh**
   ```
   Windows: Ctrl + F5
   Mac: Cmd + Shift + R
   ```

---

### Error: "CORS Error"
**Cause**: Frontend and backend URLs don't match.

**Solutions**:
1. **Check environment variables**
   - Backend `.env`: `FRONTEND_URL=http://localhost:8080`
   - Frontend `.env`: `VITE_API_URL=http://localhost:3001/api`

2. **Restart both servers**
   ```bash
   # Stop processes
   # Then restart:
   
   # Backend
   cd backend
   npm start
   
   # Frontend
   cd frontend
   npm run dev
   ```

---

## 🔍 Diagnostic Steps

### Step 1: Check if you're logged in
```javascript
// Open browser console (F12)
console.log(localStorage.getItem('token'));
// Should show a JWT token if logged in
```

### Step 2: Check token validity
```javascript
// In browser console
const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token expires:', new Date(payload.exp * 1000));
  console.log('Current time:', new Date());
}
```

### Step 3: Check API connection
```javascript
// In browser console
fetch('http://localhost:3001/api/users?page=1&limit=1')
  .then(r => r.json())
  .then(d => console.log('API working:', d))
  .catch(e => console.error('API error:', e));
```

---

## 🛠️ Quick Fixes

### Fix 1: Clear Everything and Start Fresh
```bash
# 1. Clear browser data (Ctrl+Shift+Delete)
# 2. Close all browser tabs
# 3. Restart backend
cd backend
npm start

# 4. Restart frontend
cd frontend
npm run dev

# 5. Open http://localhost:8080
# 6. Register a new account or login
```

### Fix 2: Reset Local Storage
```javascript
// In browser console (F12)
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Fix 3: Check Backend is Running
```bash
# Should see:
# ✅ Server running on port 3001
# ✅ MongoDB connected successfully
```

### Fix 4: Check Frontend is Running
```bash
# Should see:
# VITE v5.x.x ready in xxx ms
# ➜ Local: http://localhost:8080/
```

---

## 🔐 Protected Routes

These features require authentication:
- ✅ Ask Question
- ✅ Post Answer
- ✅ Post Comment
- ✅ Vote (upvote/downvote)
- ✅ Follow Users
- ✅ Send Messages
- ✅ Edit Profile
- ✅ Save Questions
- ✅ Create Collections

**Solution**: Log in before using these features.

---

## 📝 Environment Variables Check

### Backend `.env` (Required):
```env
DATABASE_URL="mongodb+srv://..."
JWT_SECRET="your-secret-key"
PORT=3001
FRONTEND_URL=http://localhost:8080
OPENAI_API_KEY="sk-..."
```

### Frontend `.env` (Required):
```env
VITE_API_URL=http://localhost:3001/api
```

---

## 🐛 Common Issues

### Issue 1: "Cannot read properties of null"
**Cause**: Trying to access user data when not logged in.

**Solution**: Add authentication check in component:
```tsx
const { user } = useAuth();

if (!user) {
  return <div>Please log in to access this feature</div>;
}
```

### Issue 2: "Network Error"
**Cause**: Backend not running or wrong URL.

**Solution**:
1. Check backend is running on port 3001
2. Check `VITE_API_URL` in frontend `.env`
3. Restart both servers

### Issue 3: "401 Unauthorized"
**Cause**: Token expired or invalid.

**Solution**:
1. Clear local storage
2. Log in again
3. Token will be refreshed

---

## 🔄 Token Refresh Flow

### Current Implementation:
- Token expires after 7 days
- No automatic refresh
- User must log in again

### Manual Refresh:
1. Logout
2. Login again
3. New token generated

---

## 🧪 Test Authentication

### Test 1: Public Endpoints (No Auth Required)
```bash
# Should work without login
curl http://localhost:3001/api/questions
curl http://localhost:3001/api/users
curl http://localhost:3001/api/tags
```

### Test 2: Protected Endpoints (Auth Required)
```bash
# Should return 401 without token
curl http://localhost:3001/api/questions \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Test"}'

# Should work with token
curl http://localhost:3001/api/questions \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"Test","content":"Test","tags":["test"]}'
```

---

## 📞 Still Having Issues?

### Check Browser Console:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red errors
4. Share the error message

### Check Network Tab:
1. Open DevTools (F12)
2. Go to Network tab
3. Look for failed requests (red)
4. Click on failed request
5. Check Response tab for error details

### Check Backend Logs:
Look at the terminal where backend is running for error messages.

---

## ✅ Verification Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 8080
- [ ] MongoDB connected
- [ ] Environment variables set
- [ ] Logged in to account
- [ ] Token not expired
- [ ] Browser cache cleared
- [ ] Local storage has token
- [ ] No CORS errors in console
- [ ] API requests working

---

## 🎯 Quick Solution Summary

**Most Common Fix**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Clear local storage (F12 → Application → Local Storage → Clear)
3. Refresh page (F5)
4. Log in again

**If that doesn't work**:
1. Restart backend server
2. Restart frontend server
3. Clear browser data
4. Register new account or login

---

## 💡 Prevention Tips

1. **Don't close browser tabs** - Keeps you logged in
2. **Use "Remember Me"** - If implemented
3. **Bookmark the site** - Easy access
4. **Keep servers running** - Don't stop processes
5. **Regular logins** - Before token expires

---

## 🔧 Developer Notes

### JWT Token Structure:
```javascript
{
  userId: "user_id_here",
  email: "user@example.com",
  iat: 1234567890,  // Issued at
  exp: 1234567890   // Expires at (7 days)
}
```

### Token Storage:
- Stored in `localStorage` with key `token`
- Sent in `Authorization` header as `Bearer <token>`
- Validated on every protected route

### Authentication Flow:
1. User logs in
2. Backend generates JWT token
3. Frontend stores token in localStorage
4. Frontend sends token with every request
5. Backend validates token
6. Request processed if valid

---

**Status**: 🔧 Troubleshooting Guide  
**Last Updated**: December 24, 2025  
**Version**: 1.0


# 🔐 Login Credentials - SolveHub

## ✅ All Authentication Methods Working

### 📧 Email/Password Login
**Password for ALL users: `password123`**

You can login with any of these emails:

1. **Priya Sharma** - `priya.sharma@example.com`
2. **Ananya Patel** - `ananya.patel@example.com`
3. **Rahul Kumar** - `rahul.kumar@example.com`
4. **Kavya Reddy** - `kavya.reddy@example.com`
5. **Arjun Singh** - `arjun.singh@example.com`
6. **Kshitiz** - `kshitiz23@gmail.com`
7. **Lakshya** - `lakshya.32@gmail.com`
8. **Kshitiz** - `kshitiz123@gmail.com`
9. **Mayank Pandey** - `mayankpandey5515@outlook.com`
10. **Mayank** - `pandeymp8602@gmail.com`
11. **Mayank Pandey** - `pandeymp086@gmail.com`
12. **MayankGitHub86** - `mayankpandey23@lpu.in`
13. **Test User** - `test@example.com`

---

### 🔑 OAuth Login (Social Login)

All OAuth providers are fully configured and working:

#### 1. **Google OAuth** ✅
- Click "Google" button on login page
- Sign in with your Google account
- Automatically creates/logs in user

#### 2. **Microsoft OAuth** ✅
- Click "Microsoft" button on login page
- Sign in with your Microsoft account
- Automatically creates/logs in user

#### 3. **GitHub OAuth** ✅
- Click "GitHub" button on login page
- Authorize with your GitHub account
- Automatically creates/logs in user

---

## 🚀 Quick Start

1. **Go to:** http://localhost:8080
2. **Click:** Login button
3. **Choose:**
   - Email/Password (use any email above with password: `password123`)
   - OR click Google/Microsoft/GitHub button

---

## 🔧 Backend Configuration

All OAuth credentials are configured in `.env`:

```env
# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

---

## ✨ Features Available After Login

- ✅ Ask Questions
- ✅ Post Answers
- ✅ Comment on Answers
- ✅ Mention Users (@username)
- ✅ AI Answer Suggestions (SambaNova - FREE)
- ✅ Direct Messages
- ✅ Follow Users
- ✅ Save Questions
- ✅ Vote on Questions/Answers
- ✅ Earn Badges & Achievements
- ✅ Real-time Notifications
- ✅ User Profile
- ✅ Leaderboard
- ✅ Tags & Collections

---

## 🛠️ Scripts Available

### Reset All Passwords
```bash
cd lumina-share/backend
node reset-all-passwords.js
```
Sets password to `password123` for all users.

### Create Test User
```bash
cd lumina-share/backend
node create-test-user.js
```
Creates `test@example.com` with password `test123`.

### Check Existing Users
```bash
cd lumina-share/backend
node check-users.js
```
Lists all users in database.

---

## 📝 Notes

- OAuth users don't need passwords (empty password field in database)
- Email/password users have bcrypt-hashed passwords
- All authentication uses JWT tokens (7-day expiry)
- Tokens stored in localStorage
- Backend validates tokens on protected routes

---

**Last Updated:** December 25, 2024
**Status:** ✅ All authentication methods working

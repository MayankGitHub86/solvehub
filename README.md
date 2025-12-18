<<<<<<< HEAD
# Lumina Share - Community Q&A Platform

A modern, full-stack Q&A and community platform where developers can ask questions, share knowledge, and build their reputation.

## 🌟 Features

- 🔐 **Authentication** - Secure JWT-based user authentication
- ❓ **Questions & Answers** - Ask questions and provide detailed answers
- 🏷️ **Tag System** - Organize content with tags
- 👍 **Voting** - Upvote/downvote questions and answers
- 💬 **Comments** - Engage in discussions
- 🏆 **Leaderboard** - Compete and track top contributors
- 🎖️ **Badges** - Earn achievements for contributions
- 💾 **Save Questions** - Bookmark interesting questions
- 🔍 **Search & Filter** - Find content easily
- 📊 **User Profiles** - Track stats and contributions

## 🚀 Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for blazing fast dev experience
- TanStack Query for data fetching
- Tailwind CSS for styling
- shadcn/ui for beautiful components
- React Router for navigation

### Backend
- Node.js with Express.js
- TypeScript
- Prisma ORM
- SQLite database (easily switchable to PostgreSQL/MySQL)
- JWT authentication
- Express validator for input validation

## 📦 Project Structure

```
lumina-share-main/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utilities and API client
├── backend/               # Backend API server
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   └── lib/           # Utilities
│   └── prisma/            # Database schema and migrations
└── public/                # Static assets
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd lumina-share-main
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Set up the backend**
```bash
cd backend
npm install

# Copy environment variables
cp .env.example .env

# Generate Prisma client and run migrations
npm run prisma:generate
npm run prisma:migrate

# (Optional) Seed the database with sample data
npx tsx prisma/seed.ts
```

4. **Configure environment variables**

Frontend (`.env` in root):
```env
VITE_API_URL=http://localhost:3001/api
```

Backend (`backend/.env`):
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

### Running the Application

You need to run both the frontend and backend servers:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
The API will be available at `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
npx vite
```
The app will be available at `http://localhost:8080`

## 📚 API Documentation

See [backend/README.md](backend/README.md) for complete API documentation.

### Sample API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/questions` - Get all questions
- `POST /api/questions` - Create question (auth required)
- `GET /api/users/leaderboard` - Get leaderboard
- `POST /api/votes` - Vote on content (auth required)

## 🧪 Testing

Sample login credentials (after seeding):
- Email: `emma@example.com` / Password: `password123`
- Email: `john@example.com` / Password: `password123`
- Email: `lisa@example.com` / Password: `password123`

## 🗄️ Database

The application uses SQLite by default for easy setup. To switch to PostgreSQL or MySQL:

1. Update `backend/prisma/schema.prisma`:
```prisma
datasource db {
	provider = "postgresql"  // or "mysql"
	url      = env("DATABASE_URL")
}
```

2. Update `DATABASE_URL` in `backend/.env`
3. Run migrations: `npm run prisma:migrate`

## 🚀 Deployment

### Frontend
- Build: `npm run build`
- Deploy the `dist` folder to any static hosting (Vercel, Netlify, etc.)

### Backend
- Build: `cd backend && npm run build`
- Deploy to any Node.js hosting (Railway, Render, Heroku, etc.)
- Update `VITE_API_URL` in frontend to point to your deployed backend

## 📝 License

MIT
=======
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

>>>>>>> 20a36825eeb7c80c6c05af70e41f3fb47753d6d4
**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

# SolveHub Backend

RESTful API backend for SolveHub community platform built with Express.js, TypeScript, and Prisma.

## Features

- 🔐 JWT Authentication
- 👥 User Management & Profiles
- ❓ Questions & Answers
- 🏷️ Tag System
- 👍 Voting System
- 💬 Comments
- 🏆 Leaderboard & Points
- 🎖️ Badges System
- 💾 SQLite Database (easily switchable to PostgreSQL/MySQL)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite (Prisma ORM)
- **Authentication**: JWT
- **Validation**: express-validator

## Getting Started

### Prerequisites

- Node.js 18+ or npm

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and update the values:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

4. Generate Prisma client and run migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. (Optional) Seed the database with sample data:
```bash
npx tsx prisma/seed.ts
```

### Development

Start the development server with hot reload:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### Production

Build the project:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/leaderboard` - Get leaderboard
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/stats` - Get user statistics
- `PUT /api/users/:id` - Update user (authenticated)

### Questions
- `GET /api/questions` - Get all questions (with filters)
- `GET /api/questions/trending` - Get trending questions
- `GET /api/questions/:id` - Get question by ID
- `POST /api/questions` - Create question (authenticated)
- `PUT /api/questions/:id` - Update question (authenticated)
- `DELETE /api/questions/:id` - Delete question (authenticated)
- `POST /api/questions/:id/save` - Save question (authenticated)
- `DELETE /api/questions/:id/save` - Unsave question (authenticated)

### Answers
- `GET /api/answers/question/:questionId` - Get answers for a question
- `POST /api/answers` - Create answer (authenticated)
- `PUT /api/answers/:id` - Update answer (authenticated)
- `DELETE /api/answers/:id` - Delete answer (authenticated)
- `POST /api/answers/:id/accept` - Accept answer (authenticated)

### Tags
- `GET /api/tags` - Get all tags
- `GET /api/tags/popular` - Get popular tags
- `GET /api/tags/:id/questions` - Get questions by tag

### Votes
- `POST /api/votes` - Vote on question/answer (authenticated)

### Comments
- `POST /api/comments` - Create comment (authenticated)
- `PUT /api/comments/:id` - Update comment (authenticated)
- `DELETE /api/comments/:id` - Delete comment (authenticated)

## Database Schema

The database includes the following models:
- **User**: User accounts and profiles
- **Question**: Questions posted by users
- **Answer**: Answers to questions
- **Tag**: Tags for categorizing questions
- **Vote**: Upvotes/downvotes on questions and answers
- **Comment**: Comments on questions and answers
- **Badge**: Achievement badges
- **UserBadge**: Badges earned by users
- **SavedQuestion**: Questions saved by users

## Points System

- Answer a question: +10 points
- Get your answer accepted: +25 points
- Get an upvote: +5 points
- Get a downvote: -5 points

## Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | Database connection string | file:./dev.db |
| JWT_SECRET | Secret key for JWT tokens | (required) |
| PORT | Server port | 3001 |
| NODE_ENV | Environment mode | development |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:8080 |

## License

MIT

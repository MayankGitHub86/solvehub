# SolveHub Backend API

A robust backend API for the SolveHub community platform built with Express.js, MongoDB, and Prisma.

## 🚀 Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run database migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Seed the database (optional):
```bash
npm run prisma:seed
```

5. Start development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## 📦 Deployment to Vercel

### Quick Deploy

1. Push to GitHub:
```bash
git add .
git commit -m "Deploy backend"
git push origin main
```

2. Deploy to Vercel:
```bash
npm install -g vercel
vercel login
vercel --prod
```

3. Set environment variables in Vercel Dashboard (see `.env.production` template)

4. Update OAuth redirect URIs in Google/Microsoft consoles

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 🔧 Environment Variables

Required variables:
- `DATABASE_URL` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `FRONTEND_URL` - Your frontend application URL
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - Google OAuth
- `SAMBANOVA_API_KEY` - AI features

See `.env.example` for complete list.

## 📚 API Documentation

### Health Check
```
GET /api/health
```

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### OAuth
- `GET /api/auth/oauth/google` - Google OAuth
- `GET /api/auth/oauth/microsoft` - Microsoft OAuth

### Questions
- `GET /api/questions` - List questions
- `POST /api/questions` - Create question
- `GET /api/questions/:id` - Get question details
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Answers
- `POST /api/answers` - Create answer
- `PUT /api/answers/:id` - Update answer
- `DELETE /api/answers/:id` - Delete answer

### Users
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### And more... (Tags, Votes, Comments, Notifications, etc.)

## 🛠️ Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run API tests
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:seed` - Seed database with sample data

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── server.js        # Express app setup
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.js          # Database seeding
├── .env                 # Local environment variables
├── .env.example         # Environment template
├── .env.production      # Production template
├── vercel.json          # Vercel configuration
└── package.json
```

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Helmet.js security headers
- CORS configuration
- Rate limiting
- Input validation
- Content moderation

## 🌐 CORS Configuration

The API accepts requests from:
- `http://localhost:8080` (local development)
- `http://localhost:5173` (Vite dev server)
- Your configured `FRONTEND_URL`

Update `FRONTEND_URL` in environment variables for production.

## 📝 License

MIT

## 👥 Support

For issues or questions, please open an issue on GitHub.

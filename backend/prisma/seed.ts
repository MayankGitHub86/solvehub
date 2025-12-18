import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'emma@example.com',
        username: 'emmawatson',
        name: 'Emma Watson',
        password: await bcrypt.hash('password123', 10),
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
        bio: 'Full-stack developer passionate about React and Node.js',
        points: 12543,
        isOnline: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'john@example.com',
        username: 'johndoe',
        name: 'John Doe',
        password: await bcrypt.hash('password123', 10),
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        bio: 'DevOps engineer | Cloud architect | Open source enthusiast',
        points: 10234,
        isOnline: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'lisa@example.com',
        username: 'lisapark',
        name: 'Lisa Park',
        password: await bcrypt.hash('password123', 10),
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
        bio: 'AI/ML researcher exploring the frontiers of deep learning',
        points: 8976,
        isOnline: false,
      },
    }),
  ]);

  console.log('✅ Created users');

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'React', count: 150 } }),
    prisma.tag.create({ data: { name: 'Node.js', count: 120 } }),
    prisma.tag.create({ data: { name: 'TypeScript', count: 130 } }),
    prisma.tag.create({ data: { name: 'JavaScript', count: 200 } }),
    prisma.tag.create({ data: { name: 'Python', count: 180 } }),
    prisma.tag.create({ data: { name: 'Docker', count: 90 } }),
    prisma.tag.create({ data: { name: 'AWS', count: 75 } }),
    prisma.tag.create({ data: { name: 'Database', count: 110 } }),
  ]);

  console.log('✅ Created tags');

  // Create badges
  const badges = await Promise.all([
    prisma.badge.create({
      data: {
        name: 'Gold Contributor',
        description: 'Contributed 100+ high-quality answers',
        color: 'gold',
      },
    }),
    prisma.badge.create({
      data: {
        name: 'React Expert',
        description: 'Master of React development',
        color: 'blue',
      },
    }),
    prisma.badge.create({
      data: {
        name: 'DevOps Master',
        description: 'Expert in DevOps practices',
        color: 'green',
      },
    }),
  ]);

  console.log('✅ Created badges');

  // Assign badges to users
  await prisma.userBadge.createMany({
    data: [
      { userId: users[0].id, badgeId: badges[0].id },
      { userId: users[0].id, badgeId: badges[1].id },
      { userId: users[1].id, badgeId: badges[2].id },
    ],
  });

  console.log('✅ Assigned badges to users');

  // Create sample questions
  const question1 = await prisma.question.create({
    data: {
      title: 'How to implement infinite scroll with React Query?',
      content:
        "I'm building a feed that needs to load more content as the user scrolls. What's the best approach combining React Query with intersection observer? I want to ensure good performance and user experience.",
      preview:
        "I'm building a feed that needs to load more content as the user scrolls. What's the best approach combining React Query with intersection observer?",
      authorId: users[0].id,
      views: 234,
      isSolved: false,
      tags: {
        create: [
          { tagId: tags[0].id }, // React
          { tagId: tags[2].id }, // TypeScript
        ],
      },
    },
  });

  const question2 = await prisma.question.create({
    data: {
      title: 'Best practices for error handling in Express.js middleware',
      content:
        'Looking for a comprehensive error handling strategy for my Express application. How should I structure error middleware and handle async errors? What about validation errors and custom error types?',
      preview:
        'Looking for a comprehensive error handling strategy for my Express application. How should I structure error middleware and handle async errors?',
      authorId: users[1].id,
      views: 178,
      isSolved: true,
      tags: {
        create: [
          { tagId: tags[1].id }, // Node.js
          { tagId: tags[2].id }, // TypeScript
        ],
      },
    },
  });

  console.log('✅ Created questions');

  // Create sample answers
  const answer1 = await prisma.answer.create({
    data: {
      content:
        'You can use React Query\'s `useInfiniteQuery` hook combined with an Intersection Observer. Here\'s a great pattern:\n\n```tsx\nconst { data, fetchNextPage, hasNextPage } = useInfiniteQuery({\n  queryKey: ["posts"],\n  queryFn: ({ pageParam = 0 }) => fetchPosts(pageParam),\n  getNextPageParam: (lastPage) => lastPage.nextCursor,\n});\n```\n\nThen use a ref with Intersection Observer to trigger `fetchNextPage()` when the user scrolls to the bottom.',
      questionId: question1.id,
      authorId: users[2].id,
      isAccepted: false,
    },
  });

  const answer2 = await prisma.answer.create({
    data: {
      content:
        'For Express error handling, I recommend creating a centralized error handler middleware:\n\n```typescript\napp.use((err, req, res, next) => {\n  const statusCode = err.statusCode || 500;\n  res.status(statusCode).json({\n    success: false,\n    error: { message: err.message }\n  });\n});\n```\n\nFor async routes, use express-async-errors or wrap them in try-catch blocks.',
      questionId: question2.id,
      authorId: users[0].id,
      isAccepted: true,
    },
  });

  console.log('✅ Created answers');

  // Create sample votes
  await prisma.vote.createMany({
    data: [
      { userId: users[1].id, questionId: question1.id, value: 1 },
      { userId: users[2].id, questionId: question1.id, value: 1 },
      { userId: users[0].id, answerId: answer1.id, value: 1 },
      { userId: users[1].id, answerId: answer2.id, value: 1 },
    ],
  });

  console.log('✅ Created votes');

  // Create sample comments
  await prisma.comment.createMany({
    data: [
      {
        content: 'This is exactly what I was looking for! Thanks!',
        userId: users[0].id,
        answerId: answer1.id,
      },
      {
        content: 'Great explanation. This pattern works perfectly.',
        userId: users[2].id,
        questionId: question2.id,
      },
    ],
  });

  console.log('✅ Created comments');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

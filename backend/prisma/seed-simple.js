const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting simple database seed...');

  try {
    // Create users
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await Promise.all([
      prisma.user.create({
        data: {
          name: 'Rahul Kumar',
          email: 'rahul.kumar@example.com',
          username: 'rahul_kumar',
          password: hashedPassword,
          bio: 'Full-stack developer passionate about React and Node.js',
          points: 150,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
        },
      }),
      prisma.user.create({
        data: {
          name: 'Ananya Patel',
          email: 'ananya.patel@example.com',
          username: 'ananya_patel',
          password: hashedPassword,
          bio: 'Python developer and data science enthusiast',
          points: 200,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya',
        },
      }),
      prisma.user.create({
        data: {
          name: 'Kavya Reddy',
          email: 'kavya.reddy@example.com',
          username: 'kavya_reddy',
          password: hashedPassword,
          bio: 'Frontend developer specializing in React and TypeScript',
          points: 180,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kavya',
        },
      }),
      prisma.user.create({
        data: {
          name: 'Priya Sharma',
          email: 'priya.sharma@example.com',
          username: 'priya_sharma',
          password: hashedPassword,
          bio: 'Backend engineer working with Node.js and MongoDB',
          points: 220,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
        },
      }),
      prisma.user.create({
        data: {
          name: 'Arjun Singh',
          email: 'arjun.singh@example.com',
          username: 'arjun_singh',
          password: hashedPassword,
          bio: 'DevOps engineer and cloud architecture expert',
          points: 190,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',
        },
      }),
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create tags
    console.log('Creating tags...');
    const tags = await Promise.all([
      prisma.tag.create({ data: { name: 'JavaScript', description: 'High-level programming language' } }),
      prisma.tag.create({ data: { name: 'Python', description: 'General-purpose programming language' } }),
      prisma.tag.create({ data: { name: 'React', description: 'JavaScript library for building UIs' } }),
      prisma.tag.create({ data: { name: 'Node.js', description: 'JavaScript runtime' } }),
      prisma.tag.create({ data: { name: 'TypeScript', description: 'Typed superset of JavaScript' } }),
      prisma.tag.create({ data: { name: 'MongoDB', description: 'NoSQL database' } }),
      prisma.tag.create({ data: { name: 'Express', description: 'Web framework for Node.js' } }),
      prisma.tag.create({ data: { name: 'CSS', description: 'Styling language' } }),
      prisma.tag.create({ data: { name: 'HTML', description: 'Markup language' } }),
      prisma.tag.create({ data: { name: 'Git', description: 'Version control system' } }),
    ]);

    console.log(`✅ Created ${tags.length} tags`);

    // Create questions
    console.log('Creating questions...');
    const questions = [];
    
    const question1 = await prisma.question.create({
      data: {
        title: 'How to use React hooks effectively?',
        content: 'I am learning React and want to understand the best practices for using hooks like useState and useEffect.',
        authorId: users[0].id,
        views: 45,
        votes: 5,
      },
    });
    questions.push(question1);

    const question2 = await prisma.question.create({
      data: {
        title: 'What is the difference between let and const in JavaScript?',
        content: 'Can someone explain when to use let vs const in JavaScript? I am confused about their scope and mutability.',
        authorId: users[1].id,
        views: 78,
        votes: 8,
      },
    });
    questions.push(question2);

    const question3 = await prisma.question.create({
      data: {
        title: 'How to connect MongoDB with Node.js?',
        content: 'I want to build a REST API using Node.js and MongoDB. What is the best way to connect them?',
        authorId: users[2].id,
        views: 92,
        votes: 12,
      },
    });
    questions.push(question3);

    const question4 = await prisma.question.create({
      data: {
        title: 'Best practices for TypeScript in React projects?',
        content: 'What are the recommended patterns and best practices when using TypeScript with React?',
        authorId: users[3].id,
        views: 65,
        votes: 7,
      },
    });
    questions.push(question4);

    const question5 = await prisma.question.create({
      data: {
        title: 'How to deploy a Node.js app to production?',
        content: 'What are the steps to deploy a Node.js application to a production server? Any recommendations for hosting?',
        authorId: users[4].id,
        views: 110,
        votes: 15,
      },
    });
    questions.push(question5);

    console.log(`✅ Created ${questions.length} questions`);

    // Link tags to questions
    console.log('Linking tags to questions...');
    await prisma.questionTag.create({ data: { questionId: question1.id, tagId: tags[2].id } }); // React
    await prisma.questionTag.create({ data: { questionId: question1.id, tagId: tags[0].id } }); // JavaScript
    await prisma.questionTag.create({ data: { questionId: question2.id, tagId: tags[0].id } }); // JavaScript
    await prisma.questionTag.create({ data: { questionId: question3.id, tagId: tags[3].id } }); // Node.js
    await prisma.questionTag.create({ data: { questionId: question3.id, tagId: tags[5].id } }); // MongoDB
    await prisma.questionTag.create({ data: { questionId: question4.id, tagId: tags[4].id } }); // TypeScript
    await prisma.questionTag.create({ data: { questionId: question4.id, tagId: tags[2].id } }); // React
    await prisma.questionTag.create({ data: { questionId: question5.id, tagId: tags[3].id } }); // Node.js

    console.log('✅ Linked tags to questions');

    // Create answers
    console.log('Creating answers...');
    await prisma.answer.create({
      data: {
        content: 'React hooks are functions that let you use state and lifecycle features in functional components. Start with useState for state management and useEffect for side effects.',
        questionId: question1.id,
        authorId: users[1].id,
        votes: 3,
      },
    });

    await prisma.answer.create({
      data: {
        content: 'The main difference is that let allows reassignment while const does not. Both are block-scoped. Use const by default and only use let when you need to reassign.',
        questionId: question2.id,
        authorId: users[2].id,
        votes: 5,
        isAccepted: true,
      },
    });

    await prisma.answer.create({
      data: {
        content: 'You can use Mongoose as an ODM to connect MongoDB with Node.js. Install it with npm install mongoose, then use mongoose.connect() with your connection string.',
        questionId: question3.id,
        authorId: users[3].id,
        votes: 8,
        isAccepted: true,
      },
    });

    console.log('✅ Created answers');

    console.log('\n🎉 Database seeded successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Tags: ${tags.length}`);
    console.log(`   - Questions: ${questions.length}`);
    console.log(`   - Answers: 3`);
    console.log(`\n👤 Test accounts (all use password: password123):`);
    users.forEach(user => {
      console.log(`   - ${user.email}`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

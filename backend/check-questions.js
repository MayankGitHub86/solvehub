const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkQuestions() {
  const count = await prisma.question.count();
  console.log('📊 Total questions in database:', count);
  
  if (count === 0) {
    console.log('⚠️  No questions found! Database was cleared.');
    console.log('💡 Run: npm run prisma:seed:indian to add sample questions');
  } else {
    const questions = await prisma.question.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log('\n📝 Recent questions:');
    questions.forEach((q, i) => {
      console.log(`${i + 1}. ${q.title}`);
    });
  }
  
  await prisma.$disconnect();
}

checkQuestions();

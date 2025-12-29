const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('🗑️  Clearing all data from database...');

    // Delete in correct order (respecting foreign key constraints)
    await prisma.comment.deleteMany({});
    console.log('✅ Cleared comments');

    await prisma.vote.deleteMany({});
    console.log('✅ Cleared votes');

    await prisma.answer.deleteMany({});
    console.log('✅ Cleared answers');

    await prisma.savedQuestion.deleteMany({});
    console.log('✅ Cleared saved questions');

    await prisma.collectionQuestion.deleteMany({});
    console.log('✅ Cleared collection questions');

    await prisma.collection.deleteMany({});
    console.log('✅ Cleared collections');

    await prisma.questionTag.deleteMany({});
    console.log('✅ Cleared question tags');

    await prisma.question.deleteMany({});
    console.log('✅ Cleared questions');

    await prisma.tag.deleteMany({});
    console.log('✅ Cleared tags');

    await prisma.message.deleteMany({});
    console.log('✅ Cleared messages');

    await prisma.conversation.deleteMany({});
    console.log('✅ Cleared conversations');

    await prisma.review.deleteMany({});
    console.log('✅ Cleared reviews');

    await prisma.userChallenge.deleteMany({});
    console.log('✅ Cleared user challenges');

    await prisma.challenge.deleteMany({});
    console.log('✅ Cleared challenges');

    await prisma.userBadge.deleteMany({});
    console.log('✅ Cleared user badges');

    await prisma.badge.deleteMany({});
    console.log('✅ Cleared badges');

    await prisma.follow.deleteMany({});
    console.log('✅ Cleared follows');

    await prisma.user.deleteMany({});
    console.log('✅ Cleared users');

    console.log('🎉 Database cleared successfully!');
    console.log('📝 You can now create real users and content.');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();

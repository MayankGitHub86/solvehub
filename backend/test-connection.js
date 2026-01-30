const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  
  try {
    // Test 1: Basic connection
    console.log('Test 1: Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!\n');
    
    // Test 2: Count users
    console.log('Test 2: Counting users...');
    const userCount = await prisma.user.count();
    console.log(`✅ Users in database: ${userCount}\n`);
    
    // Test 3: Count questions
    console.log('Test 3: Counting questions...');
    const questionCount = await prisma.question.count();
    console.log(`✅ Questions in database: ${questionCount}\n`);
    
    // Test 4: Count answers
    console.log('Test 4: Counting answers...');
    const answerCount = await prisma.answer.count();
    console.log(`✅ Answers in database: ${answerCount}\n`);
    
    // Test 5: Count notifications
    console.log('Test 5: Counting notifications...');
    const notificationCount = await prisma.notification.count();
    console.log(`✅ Notifications in database: ${notificationCount}\n`);
    
    // Test 6: Count badges
    console.log('Test 6: Counting badges...');
    const badgeCount = await prisma.badge.count();
    console.log(`✅ Badges in database: ${badgeCount}\n`);
    
    // Test 7: Get sample user
    console.log('Test 7: Fetching sample user...');
    const sampleUser = await prisma.user.findFirst();
    if (sampleUser) {
      console.log(`✅ Sample user: ${sampleUser.name} (${sampleUser.email})\n`);
    }
    
    console.log('🎉 All database tests passed!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Questions: ${questionCount}`);
    console.log(`   - Answers: ${answerCount}`);
    console.log(`   - Notifications: ${notificationCount}`);
    console.log(`   - Badges: ${badgeCount}`);
    
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    console.error('\n💡 Possible solutions:');
    console.error('   1. Check your internet connection');
    console.error('   2. Verify MongoDB Atlas cluster is running');
    console.error('   3. Check if your IP is whitelisted in MongoDB Atlas');
    console.error('   4. Verify DATABASE_URL in .env file');
    console.error('   5. Check MongoDB Atlas network access settings');
  } finally {
    await prisma.$disconnect();
    process.exit();
  }
}

testConnection();

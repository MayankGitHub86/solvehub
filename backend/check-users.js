const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        email: true,
        username: true,
        name: true,
      }
    });

    console.log('\n=== Existing Users ===\n');
    if (users.length === 0) {
      console.log('No users found in database.');
      console.log('\nPlease register a new account at: http://localhost:8080');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Username: ${user.username}`);
        console.log('');
      });
      console.log('Note: Passwords are hashed and cannot be displayed.');
      console.log('If you forgot your password, please register a new account.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();

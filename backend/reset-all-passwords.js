const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetAllPasswords() {
  try {
    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
      }
    });

    if (users.length === 0) {
      console.log('\n❌ No users found in database.');
      console.log('\nPlease register a new account at: http://localhost:8080');
      await prisma.$disconnect();
      return;
    }

    console.log('\n🔄 Resetting passwords for all users...\n');

    // Update all users with the new password
    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
    }

    console.log('✅ All passwords have been reset!\n');
    console.log('=== Login Credentials ===\n');
    console.log('Password for ALL users: password123\n');
    console.log('Available users:\n');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No Name'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Username: ${user.username}`);
      console.log('');
    });

    console.log('Go to: http://localhost:8080');
    console.log('\nYou can now login with any email above using password: password123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetAllPasswords();

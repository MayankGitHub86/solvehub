const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const email = 'test@example.com';
    const username = 'testuser';
    const password = 'test123';
    
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      console.log('\n✅ Test user already exists!');
      console.log('\nLogin Credentials:');
      console.log('Email: test@example.com');
      console.log('Password: test123');
      console.log('\nGo to: http://localhost:8080');
      await prisma.$disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        name: 'Test User',
        password: hashedPassword,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser',
      }
    });

    console.log('\n✅ Test user created successfully!');
    console.log('\nLogin Credentials:');
    console.log('Email: test@example.com');
    console.log('Password: test123');
    console.log('\nGo to: http://localhost:8080');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();

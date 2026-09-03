const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    // Get the user ID from the error (694ec3a3b6035d5c568e8764)
    const userId = '694ec3a3b6035d5c568e8764';
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (user) {
      console.log('✅ User exists:');
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Name:', user.name);
    } else {
      console.log('❌ User NOT found with ID:', userId);
      console.log('\n📋 Available users:');
      const allUsers = await prisma.user.findMany({
        select: { id: true, email: true, name: true }
      });
      allUsers.forEach(u => {
        console.log(`- ${u.email} (ID: ${u.id})`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();

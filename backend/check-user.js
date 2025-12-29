const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  const userId = '694ec3a3b6035d5c568e8764';
  const user = await prisma.user.findUnique({ 
    where: { id: userId },
    select: { id: true, name: true, email: true }
  });
  
  if (user) {
    console.log('✅ User exists:', user.name, '-', user.email);
  } else {
    console.log('❌ User ID from token does NOT exist in database');
    console.log('💡 Solution: Logout and login again with a valid account');
    
    // Show available users
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
      take: 5
    });
    
    console.log('\n📝 Available users:');
    users.forEach(u => {
      console.log(`   - ${u.name} (${u.email})`);
    });
  }
  
  await prisma.$disconnect();
}

checkUser();

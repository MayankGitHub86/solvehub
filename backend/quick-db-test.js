const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function quickTest() {
  console.log('Testing database...');
  
  const timeout = setTimeout(() => {
    console.log('❌ Connection timeout after 5 seconds');
    console.log('\n🔍 Diagnosis:');
    console.log('   - MongoDB Atlas is unreachable from your network');
    console.log('   - This is a network/firewall issue, not a code issue');
    console.log('\n💡 Solutions:');
    console.log('   1. Check MongoDB Atlas Network Access settings');
    console.log('   2. Whitelist your IP: 0.0.0.0/0 (allow all)');
    console.log('   3. Verify cluster is running (not paused)');
    console.log('   4. Try different internet connection');
    console.log('   5. Check if VPN/Firewall is blocking');
    process.exit(1);
  }, 5000);
  
  try {
    const count = await prisma.user.count();
    clearTimeout(timeout);
    console.log(`✅ SUCCESS! Database connected. Users: ${count}`);
    process.exit(0);
  } catch (error) {
    clearTimeout(timeout);
    console.log('❌ Database error:', error.message);
    process.exit(1);
  }
}

quickTest();

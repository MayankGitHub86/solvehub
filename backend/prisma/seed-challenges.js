const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const challenges = [
  {
    name: 'Answer Seeker',
    description: 'Answer 3 questions today',
    type: 'daily',
    requirement: 'answer_3',
    points: 20,
    icon: '💡',
  },
  {
    name: 'Helpful Hand',
    description: 'Get 5 upvotes today',
    type: 'daily',
    requirement: 'upvotes_5',
    points: 15,
    icon: '👍',
  },
  {
    name: 'Question Master',
    description: 'Ask 2 quality questions today',
    type: 'daily',
    requirement: 'ask_2',
    points: 10,
    icon: '❓',
  },
  {
    name: 'Community Helper',
    description: 'Comment on 5 posts today',
    type: 'daily',
    requirement: 'comment_5',
    points: 10,
    icon: '💬',
  },
  {
    name: 'Early Bird',
    description: 'Be active before 9 AM',
    type: 'daily',
    requirement: 'early_bird',
    points: 5,
    icon: '🌅',
  },
  {
    name: 'Night Owl',
    description: 'Be active after 10 PM',
    type: 'daily',
    requirement: 'night_owl',
    points: 5,
    icon: '🦉',
  },
  {
    name: 'Weekly Warrior',
    description: 'Complete 5 daily challenges this week',
    type: 'weekly',
    requirement: 'complete_5_daily',
    points: 50,
    icon: '🏆',
  },
];

async function seedChallenges() {
  console.log('🎯 Seeding challenges...');

  for (const challenge of challenges) {
    try {
      await prisma.challenge.upsert({
        where: { name: challenge.name },
        update: challenge,
        create: challenge,
      });
      console.log(`✅ Created/Updated challenge: ${challenge.name}`);
    } catch (error) {
      console.error(`❌ Error creating challenge ${challenge.name}:`, error.message);
    }
  }

  console.log('✨ Challenge seeding complete!');
}

seedChallenges()
  .catch((e) => {
    console.error('❌ Error seeding challenges:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

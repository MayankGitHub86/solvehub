const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const badges = [
  // Getting Started Badges
  {
    name: 'First Steps',
    description: 'Asked your first question',
    icon: '🎯',
    category: 'getting-started',
    points: 10,
    requirement: 'Ask 1 question'
  },
  {
    name: 'First Answer',
    description: 'Provided your first answer',
    icon: '💡',
    category: 'getting-started',
    points: 10,
    requirement: 'Answer 1 question'
  },
  {
    name: 'Welcomed',
    description: 'Received your first upvote',
    icon: '👋',
    category: 'getting-started',
    points: 5,
    requirement: 'Get 1 upvote'
  },

  // Contribution Badges
  {
    name: 'Helpful Helper',
    description: 'Earned 100 total upvotes',
    icon: '⭐',
    category: 'contribution',
    points: 50,
    requirement: 'Get 100 upvotes'
  },
  {
    name: 'Problem Solver',
    description: 'Had 10 answers accepted',
    icon: '✅',
    category: 'contribution',
    points: 75,
    requirement: 'Get 10 accepted answers'
  },
  {
    name: 'Mentor',
    description: 'Had 50 answers accepted',
    icon: '👨‍🏫',
    category: 'contribution',
    points: 100,
    requirement: 'Get 50 accepted answers'
  },
  {
    name: 'Expert',
    description: 'Earned 1000 reputation points',
    icon: '🏆',
    category: 'contribution',
    points: 150,
    requirement: 'Earn 1000 points'
  },

  // Engagement Badges
  {
    name: 'Week Warrior',
    description: 'Active for 7 consecutive days',
    icon: '🔥',
    category: 'engagement',
    points: 25,
    requirement: '7 day streak'
  },
  {
    name: 'Month Master',
    description: 'Active for 30 consecutive days',
    icon: '📅',
    category: 'engagement',
    points: 100,
    requirement: '30 day streak'
  },
  {
    name: 'Curious Mind',
    description: 'Asked 25 questions',
    icon: '🤔',
    category: 'engagement',
    points: 50,
    requirement: 'Ask 25 questions'
  },
  {
    name: 'Knowledge Seeker',
    description: 'Saved 50 questions',
    icon: '📚',
    category: 'engagement',
    points: 30,
    requirement: 'Save 50 questions'
  },

  // Quality Badges
  {
    name: 'Popular Question',
    description: 'Asked a question with 100+ views',
    icon: '👀',
    category: 'quality',
    points: 40,
    requirement: 'Get 100 views on a question'
  },
  {
    name: 'Great Answer',
    description: 'Answer received 25+ upvotes',
    icon: '🌟',
    category: 'quality',
    points: 60,
    requirement: 'Get 25 upvotes on an answer'
  },
  {
    name: 'Detailed Writer',
    description: 'Posted 10 answers with 500+ characters',
    icon: '📝',
    category: 'quality',
    points: 35,
    requirement: 'Write 10 detailed answers'
  },

  // Community Badges
  {
    name: 'Team Player',
    description: 'Commented on 50 posts',
    icon: '💬',
    category: 'community',
    points: 20,
    requirement: 'Comment 50 times'
  },
  {
    name: 'Supporter',
    description: 'Upvoted 100 posts',
    icon: '👍',
    category: 'community',
    points: 15,
    requirement: 'Upvote 100 posts'
  },
  {
    name: 'Tag Expert',
    description: 'Answered 20 questions in a single tag',
    icon: '🏷️',
    category: 'community',
    points: 45,
    requirement: 'Answer 20 questions in one tag'
  },

  // Special Badges
  {
    name: 'Early Adopter',
    description: 'Joined SolveHub in its first month',
    icon: '🚀',
    category: 'special',
    points: 200,
    requirement: 'Join in first month'
  },
  {
    name: 'Night Owl',
    description: 'Posted 10 answers between midnight and 6 AM',
    icon: '🦉',
    category: 'special',
    points: 25,
    requirement: 'Post 10 answers at night'
  },
  {
    name: 'Speed Demon',
    description: 'Answered within 5 minutes 10 times',
    icon: '⚡',
    category: 'special',
    points: 40,
    requirement: 'Answer 10 questions within 5 minutes'
  },
  {
    name: 'Perfectionist',
    description: 'Had 10 answers with zero edits and 10+ upvotes',
    icon: '💎',
    category: 'special',
    points: 80,
    requirement: 'Perfect answers'
  }
];

async function seedBadges() {
  console.log('🎖️  Seeding badges...');

  for (const badge of badges) {
    try {
      await prisma.badge.upsert({
        where: { name: badge.name },
        update: badge,
        create: badge,
      });
      console.log(`✅ Created/Updated badge: ${badge.name}`);
    } catch (error) {
      console.error(`❌ Error creating badge ${badge.name}:`, error.message);
    }
  }

  console.log('✨ Badge seeding complete!');
}

seedBadges()
  .catch((e) => {
    console.error('❌ Error seeding badges:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

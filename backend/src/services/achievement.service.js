const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AchievementService {
  /**
   * Check and award badges to a user based on their activity
   */
  async checkAndAwardBadges(userId) {
    const earnedBadges = [];

    try {
      // Get user stats
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          questions: true,
          answers: {
            include: {
              votes: true,
            },
          },
          votes: true,
          comments: true,
          savedQuestions: true,
          badges: {
            include: {
              badge: true,
            },
          },
        },
      });

      if (!user) return earnedBadges;

      // Get all badges
      const allBadges = await prisma.badge.findMany();
      const userBadgeIds = user.badges.map(ub => ub.badgeId);

      // Check each badge
      for (const badge of allBadges) {
        // Skip if user already has this badge
        if (userBadgeIds.includes(badge.id)) continue;

        let shouldAward = false;

        // Check badge requirements
        switch (badge.name) {
          case 'First Steps':
            shouldAward = user.questions.length >= 1;
            break;

          case 'First Answer':
            shouldAward = user.answers.length >= 1;
            break;

          case 'Welcomed':
            shouldAward = this.getTotalUpvotes(user) >= 1;
            break;

          case 'Helpful Helper':
            shouldAward = this.getTotalUpvotes(user) >= 100;
            break;

          case 'Problem Solver':
            shouldAward = user.answers.filter(a => a.isAccepted).length >= 10;
            break;

          case 'Mentor':
            shouldAward = user.answers.filter(a => a.isAccepted).length >= 50;
            break;

          case 'Expert':
            shouldAward = user.points >= 1000;
            break;

          case 'Curious Mind':
            shouldAward = user.questions.length >= 25;
            break;

          case 'Knowledge Seeker':
            shouldAward = user.savedQuestions.length >= 50;
            break;

          case 'Team Player':
            shouldAward = user.comments.length >= 50;
            break;

          case 'Supporter':
            shouldAward = user.votes.filter(v => v.value > 0).length >= 100;
            break;

          // Add more badge checks as needed
        }

        if (shouldAward) {
          // Award the badge
          await prisma.userBadge.create({
            data: {
              userId: user.id,
              badgeId: badge.id,
            },
          });

          // Add points to user
          await prisma.user.update({
            where: { id: user.id },
            data: {
              points: {
                increment: badge.points,
              },
            },
          });

          earnedBadges.push(badge);
        }
      }

      return earnedBadges;
    } catch (error) {
      console.error('Error checking badges:', error);
      return earnedBadges;
    }
  }

  /**
   * Get total upvotes for a user (on questions and answers)
   */
  getTotalUpvotes(user) {
    let total = 0;

    // Count upvotes on answers
    user.answers.forEach(answer => {
      total += answer.votes.filter(v => v.value > 0).length;
    });

    return total;
  }

  /**
   * Get user's badges
   */
  async getUserBadges(userId) {
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: {
        earnedAt: 'desc',
      },
    });

    return userBadges.map(ub => ({
      ...ub.badge,
      earnedAt: ub.earnedAt,
    }));
  }

  /**
   * Get all available badges
   */
  async getAllBadges() {
    return await prisma.badge.findMany({
      orderBy: [
        { category: 'asc' },
        { points: 'desc' },
      ],
    });
  }

  /**
   * Get badge progress for a user
   */
  async getBadgeProgress(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        questions: true,
        answers: {
          include: {
            votes: true,
          },
        },
        votes: true,
        comments: true,
        savedQuestions: true,
        badges: {
          include: {
            badge: true,
          },
        },
      },
    });

    if (!user) return [];

    const allBadges = await prisma.badge.findMany();
    const userBadgeIds = user.badges.map(ub => ub.badgeId);

    return allBadges.map(badge => {
      const earned = userBadgeIds.includes(badge.id);
      let progress = 0;
      let total = 1;

      if (!earned) {
        // Calculate progress
        switch (badge.name) {
          case 'First Steps':
            progress = Math.min(user.questions.length, 1);
            total = 1;
            break;

          case 'First Answer':
            progress = Math.min(user.answers.length, 1);
            total = 1;
            break;

          case 'Welcomed':
            progress = Math.min(this.getTotalUpvotes(user), 1);
            total = 1;
            break;

          case 'Helpful Helper':
            progress = this.getTotalUpvotes(user);
            total = 100;
            break;

          case 'Problem Solver':
            progress = user.answers.filter(a => a.isAccepted).length;
            total = 10;
            break;

          case 'Mentor':
            progress = user.answers.filter(a => a.isAccepted).length;
            total = 50;
            break;

          case 'Expert':
            progress = user.points;
            total = 1000;
            break;

          case 'Curious Mind':
            progress = user.questions.length;
            total = 25;
            break;

          case 'Knowledge Seeker':
            progress = user.savedQuestions.length;
            total = 50;
            break;

          case 'Team Player':
            progress = user.comments.length;
            total = 50;
            break;

          case 'Supporter':
            progress = user.votes.filter(v => v.value > 0).length;
            total = 100;
            break;

          default:
            progress = 0;
            total = 1;
        }
      }

      return {
        ...badge,
        earned,
        progress: earned ? 100 : Math.min((progress / total) * 100, 100),
        current: progress,
        required: total,
      };
    });
  }
}

module.exports = new AchievementService();

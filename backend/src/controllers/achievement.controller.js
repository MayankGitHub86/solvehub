const achievementService = require('../services/achievement.service');

class AchievementController {
  /**
   * Get all badges
   */
  async getAllBadges(req, res) {
    try {
      const badges = await achievementService.getAllBadges();
      res.json(badges);
    } catch (error) {
      console.error('Error getting badges:', error);
      res.status(500).json({ error: 'Failed to get badges' });
    }
  }

  /**
   * Get user's earned badges
   */
  async getUserBadges(req, res) {
    try {
      const userId = req.params.userId || req.userId || req.user?.id;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const badges = await achievementService.getUserBadges(userId);
      res.json(badges);
    } catch (error) {
      console.error('Error getting user badges:', error);
      res.status(500).json({ error: 'Failed to get user badges' });
    }
  }

  /**
   * Get badge progress for current user
   */
  async getBadgeProgress(req, res) {
    try {
      // Check if user is authenticated (middleware sets req.userId)
      const userId = req.userId || req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const progress = await achievementService.getBadgeProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error('Error getting badge progress:', error);
      res.status(500).json({ error: 'Failed to get badge progress' });
    }
  }

  /**
   * Check and award badges (called after user actions)
   */
  async checkBadges(req, res) {
    try {
      const userId = req.userId || req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const earnedBadges = await achievementService.checkAndAwardBadges(userId);
      res.json({ earnedBadges });
    } catch (error) {
      console.error('Error checking badges:', error);
      res.status(500).json({ error: 'Failed to check badges' });
    }
  }
}

module.exports = new AchievementController();

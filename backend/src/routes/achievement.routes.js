const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievement.controller');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/badges', achievementController.getAllBadges);
router.get('/badges/user/:userId', achievementController.getUserBadges);

// Protected routes
router.get('/progress', authenticate, achievementController.getBadgeProgress);
router.post('/check', authenticate, achievementController.checkBadges);

module.exports = router;

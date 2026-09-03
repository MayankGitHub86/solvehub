const express = require('express');
const router = express.Router();
const followController = require('../controllers/follow.controller');
const { authenticate } = require('../middleware/auth');

// Follow/Unfollow (requires authentication)
router.post('/:userId/follow', authenticate, followController.followUser);
router.delete('/:userId/follow', authenticate, followController.unfollowUser);

// Get follow status (requires authentication)
router.get('/:userId/follow/status', authenticate, followController.getFollowStatus);

// Get followers/following (public)
router.get('/:userId/followers', followController.getFollowers);
router.get('/:userId/following', followController.getFollowing);

// Get follow stats (public)
router.get('/:userId/follow/stats', followController.getFollowStats);

module.exports = router;

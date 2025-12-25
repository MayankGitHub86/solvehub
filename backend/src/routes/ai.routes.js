const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { authenticate } = require('../middleware/auth');

// Public route to check availability
router.get('/availability', aiController.checkAvailability);

// Protected routes (require authentication)
router.post('/suggest-answer/:questionId', authenticate, aiController.suggestAnswer);
router.post('/suggest-tags', authenticate, aiController.suggestTags);
router.post('/find-similar', authenticate, aiController.findSimilar);
router.post('/improve-question', authenticate, aiController.improveQuestion);

module.exports = router;

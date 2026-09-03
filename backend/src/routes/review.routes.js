const { Router } = require('express');
const reviewController = require('../controllers/review.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();

// Public routes
router.get('/', reviewController.getAllReviews);

// Protected routes
router.get('/my-review', authenticate, reviewController.getUserReview);
router.post('/', authenticate, reviewController.createReview);
router.put('/:id', authenticate, reviewController.updateReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

module.exports = router;

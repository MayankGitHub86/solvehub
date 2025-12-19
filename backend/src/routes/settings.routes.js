const { Router } = require('express');
const { body } = require('express-validator');
const settingsController = require('../controllers/settings.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();

// All settings routes require authentication
router.use(authenticate);

// Get user profile
router.get('/profile', settingsController.getProfile);

// Update user profile
router.put(
  '/profile',
  [
    body('name').optional().trim().isLength({ min: 1 }).withMessage('Name cannot be empty'),
    body('username').optional().trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
    body('website').optional().trim().isURL().withMessage('Invalid URL'),
    body('github').optional().trim(),
    body('twitter').optional().trim(),
    body('linkedin').optional().trim(),
    body('location').optional().trim(),
    body('avatar').optional().trim().isURL().withMessage('Invalid avatar URL')
  ],
  settingsController.updateProfile
);

// Update email
router.put(
  '/email',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required for email change')
  ],
  settingsController.updateEmail
);

// Update password
router.put(
  '/password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  settingsController.updatePassword
);

// Update notification preferences
router.put('/notifications', settingsController.updateNotificationPreferences);

// Delete account
router.delete(
  '/account',
  [
    body('password').notEmpty().withMessage('Password is required to delete account')
  ],
  settingsController.deleteAccount
);

module.exports = router;

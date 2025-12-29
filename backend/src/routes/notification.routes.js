const { Router } = require('express');
const { notifications } = require('../services/notification.service');
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();

// Public SSE stream; allows optional userId query to target notifications
router.get('/stream', (req, res) => {
  const userId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
  notifications.subscribe(req, res, userId);
});

// Protected routes for database notifications
router.get('/', authenticate, notificationController.getNotifications);
router.get('/unread-count', authenticate, notificationController.getUnreadCount);
router.put('/:id/read', authenticate, notificationController.markAsRead);
router.put('/read-all', authenticate, notificationController.markAllAsRead);
router.delete('/:id', authenticate, notificationController.deleteNotification);
router.delete('/', authenticate, notificationController.deleteAllNotifications);

module.exports = router;

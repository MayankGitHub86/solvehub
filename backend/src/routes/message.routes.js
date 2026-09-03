const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Conversations
router.get('/conversations', messageController.getConversations);
router.post('/conversations', messageController.getOrCreateConversation);
router.delete('/conversations/:conversationId', messageController.deleteConversation);

// Messages
router.get('/conversations/:conversationId', messageController.getMessages);
router.post('/conversations/:conversationId', messageController.sendMessage);
router.put('/conversations/:conversationId/read', messageController.markAsRead);

// Unread count
router.get('/unread-count', messageController.getUnreadCount);

module.exports = router;

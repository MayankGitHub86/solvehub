const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const socketService = require('../services/socket.service');

// @desc    Get or create conversation with a user
// @route   POST /api/messages/conversations
// @access  Private
exports.getOrCreateConversation = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const currentUserId = req.userId;

  if (!userId) {
    throw ApiError.badRequest('User ID is required');
  }

  if (userId === currentUserId) {
    throw ApiError.badRequest('Cannot create conversation with yourself');
  }

  // Check if user exists
  const otherUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, username: true, avatar: true },
  });

  if (!otherUser) {
    throw ApiError.notFound('User not found');
  }

  // Find existing conversation (check both directions)
  let conversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        { participant1Id: currentUserId, participant2Id: userId },
        { participant1Id: userId, participant2Id: currentUserId },
      ],
    },
    include: {
      participant1: {
        select: { id: true, name: true, username: true, avatar: true },
      },
      participant2: {
        select: { id: true, name: true, username: true, avatar: true },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  // Create new conversation if doesn't exist
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participant1Id: currentUserId,
        participant2Id: userId,
      },
      include: {
        participant1: {
          select: { id: true, name: true, username: true, avatar: true },
        },
        participant2: {
          select: { id: true, name: true, username: true, avatar: true },
        },
        messages: true,
      },
    });
  }

  res.status(200).json(
    new ApiResponse(200, conversation, 'Conversation retrieved successfully')
  );
});

// @desc    Get all conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = asyncHandler(async (req, res) => {
  const currentUserId = req.userId;

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { participant1Id: currentUserId },
        { participant2Id: currentUserId },
      ],
    },
    include: {
      participant1: {
        select: { id: true, name: true, username: true, avatar: true, isOnline: true },
      },
      participant2: {
        select: { id: true, name: true, username: true, avatar: true, isOnline: true },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { lastMessageAt: 'desc' },
  });

  // Format conversations with other user info and unread count
  const formattedConversations = await Promise.all(
    conversations.map(async (conv) => {
      const otherUser =
        conv.participant1Id === currentUserId
          ? conv.participant2
          : conv.participant1;

      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: { not: currentUserId },
          isRead: false,
        },
      });

      return {
        id: conv.id,
        otherUser,
        lastMessage: conv.messages[0] || null,
        lastMessageAt: conv.lastMessageAt,
        unreadCount,
        createdAt: conv.createdAt,
      };
    })
  );

  res.status(200).json(
    new ApiResponse(200, formattedConversations, 'Conversations retrieved successfully')
  );
});

// @desc    Get messages in a conversation
// @route   GET /api/messages/conversations/:conversationId
// @access  Private
exports.getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const currentUserId = req.userId;
  const { page = 1, limit = 50 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Verify user is part of conversation
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [
        { participant1Id: currentUserId },
        { participant2Id: currentUserId },
      ],
    },
  });

  if (!conversation) {
    throw ApiError.notFound('Conversation not found or access denied');
  }

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.message.count({
      where: { conversationId },
    }),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    }, 'Messages retrieved successfully')
  );
});

// @desc    Send a message
// @route   POST /api/messages/conversations/:conversationId
// @access  Private
exports.sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { content } = req.body;
  const currentUserId = req.userId;

  if (!content || content.trim().length === 0) {
    throw ApiError.badRequest('Message content is required');
  }

  // Verify user is part of conversation
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [
        { participant1Id: currentUserId },
        { participant2Id: currentUserId },
      ],
    },
  });

  if (!conversation) {
    throw ApiError.notFound('Conversation not found or access denied');
  }

  // Create message
  const message = await prisma.message.create({
    data: {
      content: content.trim(),
      conversationId,
      senderId: currentUserId,
    },
  });

  // Update conversation lastMessageAt
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  // Get sender info
  const sender = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { id: true, name: true, username: true, avatar: true },
  });

  // Get recipient ID
  const recipientId =
    conversation.participant1Id === currentUserId
      ? conversation.participant2Id
      : conversation.participant1Id;

  // Create notification in database
  try {
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'message',
        title: 'New Message',
        message: `${sender.name} sent you a message`,
        link: `/messages?conversation=${conversationId}`,
        metadata: {
          conversationId,
          senderId: currentUserId,
          senderName: sender.name,
        },
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }

  // Emit real-time notification via Socket.IO
  socketService.notifyUser(recipientId, 'notification', {
    type: 'message',
    title: 'New Message',
    message: `${sender.name} sent you a message`,
    link: `/messages?conversation=${conversationId}`,
    data: {
      conversationId,
      message: {
        ...message,
        sender,
      },
    },
  });

  // Emit to conversation room
  socketService.emitToRoom(`conversation:${conversationId}`, 'message:new', {
    ...message,
    sender,
  });

  res.status(201).json(
    new ApiResponse(201, { ...message, sender }, 'Message sent successfully')
  );
});

// @desc    Mark messages as read
// @route   PUT /api/messages/conversations/:conversationId/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const currentUserId = req.userId;

  // Verify user is part of conversation
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [
        { participant1Id: currentUserId },
        { participant2Id: currentUserId },
      ],
    },
  });

  if (!conversation) {
    throw ApiError.notFound('Conversation not found or access denied');
  }

  // Mark all unread messages from other user as read
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: currentUserId },
      isRead: false,
    },
    data: { isRead: true },
  });

  res.status(200).json(
    new ApiResponse(200, null, 'Messages marked as read')
  );
});

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const currentUserId = req.userId;

  // Get all conversations
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { participant1Id: currentUserId },
        { participant2Id: currentUserId },
      ],
    },
    select: { id: true },
  });

  const conversationIds = conversations.map((c) => c.id);

  // Count unread messages
  const unreadCount = await prisma.message.count({
    where: {
      conversationId: { in: conversationIds },
      senderId: { not: currentUserId },
      isRead: false,
    },
  });

  res.status(200).json(
    new ApiResponse(200, { unreadCount }, 'Unread count retrieved successfully')
  );
});

// @desc    Delete a conversation
// @route   DELETE /api/messages/conversations/:conversationId
// @access  Private
exports.deleteConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const currentUserId = req.userId;

  // Verify user is part of conversation
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [
        { participant1Id: currentUserId },
        { participant2Id: currentUserId },
      ],
    },
  });

  if (!conversation) {
    throw ApiError.notFound('Conversation not found or access denied');
  }

  // Delete conversation (messages will be cascade deleted)
  await prisma.conversation.delete({
    where: { id: conversationId },
  });

  res.status(200).json(
    new ApiResponse(200, null, 'Conversation deleted successfully')
  );
});

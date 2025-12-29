const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { page = 1, limit = 20 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.notification.count({
      where: { userId },
    }),
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    }, 'Notifications retrieved successfully')
  );
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const unreadCount = await prisma.notification.count({
    where: { userId, isRead: false },
  });

  res.status(200).json(
    new ApiResponse(200, { unreadCount }, 'Unread count retrieved successfully')
  );
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  // Verify notification belongs to user
  const notification = await prisma.notification.findFirst({
    where: { id, userId },
  });

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  // Mark as read
  await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  res.status(200).json(
    new ApiResponse(200, null, 'Notification marked as read')
  );
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.userId;

  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  res.status(200).json(
    new ApiResponse(200, null, 'All notifications marked as read')
  );
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  // Verify notification belongs to user
  const notification = await prisma.notification.findFirst({
    where: { id, userId },
  });

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  await prisma.notification.delete({
    where: { id },
  });

  res.status(200).json(
    new ApiResponse(200, null, 'Notification deleted successfully')
  );
});

// @desc    Delete all notifications
// @route   DELETE /api/notifications
// @access  Private
exports.deleteAllNotifications = asyncHandler(async (req, res) => {
  const userId = req.userId;

  await prisma.notification.deleteMany({
    where: { userId },
  });

  res.status(200).json(
    new ApiResponse(200, null, 'All notifications deleted successfully')
  );
});

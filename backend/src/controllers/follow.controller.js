const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const socketService = require('../services/socket.service');

// @desc    Follow a user
// @route   POST /api/users/:userId/follow
// @access  Private
exports.followUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const followerId = req.userId;

  // Can't follow yourself
  if (userId === followerId) {
    throw ApiError.badRequest('You cannot follow yourself');
  }

  // Check if user exists
  const userToFollow = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userToFollow) {
    throw ApiError.notFound('User not found');
  }

  // Check if already following
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId: userId,
      },
    },
  });

  if (existingFollow) {
    throw ApiError.conflict('You are already following this user');
  }

  // Create follow relationship
  await prisma.follow.create({
    data: {
      followerId,
      followingId: userId,
    },
  });

  // Send notification to followed user
  socketService.emitNotification(userId, {
    type: 'follow',
    message: 'Someone started following you!',
    data: { followerId },
  });

  res.status(200).json(
    new ApiResponse(200, null, 'User followed successfully')
  );
});

// @desc    Unfollow a user
// @route   DELETE /api/users/:userId/follow
// @access  Private
exports.unfollowUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const followerId = req.userId;

  // Check if following
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId: userId,
      },
    },
  });

  if (!follow) {
    throw ApiError.notFound('You are not following this user');
  }

  // Delete follow relationship
  await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId,
        followingId: userId,
      },
    },
  });

  res.status(200).json(
    new ApiResponse(200, null, 'User unfollowed successfully')
  );
});

// @desc    Get user's followers
// @route   GET /api/users/:userId/followers
// @access  Public
exports.getFollowers = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [followers, total] = await Promise.all([
    prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            bio: true,
            points: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.follow.count({
      where: { followingId: userId },
    }),
  ]);

  const formattedFollowers = followers.map((f) => ({
    ...f.follower,
    followedAt: f.createdAt,
  }));

  res.status(200).json(
    new ApiResponse(200, {
      followers: formattedFollowers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    }, 'Followers retrieved successfully')
  );
});

// @desc    Get user's following
// @route   GET /api/users/:userId/following
// @access  Public
exports.getFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [following, total] = await Promise.all([
    prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            bio: true,
            points: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.follow.count({
      where: { followerId: userId },
    }),
  ]);

  const formattedFollowing = following.map((f) => ({
    ...f.following,
    followedAt: f.createdAt,
  }));

  res.status(200).json(
    new ApiResponse(200, {
      following: formattedFollowing,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    }, 'Following retrieved successfully')
  );
});

// @desc    Check if following a user
// @route   GET /api/users/:userId/follow/status
// @access  Private
exports.getFollowStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const followerId = req.userId;

  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId: userId,
      },
    },
  });

  res.status(200).json(
    new ApiResponse(200, { isFollowing: !!follow }, 'Follow status retrieved')
  );
});

// @desc    Get follow stats
// @route   GET /api/users/:userId/follow/stats
// @access  Public
exports.getFollowStats = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const [followersCount, followingCount] = await Promise.all([
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      followers: followersCount,
      following: followingCount,
    }, 'Follow stats retrieved successfully')
  );
});

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config');

class SocketService {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // userId -> socketId mapping
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: config.allowedOrigins,
        credentials: true,
      },
    });

    // Authentication middleware
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      try {
        const decoded = jwt.verify(token, config.jwtSecret);
        socket.userId = decoded.userId;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`✅ User connected: ${socket.userId}`);
      
      // Store user socket mapping
      this.userSockets.set(socket.userId, socket.id);

      // Join user's personal room
      socket.join(`user:${socket.userId}`);
      
      // Broadcast online users count
      this.broadcastOnlineCount();

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socket.userId}`);
        this.userSockets.delete(socket.userId);
        this.broadcastOnlineCount();
      });

      // Handle typing indicators
      socket.on('typing:start', (data) => {
        socket.to(`question:${data.questionId}`).emit('typing:start', {
          userId: socket.userId,
          username: data.username,
        });
      });

      socket.on('typing:stop', (data) => {
        socket.to(`question:${data.questionId}`).emit('typing:stop', {
          userId: socket.userId,
          username: data.username,
        });
      });

      // Join question room
      socket.on('join:question', (questionId) => {
        socket.join(`question:${questionId}`);
        console.log(`User ${socket.userId} joined question ${questionId}`);
      });

      // Leave question room
      socket.on('leave:question', (questionId) => {
        socket.leave(`question:${questionId}`);
        console.log(`User ${socket.userId} left question ${questionId}`);
      });

      // Join conversation room
      socket.on('join:conversation', (conversationId) => {
        socket.join(`conversation:${conversationId}`);
        console.log(`User ${socket.userId} joined conversation ${conversationId}`);
      });

      // Leave conversation room
      socket.on('leave:conversation', (conversationId) => {
        socket.leave(`conversation:${conversationId}`);
        console.log(`User ${socket.userId} left conversation ${conversationId}`);
      });
    });

    console.log('✅ Socket.IO initialized');
  }

  // Emit notification to specific user
  notifyUser(userId, event, data) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }

  // Emit to all users in a question
  notifyQuestion(questionId, event, data) {
    if (this.io) {
      this.io.to(`question:${questionId}`).emit(event, data);
    }
  }

  // Broadcast to all connected users
  broadcast(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  // Get online users count
  getOnlineUsersCount() {
    return this.userSockets.size;
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.userSockets.has(userId);
  }
  
  // Broadcast online users count
  broadcastOnlineCount() {
    if (this.io) {
      this.io.emit('online:count', this.getOnlineUsersCount());
    }
  }
  
  // Emit notification to specific user (alias for backward compatibility)
  emitNotification(userId, data) {
    this.notifyUser(userId, 'notification', data);
  }
  
  // Emit to room
  emitToRoom(room, event, data) {
    if (this.io) {
      this.io.to(room).emit(event, data);
    }
  }
}

module.exports = new SocketService();

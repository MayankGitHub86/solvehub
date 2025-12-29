const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config');

class SocketService {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // userId -> socketId mapping
    this.questionViewers = new Map(); // questionId -> Set of userIds
    this.activeTypers = new Map(); // questionId -> Set of userIds
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
        
        // Clean up from all question viewers
        this.questionViewers.forEach((viewers, questionId) => {
          if (viewers.has(socket.userId)) {
            viewers.delete(socket.userId);
            this.io.to(`question:${questionId}`).emit('question:viewers', {
              questionId,
              count: viewers.size,
              viewers: Array.from(viewers),
            });
          }
        });
        
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
        
        // Track viewers
        if (!this.questionViewers.has(questionId)) {
          this.questionViewers.set(questionId, new Set());
        }
        this.questionViewers.get(questionId).add(socket.userId);
        
        // Notify others about new viewer
        this.io.to(`question:${questionId}`).emit('question:viewers', {
          questionId,
          count: this.questionViewers.get(questionId).size,
          viewers: Array.from(this.questionViewers.get(questionId)),
        });
        
        console.log(`User ${socket.userId} joined question ${questionId}`);
      });

      // Leave question room
      socket.on('leave:question', (questionId) => {
        socket.leave(`question:${questionId}`);
        
        // Remove from viewers
        if (this.questionViewers.has(questionId)) {
          this.questionViewers.get(questionId).delete(socket.userId);
          
          // Notify others
          this.io.to(`question:${questionId}`).emit('question:viewers', {
            questionId,
            count: this.questionViewers.get(questionId).size,
            viewers: Array.from(this.questionViewers.get(questionId)),
          });
          
          // Clean up empty sets
          if (this.questionViewers.get(questionId).size === 0) {
            this.questionViewers.delete(questionId);
          }
        }
        
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

      // Live voting
      socket.on('vote:cast', (data) => {
        socket.to(`question:${data.questionId}`).emit('vote:update', {
          targetId: data.targetId,
          targetType: data.targetType,
          voteCount: data.voteCount,
          userId: socket.userId,
        });
      });

      // Live answer submission
      socket.on('answer:submit', (data) => {
        socket.to(`question:${data.questionId}`).emit('answer:new', {
          answer: data.answer,
          questionId: data.questionId,
        });
      });

      // Live comment submission
      socket.on('comment:submit', (data) => {
        socket.to(`question:${data.questionId}`).emit('comment:new', {
          comment: data.comment,
          targetId: data.targetId,
          targetType: data.targetType,
        });
      });

      // Live question update
      socket.on('question:update', (data) => {
        socket.to(`question:${data.questionId}`).emit('question:updated', {
          question: data.question,
        });
      });

      // Collaborative editing - cursor position
      socket.on('editor:cursor', (data) => {
        socket.to(`question:${data.questionId}`).emit('editor:cursor:update', {
          userId: socket.userId,
          username: data.username,
          position: data.position,
        });
      });

      // Collaborative editing - selection
      socket.on('editor:selection', (data) => {
        socket.to(`question:${data.questionId}`).emit('editor:selection:update', {
          userId: socket.userId,
          username: data.username,
          selection: data.selection,
        });
      });

      // Activity broadcast
      socket.on('activity:broadcast', (data) => {
        this.broadcast('activity:new', {
          userId: socket.userId,
          activity: data,
          timestamp: new Date(),
        });
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

  // Get question viewers count
  getQuestionViewersCount(questionId) {
    return this.questionViewers.get(questionId)?.size || 0;
  }

  // Get question viewers
  getQuestionViewers(questionId) {
    return Array.from(this.questionViewers.get(questionId) || []);
  }

  // Notify about new answer
  notifyNewAnswer(questionId, answer) {
    this.notifyQuestion(questionId, 'answer:new', { answer });
  }

  // Notify about new comment
  notifyNewComment(questionId, comment) {
    this.notifyQuestion(questionId, 'comment:new', { comment });
  }

  // Notify about vote update
  notifyVoteUpdate(questionId, voteData) {
    this.notifyQuestion(questionId, 'vote:update', voteData);
  }

  // Notify about question update
  notifyQuestionUpdate(questionId, question) {
    this.notifyQuestion(questionId, 'question:updated', { question });
  }

  // Broadcast activity
  broadcastActivity(activity) {
    this.broadcast('activity:new', {
      activity,
      timestamp: new Date(),
    });
  }
}

module.exports = new SocketService();

// Socket handler
// ============================================
// MAIN SOCKET HANDLER
// ============================================

const chatHandler = require('./chatHandler');
const liveSessionHandler = require('./liveSessionHandler');
const notificationHandler = require('./notificationHandler');
const { verifyAccessToken } = require('../utils/generateToken');
const User = require('../models/User.model');

// Store active users
const activeUsers = new Map();

// ============================================
// INITIALIZE SOCKET.IO
// ============================================
const initializeSocket = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify token
      const decoded = verifyAccessToken(token);
      
      // Get user
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user to socket
      socket.userId = user._id.toString();
      socket.user = user;
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  // Connection event
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.name} (${socket.userId})`);

    // Add user to active users
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user,
      connectedAt: new Date(),
    });

    // Join user's personal room
    socket.join(socket.userId);

    // Emit online status
    socket.broadcast.emit('user:online', {
      userId: socket.userId,
      name: socket.user.name,
    });

    // Send active users count
    io.emit('users:count', activeUsers.size);

    // ============================================
    // HANDLE USER STATUS
    // ============================================
    socket.on('user:status', (status) => {
      const userInfo = activeUsers.get(socket.userId);
      if (userInfo) {
        userInfo.status = status;
        activeUsers.set(socket.userId, userInfo);
      }

      socket.broadcast.emit('user:status-changed', {
        userId: socket.userId,
        status,
      });
    });

    // ============================================
    // TYPING INDICATOR
    // ============================================
    socket.on('typing:start', (data) => {
      socket.to(data.recipientId).emit('typing:start', {
        userId: socket.userId,
        userName: socket.user.name,
      });
    });

    socket.on('typing:stop', (data) => {
      socket.to(data.recipientId).emit('typing:stop', {
        userId: socket.userId,
      });
    });

    // ============================================
    // INITIALIZE HANDLERS
    // ============================================
    chatHandler(io, socket);
    liveSessionHandler(io, socket);
    notificationHandler(io, socket);

    // ============================================
    // DISCONNECTION
    // ============================================
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.name} (${socket.userId})`);

      // Remove from active users
      activeUsers.delete(socket.userId);

      // Emit offline status
      socket.broadcast.emit('user:offline', {
        userId: socket.userId,
      });

      // Update active users count
      io.emit('users:count', activeUsers.size);
    });

    // ============================================
    // ERROR HANDLING
    // ============================================
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      socket.emit('error', { message: 'An error occurred' });
    });
  });

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  // Get online users
  io.getOnlineUsers = () => {
    return Array.from(activeUsers.values()).map((user) => ({
      userId: user.user._id,
      name: user.user.name,
      profileImage: user.user.profileImage,
      status: user.status || 'online',
    }));
  };

  // Check if user is online
  io.isUserOnline = (userId) => {
    return activeUsers.has(userId.toString());
  };

  // Emit to user
  io.emitToUser = (userId, event, data) => {
    io.to(userId.toString()).emit(event, data);
  };

  console.log('🔌 Socket.IO initialized successfully');
};

// ============================================
// EXPORTS
// ============================================
module.exports = initializeSocket;
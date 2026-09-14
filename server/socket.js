const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config/jwtConfig');

let io;

/**
 * Initialize Socket.io server and attach to the HTTP server.
 * Authenticates every connection via JWT token in the handshake.
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Authenticate socket connections using JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] User connected: ${socket.user.id}`);

    // Join a board room for scoped broadcasting
    socket.on('join:board', (boardId) => {
      socket.join(`board:${boardId}`);
      console.log(`[Socket.io] User ${socket.user.id} joined board:${boardId}`);
    });

    // Leave a board room
    socket.on('leave:board', (boardId) => {
      socket.leave(`board:${boardId}`);
      console.log(`[Socket.io] User ${socket.user.id} left board:${boardId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] User disconnected: ${socket.user.id}`);
    });
  });

  return io;
}

/**
 * Get the Socket.io server instance.
 * Call this from controllers to emit events.
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call initSocket first.');
  }
  return io;
}

module.exports = { initSocket, getIO };

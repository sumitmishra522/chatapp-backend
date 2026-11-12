const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

let io;
const onlineUsers = new Map(); // userId -> Set of socket IDs

const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(v => v.trim()) : true,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');
      if (!token) return next(new Error('Authentication token required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id');
      if (!user) return next(new Error('User not found'));
      socket.userId = String(user._id);
      next();
    } catch (error) { next(new Error('Invalid or expired socket token')); }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    socket.join(userId);
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);
    io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));

    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) onlineUsers.delete(userId);
      }
      io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
    });
  });
  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.IO has not been initialized');
  return io;
};

const getReceiverSocketId = (receiverId) => onlineUsers.get(String(receiverId)) || new Set();
module.exports = { initializeSocket, getIO, getReceiverSocketId };

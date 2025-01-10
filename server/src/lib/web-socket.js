import http from 'http';
import socketIo from 'socket.io';
import { validateAccessToken } from '../middlewares/auth.js';
import { validateIdToken } from '../lib/firebase-admin.js';
export const webSocketServer = http.createServer();
const io = socketIo(webSocketServer, {
  cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization"],
  },
});

const userSocketMap = {};

io.use(async (socket, next) => {
  const { accessToken, idToken } = socket.handshake.auth;
  try {
    socket.user =
      (idToken && (await validateIdToken(idToken))) ||
      (accessToken && (await validateAccessToken(accessToken))) ||
      null;
    return next();
  } catch (error) {
    return next(new Error('Authentication error:', error.message));
  }
})

io.on('connection', (socket) => {
  console.log('User connected', socket.id);
  const userId = socket.user?._id;

  if (!userSocketMap[userId]) {
    userSocketMap[userId] = [];
  }
  userSocketMap[userId].push(socket.id);

  socket.emit('notification', { message: 'Welcome to the notification service!' });

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);

    userSocketMap[userId] = userSocketMap[userId].filter(id => id !== socket.id);

    if (userSocketMap[userId].length === 0) {
      delete userSocketMap[userId];
    }
  });
});

export const sendNotificationToUser = (userId, notification) => {
  const socketIds = userSocketMap[userId];
  if (socketIds) {
    socketIds.forEach(socketId => {
      io.to(socketId).emit('notification', notification);
    });
    console.log(`Notification sent to user ${userId}`);
  } else {
    console.log(`User ${userId} is not connected`);
  }
};

import http from 'http';
import { Server } from 'socket.io';
import { validateAccessToken } from '../middlewares/auth.js';
import { validateIdToken } from '../lib/firebase-admin.js';
import cookie from "cookie"
export const webSocketServer = http.createServer();
const io = new Server(webSocketServer, {
  cors: {
    origin: [process.env.CLIENT_URL],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ['websocket']
});

const userSocketMap = {};
io.use(async (socket, next) => {
  const { accessToken, idToken } = cookie.parse(socket.handshake.headers.cookie||"");
  try {
    let user = null;
    if (idToken) {
      user = await validateIdToken(idToken);
    } else if (accessToken) {
      user = await validateAccessToken(accessToken);
    }
    socket.user = user;
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

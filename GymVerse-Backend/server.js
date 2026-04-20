const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  allowEIO3: true,
  transports: ['websocket', 'polling'],
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/gyms', require('./routes/gymRoutes'));
app.use('/api/memberships', require('./routes/membershipRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/trainers', require('./routes/trainerRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Gym Verse API Running 🚀' });
});

// Socket.io connection
const userSockets = new Map();

io.on('connection', (socket) => {
  
  // Register user
  socket.on('register-user', (userId) => {
    if (userId) {
      userSockets.set(userId, socket.id);
      io.emit('online-users', Array.from(userSockets.keys()));
    }
  });
  
  // Join chat room
  socket.on('join-chat', (chatId) => {
    if (chatId) {
      socket.join(`chat_${chatId}`);
    }
  });
  
  // ✅ FIXED: Send message - Socket ONLY notifies, DOES NOT save to database
  socket.on('send-message', (data) => {
    const { chatId, senderId, receiverId, message } = data;
    
    // ✅ ONLY emit to receiver if online (NO database save here)
    const receiverSocketId = userSockets.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('new-message', {
        chatId,
        message: {
          _id: Date.now(),
          senderId: { _id: senderId },
          receiverId: { _id: receiverId },
          message: message,
          read: false,
          createdAt: new Date(),
        },
      });
    }
    
    // Also emit to sender's room for consistency
    io.to(`chat_${chatId}`).emit('message-sent', {
      chatId,
      message: { message, senderId, receiverId }
    });
  });
  
  // Mark messages as read
  socket.on('mark-read', async (data) => {
    const { chatId, userId } = data;
    try {
      const Chat = require('./models/Chat');
      const chat = await Chat.findById(chatId);
      if (chat) {
        let updated = false;
        chat.messages.forEach(msg => {
          if (msg.receiverId && msg.receiverId.toString() === userId && !msg.read) {
            msg.read = true;
            msg.readAt = new Date();
            updated = true;
          }
        });
        if (updated) {
          if (chat.unreadCount) {
            chat.unreadCount.set(userId, 0);
          }
          await chat.save();
        }
      }
    } catch (error) {
      console.error('❌ Mark read error:', error);
    }
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    let disconnectedUser = null;
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        disconnectedUser = userId;
        userSockets.delete(userId);
        break;
      }
    }
    if (disconnectedUser) {
      io.emit('online-users', Array.from(userSockets.keys()));
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Socket.io ready`);
});
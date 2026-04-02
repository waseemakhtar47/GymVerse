const express = require('express');
const {
  getOrCreateChat,
  getMyChats,
  getChatMessages,
  sendMessage,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my-chats', protect, getMyChats);
router.get('/:userId', protect, getOrCreateChat);
router.get('/messages/:chatId', protect, getChatMessages);
router.post('/messages/:chatId', protect, sendMessage);

module.exports = router;
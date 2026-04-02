const Chat = require('../models/Chat');
const User = require('../models/User');

// @desc    Get or create chat between two users
const getOrCreateChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    
    // Find existing chat
    let chat = await Chat.findOne({
      participants: { $all: [currentUserId, userId], $size: 2 }
    }).populate('participants', 'name email profilePic role')
      .populate('messages.senderId', 'name profilePic')
      .populate('messages.receiverId', 'name profilePic');
    
    if (!chat) {
      // Create new chat
      chat = await Chat.create({
        participants: [currentUserId, userId],
        messages: [],
      });
      chat = await Chat.findById(chat._id)
        .populate('participants', 'name email profilePic role')
        .populate('messages.senderId', 'name profilePic')
        .populate('messages.receiverId', 'name profilePic');
    }
    
    res.json({ success: true, data: chat });
  } catch (error) {
    console.error('getOrCreateChat error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all chats for current user
const getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: { $in: [req.user.id] }
    }).populate('participants', 'name email profilePic role')
      .populate('messages.senderId', 'name profilePic')
      .populate('messages.receiverId', 'name profilePic')
      .sort('-lastMessageTime');
    
    // Add unread count and other participant info
    const formattedChats = chats.map(chat => {
      const otherParticipant = chat.participants.find(p => p._id.toString() !== req.user.id);
      const unread = chat.unreadCount?.get(req.user.id) || 0;
      return {
        ...chat.toObject(),
        otherParticipant,
        unreadCount: unread,
      };
    });
    
    res.json({ success: true, data: formattedChats });
  } catch (error) {
    console.error('getMyChats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get chat messages
const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    const chat = await Chat.findById(chatId)
      .populate('messages.senderId', 'name profilePic')
      .populate('messages.receiverId', 'name profilePic');
    
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    // Mark messages as read
    let updated = false;
    chat.messages.forEach(msg => {
      if (msg.receiverId.toString() === req.user.id && !msg.read) {
        msg.read = true;
        msg.readAt = new Date();
        updated = true;
      }
    });
    
    if (updated) {
      // Reset unread count for current user
      if (chat.unreadCount) {
        chat.unreadCount.set(req.user.id, 0);
      }
      await chat.save();
    }
    
    res.json({ success: true, data: chat.messages });
  } catch (error) {
    console.error('getChatMessages error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send message (via REST fallback)
const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    const receiverId = chat.participants.find(p => p.toString() !== req.user.id);
    
    const newMessage = {
      senderId: req.user.id,
      receiverId,
      message,
      read: false,
    };
    
    chat.messages.push(newMessage);
    chat.lastMessage = message;
    chat.lastMessageTime = new Date();
    
    // Increment unread count for receiver
    const currentUnread = chat.unreadCount?.get(receiverId.toString()) || 0;
    chat.unreadCount.set(receiverId.toString(), currentUnread + 1);
    
    await chat.save();
    
    const populatedChat = await Chat.findById(chatId)
      .populate('messages.senderId', 'name profilePic')
      .populate('messages.receiverId', 'name profilePic');
    
    const sentMessage = populatedChat.messages[populatedChat.messages.length - 1];
    
    res.json({ success: true, data: sentMessage });
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOrCreateChat,
  getMyChats,
  getChatMessages,
  sendMessage,
};
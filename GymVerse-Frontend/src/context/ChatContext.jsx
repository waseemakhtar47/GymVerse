import { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [newMessage, setNewMessage] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState(null);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [currentChatId, setCurrentChatId] = useState(null);
  const socketRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    if (!audioRef.current.canPlayType('audio/mpeg')) {
      audioRef.current = null;
    }
  }, []);

  // Load unread messages from localStorage on mount
  useEffect(() => {
    if (user && user._id) {
      const savedUnread = localStorage.getItem(`unread_${user._id}`);
      if (savedUnread) {
        try {
          const parsed = JSON.parse(savedUnread);
          setUnreadMessages(parsed);
          const total = Object.values(parsed).reduce((sum, count) => sum + count, 0);
          setTotalUnreadCount(total);
        } catch (e) {
          console.error('Failed to load unread messages:', e);
        }
      }
    }
  }, [user]);

  // Save unread messages to localStorage whenever it changes
  useEffect(() => {
    if (user && user._id) {
      localStorage.setItem(`unread_${user._id}`, JSON.stringify(unreadMessages));
      const total = Object.values(unreadMessages).reduce((sum, count) => sum + count, 0);
      setTotalUnreadCount(total);
    }
  }, [unreadMessages, user]);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    } else {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.3;
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
        oscillator.stop(audioContext.currentTime + 0.5);
        audioContext.resume();
      } catch (err) {
        console.log('Cannot play sound:', err);
      }
    }
  };

  useEffect(() => {
    if (user && user._id && isAuthenticated) {
      const newSocket = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        withCredentials: true,
      });
      
      socketRef.current = newSocket;
      setSocket(newSocket);
      
      newSocket.on('connect', () => {
        console.log('Socket connected');
        newSocket.emit('register-user', user._id);
      });
      
      newSocket.on('online-users', (users) => {
        setOnlineUsers(users);
      });
      
      newSocket.on('new-message', (data) => {
        console.log('New message received:', data);
        console.log('Current chat ID:', currentChatId);
        console.log('Message chat ID:', data.chatId);
        
        setNewMessage(data);
        
        const isCurrentChat = currentChatId === data.chatId;
        
        if (!isCurrentChat) {
          setUnreadMessages(prev => {
            const currentCount = prev[data.chatId] || 0;
            const newCount = currentCount + 1;
            return {
              ...prev,
              [data.chatId]: newCount
            };
          });
          
          if (isAuthenticated && user && user._id) {
            setNotificationData({
              title: 'New Message',
              body: `${data.message?.senderId?.name || 'Someone'} sent you a message`,
              chatId: data.chatId,
              message: data.message,
              senderId: data.message?.senderId?._id
            });
            setShowNotification(true);
            playNotificationSound();
            
            setTimeout(() => {
              setShowNotification(false);
            }, 5000);
          }
        } else {
          console.log('Message in current chat - marking as read');
          if (socketRef.current) {
            socketRef.current.emit('mark-read', { chatId: data.chatId, userId: user._id });
          }
        }
      });
      
      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
      
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [user, isAuthenticated, currentChatId]);

  const joinChat = (chatId) => {
    if (socketRef.current && chatId) {
      socketRef.current.emit('join-chat', chatId);
      setCurrentChatId(chatId);
      setUnreadMessages(prev => {
        const newState = { ...prev };
        delete newState[chatId];
        return newState;
      });
    }
  };

  const leaveChat = () => {
    setCurrentChatId(null);
  };

  const sendMessage = (chatId, senderId, receiverId, message) => {
    if (socketRef.current && chatId && senderId && receiverId && message) {
      socketRef.current.emit('send-message', { chatId, senderId, receiverId, message });
    }
  };

  const markRead = (chatId, userId) => {
    if (socketRef.current && chatId && userId) {
      socketRef.current.emit('mark-read', { chatId, userId });
      setUnreadMessages(prev => {
        const newState = { ...prev };
        delete newState[chatId];
        return newState;
      });
    }
  };

  const clearNotification = () => {
    setShowNotification(false);
    setNotificationData(null);
  };

  const resetUnreadForChat = (chatId) => {
    setUnreadMessages(prev => {
      const newState = { ...prev };
      delete newState[chatId];
      return newState;
    });
  };

  const value = {
    socket,
    onlineUsers,
    newMessage,
    unreadMessages,
    totalUnreadCount,
    showNotification,
    notificationData,
    currentChatId,
    joinChat,
    leaveChat,
    sendMessage,
    markRead,
    setNewMessage,
    clearNotification,
    resetUnreadForChat,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
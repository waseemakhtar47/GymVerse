import { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [newMessage, setNewMessage] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (user && user._id) {
      // Initialize socket connection
      const newSocket = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        withCredentials: true,
      });
      
      socketRef.current = newSocket;
      setSocket(newSocket);
      
      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
        newSocket.emit('register-user', user._id);
      });
      
      newSocket.on('online-users', (users) => {
        console.log('📍 Online users:', users);
        setOnlineUsers(users);
      });
      
      newSocket.on('new-message', (data) => {
        console.log('💬 New message received:', data);
        setNewMessage(data);
      });
      
      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
      });
      
      newSocket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });
      
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [user]);

  const joinChat = (chatId) => {
    if (socketRef.current && chatId) {
      socketRef.current.emit('join-chat', chatId);
    }
  };

  const sendMessage = (chatId, senderId, receiverId, message) => {
    if (socketRef.current && chatId && senderId && receiverId && message) {
      socketRef.current.emit('send-message', { chatId, senderId, receiverId, message });
    }
  };

  const markRead = (chatId, userId) => {
    if (socketRef.current && chatId && userId) {
      socketRef.current.emit('mark-read', { chatId, userId });
    }
  };

  const value = {
    socket,
    onlineUsers,
    newMessage,
    joinChat,
    sendMessage,
    markRead,
    setNewMessage,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
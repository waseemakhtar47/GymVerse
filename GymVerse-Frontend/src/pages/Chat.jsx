import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { chatService } from '../services/chatService';
import { userService } from '../services/userService';
import DashboardLayout from '../components/DashboardLayout';
import { 
  PaperAirplaneIcon, 
  UserIcon,
  UserGroupIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Chat = () => {
  const { user } = useAuth();
  const { 
    onlineUsers, 
    newMessage, 
    joinChat, 
    sendMessage, 
    markRead, 
    unreadMessages, 
    resetUnreadForChat,
    leaveChat
  } = useChat();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchUsers, setSearchUsers] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const initialChatId = searchParams.get('chatId');
  const initialChatProcessed = useRef(false);
  const isSelectingChat = useRef(false);

  useEffect(() => {
    fetchChats();
    
    return () => {
      leaveChat();
    };
  }, []);

  // Handle initial chat from notification - ONLY ONCE
  useEffect(() => {
    if (chats.length > 0 && initialChatId && !initialChatProcessed.current) {
      const chat = chats.find(c => c._id === initialChatId);
      if (chat) {
        initialChatProcessed.current = true;
        selectChat(chat, true);
      }
    }
  }, [chats, initialChatId]);

  // Handle new message when chat is open
  useEffect(() => {
    if (newMessage && selectedChat && newMessage.chatId === selectedChat._id && !isSelectingChat.current) {
      // Check if message already exists
      setMessages(prev => {
        const exists = prev.some(msg => msg._id === newMessage.message._id);
        if (exists) return prev;
        return [...prev, newMessage.message];
      });
      scrollToBottom();
    }
  }, [newMessage, selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchUsers.length >= 2) {
        searchAllUsers();
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchUsers]);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const res = await chatService.getMyChats();
      setChats(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const selectChat = async (chat, fromNotification = false) => {
    // Prevent multiple selections
    if (isSelectingChat.current) return;
    isSelectingChat.current = true;
    
    console.log('Selecting chat:', chat._id, 'fromNotification:', fromNotification);
    
    // Leave previous chat
    leaveChat();
    
    setSelectedChat(chat);
    
    try {
      const res = await chatService.getChatMessages(chat._id);
      setMessages(res.data.data || []);
      
      // Join new chat and mark as read
      joinChat(chat._id);
      markRead(chat._id, user._id);
      resetUnreadForChat(chat._id);
      
      // Clear URL parameter after opening
      if (fromNotification) {
        navigate(window.location.pathname, { replace: true });
      }
      
      // Update chats list to remove unread count
      setChats(prev => prev.map(c => 
        c._id === chat._id 
          ? { ...c, unreadCount: 0 }
          : c
      ));
      
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    }
    
    setTimeout(() => {
      isSelectingChat.current = false;
    }, 500);
    
    inputRef.current?.focus();
  };

  const searchAllUsers = async () => {
    setSearching(true);
    try {
      const res = await userService.searchUsers(searchUsers);
      const filtered = (res.data.data || []).filter(u => u._id !== user._id);
      setSearchResults(filtered);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const startNewChat = async (selectedUser) => {
    try {
      const res = await chatService.getOrCreateChat(selectedUser._id);
      const newChat = res.data.data;
      
      const freshChat = await chatService.getMyChats();
      const updatedChat = freshChat.data.data.find(c => c._id === newChat._id);
      
      setChats(prev => [updatedChat, ...prev.filter(c => c._id !== newChat._id)]);
      setSelectedChat(updatedChat);
      setMessages([]);
      joinChat(updatedChat._id);
      
      setShowNewChatModal(false);
      setSearchUsers('');
      setSearchResults([]);
      toast.success(`Chat with ${selectedUser.name} started!`);
      
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to start chat:', error);
      toast.error('Failed to start chat');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    if (!selectedChat || !selectedChat.otherParticipant || !selectedChat.otherParticipant._id) {
      toast.error('Please select a chat first');
      return;
    }
    
    const receiverId = selectedChat.otherParticipant._id;
    const messageText = messageInput.trim();
    
    setSending(true);
    setMessageInput('');
    
    try {
      const res = await chatService.sendMessage(selectedChat._id, messageText);
      const newMsg = res.data.data;
      setMessages(prev => [...prev, newMsg]);
      sendMessage(selectedChat._id, user._id, receiverId, messageText);
      scrollToBottom();
      
      setChats(prev => prev.map(chat => 
        chat._id === selectedChat._id 
          ? { ...chat, lastMessage: messageText, lastMessageTime: new Date() }
          : chat
      ));
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      setMessageInput(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleClearChat = async () => {
    if (!selectedChat) return;
    
    if (!confirm(`Are you sure you want to clear all messages in this chat? This action cannot be undone.`)) {
      return;
    }
    
    setClearing(true);
    try {
      await chatService.clearChat(selectedChat._id);
      setMessages([]);
      setChats(prev => prev.map(chat => 
        chat._id === selectedChat._id 
          ? { ...chat, lastMessage: 'No messages yet', lastMessageTime: new Date() }
          : chat
      ));
      toast.success('Chat cleared successfully');
    } catch (error) {
      console.error('Failed to clear chat:', error);
      toast.error('Failed to clear chat');
    } finally {
      setClearing(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!selectedChat) return;
    
    if (!confirm(`Are you sure you want to delete this chat completely? All messages will be lost forever.`)) {
      return;
    }
    
    setDeleting(true);
    try {
      await chatService.deleteChat(selectedChat._id);
      setChats(prev => prev.filter(chat => chat._id !== selectedChat._id));
      setSelectedChat(null);
      setMessages([]);
      toast.success('Chat deleted successfully');
    } catch (error) {
      console.error('Failed to delete chat:', error);
      toast.error('Failed to delete chat');
    } finally {
      setDeleting(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  const getUnreadCount = (chat) => {
    const unreadFromChat = chat.unreadCount || 0;
    const unreadFromContext = unreadMessages?.[chat._id] || 0;
    return unreadFromChat + unreadFromContext;
  };

  if (loading && chats.length === 0) {
    return (
      <DashboardLayout title="Messages" role={user?.role}>
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading chats...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Messages" role={user?.role}>
      <div className="flex h-[calc(100vh-120px)] bg-gray-900/50 rounded-xl overflow-hidden border border-white/10">
        {/* Chat List */}
        <div className="w-80 border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <div>
              <h2 className="text-white font-semibold">Chats</h2>
              <p className="text-gray-400 text-xs">({chats.length} conversations)</p>
            </div>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition"
              title="New Chat"
            >
              <PlusCircleIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="text-center py-8">
                <UserGroupIcon className="w-12 h-12 mx-auto text-gray-500 mb-2" />
                <p className="text-gray-400 text-sm">No chats yet</p>
                <p className="text-gray-500 text-xs mt-1">Click the + button to start a new conversation</p>
              </div>
            ) : (
              chats.map((chat) => {
                const otherUser = chat.otherParticipant;
                const isOnline = isUserOnline(otherUser?._id);
                const unread = getUnreadCount(chat);
                
                return (
                  <div
                    key={chat._id}
                    onClick={() => selectChat(chat, false)}
                    className={`p-4 border-b border-white/10 cursor-pointer transition hover:bg-white/10 ${
                      selectedChat?._id === chat._id ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-linear-to-r from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden">
                          {otherUser?.profilePic ? (
                            <img src={otherUser.profilePic} alt={otherUser.name} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-5 h-5 text-white" />
                          )}
                        </div>
                        {isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="text-white font-medium truncate">{otherUser?.name || 'User'}</p>
                          <p className="text-gray-500 text-xs">{otherUser?.role || 'User'}</p>
                        </div>
                        <p className="text-gray-400 text-sm truncate">{chat.lastMessage || 'No messages yet'}</p>
                        {unread > 0 && (
                          <span className="inline-block mt-1 bg-purple-600 text-white text-xs rounded-full px-2 py-0.5">
                            {unread} new
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-linear-to-r from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden">
                      {selectedChat.otherParticipant?.profilePic ? (
                        <img src={selectedChat.otherParticipant.profilePic} alt={selectedChat.otherParticipant.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    {selectedChat.otherParticipant && isUserOnline(selectedChat.otherParticipant._id) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{selectedChat.otherParticipant?.name || 'User'}</h3>
                    <p className="text-gray-400 text-xs">
                      {selectedChat.otherParticipant?.role || 'User'} • {selectedChat.otherParticipant && isUserOnline(selectedChat.otherParticipant._id) ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleClearChat}
                    disabled={clearing || messages.length === 0}
                    className="p-2 bg-yellow-600/20 rounded-lg text-yellow-400 hover:bg-yellow-600/30 transition disabled:opacity-50"
                    title="Clear all messages"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDeleteChat}
                    disabled={deleting}
                    className="p-2 bg-red-600/20 rounded-lg text-red-400 hover:bg-red-600/30 transition disabled:opacity-50"
                    title="Delete chat"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 mt-10">
                    <p>No messages yet</p>
                    <p className="text-sm mt-1">Start a conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isSender = msg.senderId?._id === user._id;
                    return (
                      <div key={msg._id || idx} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] ${isSender ? 'bg-purple-600' : 'bg-gray-700'} rounded-lg px-4 py-2`}>
                          <p className="text-white text-sm wrap-break-word">{msg.message}</p>
                          <p className="text-gray-300 text-xs mt-1 text-right">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={sending || !messageInput.trim()}
                  className="px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <UserGroupIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <h3 className="text-white text-lg font-semibold">Select a chat</h3>
                <p className="text-gray-400 text-sm mt-1">Choose a conversation or click + to start a new chat</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowNewChatModal(false)}>
          <div className="bg-gray-900 rounded-xl max-w-md w-full mx-4 border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">New Chat</h3>
                <button onClick={() => setShowNewChatModal(false)} className="text-gray-400 hover:text-white">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              {/* Search Input */}
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchUsers}
                  onChange={(e) => setSearchUsers(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-3 bg-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
              </div>
              
              {/* Search Results */}
              {searching ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-400 text-sm mt-2">Searching...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchResults.map((result) => (
                    <div
                      key={result._id}
                      onClick={() => startNewChat(result)}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-linear-to-r from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden">
                          {result.profilePic ? (
                            <img src={result.profilePic} alt={result.name} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-5 h-5 text-white" />
                          )}
                        </div>
                        {onlineUsers.includes(result._id) && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{result.name}</p>
                        <p className="text-gray-400 text-sm">{result.email}</p>
                        <span className="text-xs text-purple-400 capitalize">{result.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchUsers.length >= 2 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No users found</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>Type at least 2 characters to search</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Chat;
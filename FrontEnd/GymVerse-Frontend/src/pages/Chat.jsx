import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { chatService } from '../services/chatService';
import DashboardLayout from '../components/DashboardLayout';
import { 
  PaperAirplaneIcon, 
  UserIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Chat = () => {
  const { user } = useAuth();
  const { onlineUsers, newMessage, joinChat, sendMessage, markRead } = useChat();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const initialChatId = searchParams.get('chatId');

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (newMessage && selectedChat && newMessage.chatId === selectedChat._id) {
      setMessages(prev => [...prev, newMessage.message]);
      markRead(selectedChat._id, user._id);
    }
  }, [newMessage, selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialChatId && chats.length > 0) {
      const chat = chats.find(c => c._id === initialChatId);
      if (chat) {
        selectChat(chat);
      }
    }
  }, [initialChatId, chats]);

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

  const selectChat = async (chat) => {
    setSelectedChat(chat);
    setLoading(true);
    try {
      const res = await chatService.getChatMessages(chat._id);
      setMessages(res.data.data || []);
      joinChat(chat._id);
      markRead(chat._id, user._id);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
    inputRef.current?.focus();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    const receiverId = selectedChat.otherParticipant._id;
    setSending(true);
    
    sendMessage(selectedChat._id, user._id, receiverId, messageInput);
    
    try {
      await chatService.sendMessage(selectedChat._id, messageInput);
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  if (loading && chats.length === 0) {
    return (
      <DashboardLayout title="Messages" role={user?.role}>
        <div className="flex items-center justify-center min-h-[400px]">
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
          <div className="p-4 border-b border-white/10">
            <h2 className="text-white font-semibold">Chats</h2>
            <p className="text-gray-400 text-xs">({chats.length} conversations)</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="text-center py-8">
                <UserGroupIcon className="w-12 h-12 mx-auto text-gray-500 mb-2" />
                <p className="text-gray-400 text-sm">No chats yet</p>
                <p className="text-gray-500 text-xs mt-1">Go to trainers page to start a conversation</p>
                <button
                  onClick={() => navigate('/user/trainers')}
                  className="mt-4 px-4 py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700"
                >
                  Find Trainers
                </button>
              </div>
            ) : (
              chats.map((chat) => {
                const otherUser = chat.otherParticipant;
                const isOnline = isUserOnline(otherUser?._id);
                const unread = chat.unreadCount || 0;
                
                return (
                  <div
                    key={chat._id}
                    onClick={() => selectChat(chat)}
                    className={`p-4 border-b border-white/10 cursor-pointer transition hover:bg-white/10 ${
                      selectedChat?._id === chat._id ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden">
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
                          <p className="text-white font-medium truncate">{otherUser?.name}</p>
                          {unread > 0 && (
                            <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-0.5">
                              {unread}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm truncate">{chat.lastMessage || 'No messages yet'}</p>
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
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden">
                    {selectedChat.otherParticipant?.profilePic ? (
                      <img src={selectedChat.otherParticipant.profilePic} alt={selectedChat.otherParticipant.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-white" />
                    )}
                  </div>
                  {isUserOnline(selectedChat.otherParticipant._id) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                  )}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{selectedChat.otherParticipant?.name}</h3>
                  <p className="text-gray-400 text-xs">
                    {isUserOnline(selectedChat.otherParticipant._id) ? 'Online' : 'Offline'}
                  </p>
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
                      <div key={idx} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] ${isSender ? 'bg-purple-600' : 'bg-gray-700'} rounded-lg px-4 py-2`}>
                          <p className="text-white text-sm break-words">{msg.message}</p>
                          <p className="text-gray-300 text-xs mt-1 text-right">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                <p className="text-gray-400 text-sm mt-1">Choose a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
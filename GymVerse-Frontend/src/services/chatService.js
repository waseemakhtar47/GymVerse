import api from '../utils/api';


export const chatService = {
  getMyChats: () => api.get('/chats/my-chats'),
  getOrCreateChat: (userId) => api.get(`/chats/${userId}`),
  getChatMessages: (chatId) => api.get(`/chats/messages/${chatId}`),
  sendMessage: (chatId, message) => api.post(`/chats/messages/${chatId}`, { message }),
  clearChat: (chatId) => api.delete(`/chats/clear/${chatId}`), 
  deleteChat: (chatId) => api.delete(`/chats/${chatId}`),  
};
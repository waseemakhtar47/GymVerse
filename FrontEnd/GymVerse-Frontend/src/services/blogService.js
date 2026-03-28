import api from '../utils/api';

export const blogService = {
  // Get all blogs
  getAllBlogs: (params = {}) => api.get('/blogs', { params }),
  
  // Get single blog
  getBlogById: (id) => api.get(`/blogs/${id}`),
  
  // Create blog (trainer only)
  createBlog: (data) => api.post('/blogs', data),
  
  // Update blog
  updateBlog: (id, data) => api.put(`/blogs/${id}`, data),
  
  // Delete blog
  deleteBlog: (id) => api.delete(`/blogs/${id}`),
  
  // Like/unlike blog
  likeBlog: (id) => api.post(`/blogs/${id}/like`),
  
  // Add comment
  addComment: (id, comment) => api.post(`/blogs/${id}/comments`, { comment }),
  
  // Delete comment
  deleteComment: (blogId, commentId) => api.delete(`/blogs/${blogId}/comments/${commentId}`),
  
  // Get my blogs (trainer)
  getMyBlogs: () => api.get('/blogs/my-blogs'),
  
  // Get blogs by author
  getBlogsByAuthor: (authorId) => api.get(`/blogs/author/${authorId}`),

  getFollowingBlogs: () => api.get('/blogs/following'),
};
const express = require('express');
const {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  likeBlog,
  addComment,
  deleteComment,
  getBlogsByAuthor,
  getMyBlogs,
  getFollowingBlogs,
} = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// =============================================
// PUBLIC ROUTES (No authentication required)
// =============================================
router.get('/', getBlogs);
router.get('/author/:authorId', getBlogsByAuthor);

// =============================================
// PROTECTED ROUTES - SPECIFIC ROUTES FIRST
// =============================================
// ✅ IMPORTANT: /my-blogs and /following MUST come before /:id
router.get('/my-blogs', protect, authorize('trainer', 'admin'), getMyBlogs);
router.get('/following', protect, authorize('user'), getFollowingBlogs);

// =============================================
// PUBLIC ROUTE - DYNAMIC (must come after specific routes)
// =============================================
router.get('/:id', getBlogById);

// =============================================
// PROTECTED ROUTES
// =============================================
router.post('/', protect, authorize('trainer', 'admin'), createBlog);
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);
router.post('/:id/like', protect, likeBlog);
router.post('/:id/comments', protect, addComment);
router.delete('/:blogId/comments/:commentId', protect, deleteComment);

module.exports = router;
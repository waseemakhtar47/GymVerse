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
} = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// =============================================
// PUBLIC ROUTES (No authentication required)
// =============================================

// Get all blogs with filters (category, tag, search, pagination)
router.get('/', getBlogs);

// Get blogs by author (trainer)
router.get('/author/:authorId', getBlogsByAuthor);

// IMPORTANT: Specific route MUST come before dynamic route
// Get current trainer's own blogs (for dashboard)
router.get('/my-blogs', protect, authorize('trainer', 'admin'), getMyBlogs);

// Get single blog by ID (dynamic route - MUST be LAST in public routes)
router.get('/:id', getBlogById);

// =============================================
// PROTECTED ROUTES (Authentication required)
// =============================================

// Create a new blog (Trainer only)
router.post('/', protect, authorize('trainer', 'admin'), createBlog);

// Update blog (Author only)
router.put('/:id', protect, updateBlog);

// Delete blog (Author only)
router.delete('/:id', protect, deleteBlog);

// Like/Unlike a blog (Any authenticated user)
router.post('/:id/like', protect, likeBlog);

// Add comment to blog (Any authenticated user)
router.post('/:id/comments', protect, addComment);

// Delete comment (Author or blog author)
router.delete('/:blogId/comments/:commentId', protect, deleteComment);

module.exports = router;
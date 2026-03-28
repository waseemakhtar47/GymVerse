const express = require('express');
const {
  getAllTrainers,
  getTrainerById,
  followTrainer,
  getFollowingTrainers,
  getMyFollowers,
  getTrainerStats,
  getTrainerCourses,
  getTrainerBlogs,
} = require('../controllers/trainerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getAllTrainers);

// Protected routes - specific ones first
router.get('/following', protect, authorize('user'), getFollowingTrainers);
router.get('/my/followers', protect, authorize('trainer'), getMyFollowers);
router.get('/my/stats', protect, authorize('trainer'), getTrainerStats);

// Dynamic routes - must come after specific ones
router.get('/:id', getTrainerById);
router.get('/:id/courses', getTrainerCourses);
router.get('/:id/blogs', getTrainerBlogs);

// Protected actions
router.post('/:id/follow', protect, authorize('user'), followTrainer);

module.exports = router;
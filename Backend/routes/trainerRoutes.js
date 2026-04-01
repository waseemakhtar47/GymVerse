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
  getAvailableGyms,
  applyToGym,
  getMyApplications,
} = require('../controllers/trainerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAllTrainers);

router.get('/following', protect, authorize('user'), getFollowingTrainers);
router.get('/my/followers', protect, authorize('trainer'), getMyFollowers);
router.get('/my/stats', protect, authorize('trainer'), getTrainerStats);

// ✅ NEW: Trainer job application routes
router.get('/available-gyms', protect, authorize('trainer'), getAvailableGyms);
router.get('/my-applications', protect, authorize('trainer'), getMyApplications);
router.post('/apply/:gymId', protect, authorize('trainer'), applyToGym);

router.get('/:id', getTrainerById);
router.get('/:id/courses', getTrainerCourses);
router.get('/:id/blogs', getTrainerBlogs);
router.post('/:id/follow', protect, authorize('user'), followTrainer);

module.exports = router;
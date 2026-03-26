const express = require('express');
const {
  getAllTrainers,
  getTrainerById,
  followTrainer,
  getFollowingTrainers,
  getMyFollowers,
  getTrainerStats,
} = require('../controllers/trainerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ PUBLIC ROUTES
router.get('/', getAllTrainers);

// ✅ IMPORTANT: Specific routes MUST come BEFORE dynamic routes
router.get('/following', protect, authorize('user'), getFollowingTrainers);
router.get('/my/followers', protect, authorize('trainer'), getMyFollowers);
router.get('/my/stats', protect, authorize('trainer'), getTrainerStats);

// ✅ Dynamic route MUST be LAST
router.get('/:id', getTrainerById);

// ✅ PROTECTED ROUTES
router.post('/:id/follow', protect, authorize('user'), followTrainer);

module.exports = router;
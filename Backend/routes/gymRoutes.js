const express = require('express');
const {
  createGym,
  getGyms,
  getGymById,
  updateGym,
  deleteGym,
  getNearbyGyms,
} = require('../controllers/gymController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getGyms);
router.get('/nearby', getNearbyGyms);
router.get('/:id', getGymById);

// Protected routes
router.post('/', protect, authorize('owner'), createGym);
router.put('/:id', protect, authorize('owner'), updateGym);
router.delete('/:id', protect, authorize('owner'), deleteGym);

module.exports = router;
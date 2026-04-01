const express = require('express');
const {
  createGym,
  getGyms,
  getGymById,
  updateGym,
  deleteGym,
  getNearbyGyms,
  getGymApplications,
  approveTrainer,
  rejectTrainer,
  removeTrainer,
  getGymTrainers,
} = require('../controllers/gymController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getGyms);
router.get('/nearby', getNearbyGyms);
router.get('/:id', getGymById);

router.post('/', protect, authorize('owner'), createGym);
router.put('/:id', protect, authorize('owner'), updateGym);
router.delete('/:id', protect, authorize('owner'), deleteGym);

// ✅ NEW: Trainer management routes (Owner only)
router.get('/:id/applications', protect, authorize('owner'), getGymApplications);
router.get('/:id/trainers', protect, authorize('owner'), getGymTrainers);
router.put('/:id/trainers/:trainerId/approve', protect, authorize('owner'), approveTrainer);
router.put('/:id/trainers/:trainerId/reject', protect, authorize('owner'), rejectTrainer);
router.delete('/:id/trainers/:trainerId', protect, authorize('owner'), removeTrainer);

module.exports = router;
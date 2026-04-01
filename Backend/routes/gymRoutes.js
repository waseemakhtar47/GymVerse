const express = require('express');
const {
  createGym,
  getGyms,
  getGymById,
  updateGym,
  deleteGym,
  getNearbyGyms,
  getGymApplications,
  getGymSentRequests,
  updateApplicationStatus,
  cancelSentRequest,
  getGymTrainers,
  removeTrainer,
} = require('../controllers/gymController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getGyms);
router.get('/nearby', getNearbyGyms);
router.get('/:id', getGymById);

// Protected routes (owner only)
router.post('/', protect, authorize('owner'), createGym);
router.put('/:id', protect, authorize('owner'), updateGym);
router.delete('/:id', protect, authorize('owner'), deleteGym);

// ✅ Trainer management routes (Owner only)
router.get('/:id/applications', protect, authorize('owner'), getGymApplications);
router.get('/:id/sent-requests', protect, authorize('owner'), getGymSentRequests);
router.get('/:id/trainers', protect, authorize('owner'), getGymTrainers);
router.put('/:id/applications/:trainerId', protect, authorize('owner'), updateApplicationStatus);
router.delete('/:id/sent-requests/:trainerId', protect, authorize('owner'), cancelSentRequest);
router.delete('/:id/trainers/:trainerId', protect, authorize('owner'), removeTrainer);

module.exports = router;
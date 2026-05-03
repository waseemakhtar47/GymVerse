const express = require('express');
const {
  createGym,
  getGyms,
  getOwnerGyms,
  getGymById,
  updateGym,
  deleteGym,
  getNearbyGyms,
  getGymApplications,
  getGymSentRequests,
  getGymTrainers,
  updateApplicationStatus,
  cancelSentRequest,
  removeTrainer,
  addGymRating,
  getGymRatings,
  deleteGymRating,
} = require('../controllers/gymController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// ============== PUBLIC ROUTES (No authentication) ==============
router.get('/', getGyms);  // All gyms for users
router.get('/nearby', getNearbyGyms);
router.get('/:id', getGymById);

// ============== RATINGS & REVIEWS ROUTES ==============
router.get('/:id/ratings', protect, getGymRatings);
router.post('/:id/ratings', protect, addGymRating);
router.delete('/:id/ratings', protect, deleteGymRating);

// ============== OWNER ROUTES (Authentication + Owner role) ==============
router.get('/owner/gyms', protect, authorize('owner'), getOwnerGyms);
router.post('/', protect, authorize('owner'), createGym);
router.put('/:id', protect, authorize('owner'), updateGym);
router.delete('/:id', protect, authorize('owner'), deleteGym);

// ============== TRAINER MANAGEMENT ROUTES (Owner only) ==============
router.get('/:id/applications', protect, authorize('owner'), getGymApplications);
router.get('/:id/sent-requests', protect, authorize('owner'), getGymSentRequests);
router.get('/:id/trainers', getGymTrainers);
router.put('/:id/applications/:trainerId', protect, authorize('owner'), updateApplicationStatus);
router.delete('/:id/sent-requests/:trainerId', protect, authorize('owner'), cancelSentRequest);
router.delete('/:id/trainers/:trainerId', protect, authorize('owner'), removeTrainer);

module.exports = router;
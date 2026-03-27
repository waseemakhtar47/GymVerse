const express = require('express');
const {
  createMembership,
  getMyMemberships,
  getGymMemberships,
  verifyQR,
  cancelMembership,
  getMembershipById,
  getAllMemberships,
} = require('../controllers/membershipController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes (for QR verification)
router.post('/verify', verifyQR);

// User routes
router.get('/my-memberships', protect, getMyMemberships);
router.post('/', protect, createMembership);
router.put('/:id/cancel', protect, cancelMembership);

// Owner routes
router.get('/gym/:gymId', protect, authorize('owner'), getGymMemberships);

// Admin routes
router.get('/', protect, authorize('admin'), getAllMemberships);
router.get('/:id', protect, getMembershipById);

module.exports = router;
const express = require('express');
const {
  createMembership,
  getMyMemberships,
  getGymMemberships,
  verifyQR,
  cancelMembership,
} = require('../controllers/membershipController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createMembership);
router.get('/my-memberships', protect, getMyMemberships);
router.get('/gym/:gymId', protect, authorize('owner'), getGymMemberships);
router.post('/verify', protect, authorize('owner'), verifyQR);
router.put('/:id/cancel', protect, cancelMembership);

module.exports = router;
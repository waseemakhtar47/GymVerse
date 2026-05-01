const express = require('express');
const {
  createMembership,
  getMyMemberships,
  getGymMemberships,
  verifyQR,
  cancelMembership,
  getMembershipById,
  getAllMemberships,
  getEntryLogs,
  checkMembershipStatus,
  deleteMembership,
} = require('../controllers/membershipController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createMembership);
router.get('/my-memberships', protect, getMyMemberships);
router.put('/:id/cancel', protect, cancelMembership);
router.get('/check/:gymId', protect, checkMembershipStatus);
router.get('/gym/:gymId', protect, authorize('owner'), getGymMemberships);
router.post('/verify', protect, verifyQR);
router.get('/', protect, authorize('admin'), getAllMemberships);
router.get('/:id', protect, getMembershipById);
router.get('/:id/logs', protect, getEntryLogs);
router.delete('/:id', protect, deleteMembership);

module.exports = router;
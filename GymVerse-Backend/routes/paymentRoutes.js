const express = require('express');
const {
  createMembershipOrder,
  createCourseOrder,
  verifyPayment,
  getPaymentHistory,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-order/membership', protect, createMembershipOrder);
router.post('/create-order/course', protect, createCourseOrder);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);

module.exports = router;
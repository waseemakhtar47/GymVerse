const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Membership = require('../models/Membership');
const Course = require('../models/Course');
const Gym = require('../models/Gym');

let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log('✅ Razorpay initialized');
} catch (error) {
  console.error('❌ Razorpay init error:', error.message);
}

const getAmountAndPrice = (plan) => {
  switch(plan) {
    case 'monthly': return { amount: 4999, price: 49 };
    case 'quarterly': return { amount: 12999, price: 129 };
    case 'yearly': return { amount: 49999, price: 499 };
    default: return { amount: 4999, price: 49 };
  }
};

// @desc    Create order for membership
const createMembershipOrder = async (req, res) => {
  try {
    console.log('📝 createMembershipOrder called');
    const { gymId, plan } = req.body;
    
    if (!gymId || !plan) {
      return res.status(400).json({ success: false, message: 'gymId and plan are required' });
    }
    
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }
    
    const { amount, price } = getAmountAndPrice(plan);
    
    if (!razorpay) {
      return res.status(500).json({ success: false, message: 'Razorpay not configured' });
    }
    
    const shortGymId = gymId.slice(-8);
    const timestamp = Date.now().toString().slice(-8);
    const receipt = `mem_${shortGymId}_${timestamp}`;
    
    const options = {
      amount: amount,
      currency: 'INR',  // ✅ MUST BE INR
      receipt: receipt,
      notes: {
        type: 'membership',
        gymId: gymId.toString(),
        gymName: gym.name,
        plan: plan,
        price: price,
      },
    };
    
    console.log('Creating order:', options);
    const order = await razorpay.orders.create(options);
    console.log('Order created:', order.id);
    
    const payment = new Payment({
      userId: req.user.id,
      orderId: order.id,
      amount: amount,
      type: 'membership',
      itemId: gymId,
      plan: plan,
      status: 'created',
    });
    await payment.save();
    
    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error('❌ createMembershipOrder error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create order for course
const createCourseOrder = async (req, res) => {
  try {
    console.log('📝 createCourseOrder called');
    const { courseId } = req.body;
    
    if (!courseId) {
      return res.status(400).json({ success: false, message: 'courseId is required' });
    }
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    const amount = Math.round(course.price * 100);
    
    if (!razorpay) {
      return res.status(500).json({ success: false, message: 'Razorpay not configured' });
    }
    
    const shortCourseId = courseId.slice(-8);
    const timestamp = Date.now().toString().slice(-8);
    const receipt = `crs_${shortCourseId}_${timestamp}`;
    
    const options = {
      amount: amount,
      currency: 'INR',  // ✅ MUST BE INR
      receipt: receipt,
      notes: {
        type: 'course',
        courseId: courseId.toString(),
        courseTitle: course.title,
        price: course.price,
      },
    };
    
    const order = await razorpay.orders.create(options);
    
    const payment = new Payment({
      userId: req.user.id,
      orderId: order.id,
      amount: amount,
      type: 'course',
      itemId: courseId,
      status: 'created',
    });
    await payment.save();
    
    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error('❌ createCourseOrder error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify payment
const verifyPayment = async (req, res) => {
  try {
    console.log('📝 verifyPayment called');
    const { orderId, paymentId, signature, type, itemId, plan } = req.body;
    
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    if (expectedSignature !== signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }
    
    const payment = await Payment.findOne({ orderId });
    if (payment) {
      payment.paymentId = paymentId;
      payment.signature = signature;
      payment.status = 'paid';
      await payment.save();
    }
    
    if (type === 'membership') {
      const { price } = getAmountAndPrice(plan);
      const startDate = new Date();
      let endDate = new Date();
      
      switch(plan) {
        case 'monthly': endDate.setMonth(endDate.getMonth() + 1); break;
        case 'quarterly': endDate.setMonth(endDate.getMonth() + 3); break;
        case 'yearly': endDate.setFullYear(endDate.getFullYear() + 1); break;
      }
      
      const membership = await Membership.create({
        userId: req.user.id,
        gymId: itemId,
        plan,
        startDate,
        endDate,
        paymentAmount: price,
        paymentStatus: 'completed',
        status: 'active',
      });
      
      membership.qrCode = `${membership._id}|${req.user.id}|${itemId}`;
      await membership.save();
      
      res.json({
        success: true,
        message: 'Payment successful! Membership created.',
        data: { membership },
      });
    } 
    else if (type === 'course') {
      const course = await Course.findById(itemId);
      if (course) {
        const alreadyEnrolled = course.enrolledUsers?.some(
          u => u.userId.toString() === req.user.id
        );
        
        if (!alreadyEnrolled) {
          course.enrolledUsers = course.enrolledUsers || [];
          course.enrolledUsers.push({ userId: req.user.id });
          await course.save();
        }
      }
      
      res.json({
        success: true,
        message: 'Payment successful! You are now enrolled.',
      });
    }
    
  } catch (error) {
    console.error('❌ verifyPayment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment history
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .sort('-createdAt')
      .populate('itemId', 'name title');
    
    res.json({ success: true, data: payments });
  } catch (error) {
    console.error('getPaymentHistory error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createMembershipOrder,
  createCourseOrder,
  verifyPayment,
  getPaymentHistory,
};
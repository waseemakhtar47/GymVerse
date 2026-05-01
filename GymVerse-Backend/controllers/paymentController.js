const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment");
const Membership = require("../models/Membership");
const Course = require("../models/Course");
const Gym = require("../models/Gym");

let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log("✅ Razorpay initialized successfully");
} catch (error) {
  console.error("❌ Razorpay init error:", error.message);
}

const getAmountAndPrice = async (gymId, plan) => {
  const gym = await Gym.findById(gymId);
  if (gym && gym.pricing) {
    switch (plan) {
      case "monthly":
        return { amount: gym.pricing.monthly * 100, price: gym.pricing.monthly };
      case "quarterly":
        return { amount: gym.pricing.quarterly * 100, price: gym.pricing.quarterly };
      case "yearly":
        return { amount: gym.pricing.yearly * 100, price: gym.pricing.yearly };
      default:
        return { amount: 4999, price: 49 };
    }
  }
  switch (plan) {
    case "monthly":
      return { amount: 4999, price: 49 };
    case "quarterly":
      return { amount: 12999, price: 129 };
    case "yearly":
      return { amount: 49999, price: 499 };
    default:
      return { amount: 4999, price: 49 };
  }
};

// @desc    Create order for membership
const createMembershipOrder = async (req, res) => {
  try {
    const { gymId, plan } = req.body;

    if (!razorpay) {
      return res
        .status(500)
        .json({ success: false, message: "Razorpay not configured" });
    }

    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ success: false, message: "Gym not found" });
    }

    const { amount, price } = await getAmountAndPrice(gymId, plan);

    const shortGymId = gymId.slice(-8);
    const timestamp = Date.now().toString().slice(-8);
    const receipt = `mem_${shortGymId}_${timestamp}`;

    const options = {
      amount: amount,
      currency: "INR",
      receipt: receipt,
      notes: {
        type: "membership",
        gymId: gymId.toString(),
        gymName: gym.name.substring(0, 30),
        plan: plan,
        price: price,
      },
    };

    const order = await razorpay.orders.create(options);

    const payment = new Payment({
      userId: req.user.id,
      orderId: order.id,
      amount: price,
      type: "membership",
      itemId: gymId,
      plan: plan,
      status: "created",
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
    console.error("❌ createMembershipOrder error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create order for course
const createCourseOrder = async (req, res) => {
  try {
    const { courseId } = req.body;

    console.log("📝 createCourseOrder called for course:", courseId);

    if (!razorpay) {
      return res
        .status(500)
        .json({ success: false, message: "Razorpay not configured" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const userId = req.user.id;
    
    const activeEnrollment = course.enrolledUsers?.some(
      (u) => u.userId.toString() === userId && u.status === 'active'
    );
    
    if (activeEnrollment) {
      return res.status(400).json({
        success: false,
        message: "You are already actively enrolled in this course",
      });
    }

    const amountInPaise = Math.round(course.price * 100);
    const amountInRupees = course.price;

    const shortCourseId = courseId.slice(-8);
    const timestamp = Date.now().toString().slice(-8);
    const receipt = `crs_${shortCourseId}_${timestamp}`;

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: receipt,
      notes: {
        type: "course",
        courseId: courseId.toString(),
        courseTitle: course.title.substring(0, 30),
        price: amountInRupees,
      },
    };

    console.log("Creating course order:", options);
    const order = await razorpay.orders.create(options);
    console.log("✅ Course order created:", order.id);

    const payment = new Payment({
      userId: req.user.id,
      orderId: order.id,
      amount: amountInRupees,
      type: "course",
      itemId: courseId,
      status: "created",
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
    console.error("❌ createCourseOrder error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify payment
const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, type, itemId, plan } = req.body;

    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    const payment = await Payment.findOne({ orderId });
    if (payment) {
      payment.paymentId = paymentId;
      payment.signature = signature;
      payment.status = "paid";
      await payment.save();
    }

    if (type === "membership") {
      const gym = await Gym.findById(itemId);
      
      let price = 49;
      if (gym && gym.pricing) {
        switch(plan) {
          case 'monthly': price = gym.pricing.monthly || 49; break;
          case 'quarterly': price = gym.pricing.quarterly || 129; break;
          case 'yearly': price = gym.pricing.yearly || 499; break;
        }
      }
      
      const startDate = new Date();
      let endDate = new Date();

      switch (plan) {
        case "monthly":
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case "quarterly":
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case "yearly":
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
      }

      const membership = await Membership.create({
        userId: req.user.id,
        gymId: itemId,
        plan,
        startDate,
        endDate,
        paymentAmount: price,
        paymentStatus: "completed",
        status: "active",
      });

      membership.qrCode = `${membership._id}|${req.user.id}|${itemId}`;
      await membership.save();

      res.json({
        success: true,
        message: "Payment successful! Membership created.",
        data: { membership },
      });
    }

    else if (type === "course") {
      const course = await Course.findById(itemId);
      if (course) {
        const userId = req.user.id;
        
        const existingEnrollmentIndex = course.enrolledUsers?.findIndex(
          (u) => u.userId.toString() === userId
        );
        
        if (existingEnrollmentIndex !== -1 && existingEnrollmentIndex >= 0) {
          console.log("Reactivating existing enrollment for user:", userId);
          course.enrolledUsers[existingEnrollmentIndex].status = 'active';
          course.enrolledUsers[existingEnrollmentIndex].enrolledAt = new Date();
          const validUntil = new Date();
          validUntil.setDate(validUntil.getDate() + (course.validityDays || 365));
          course.enrolledUsers[existingEnrollmentIndex].validUntil = validUntil;
          course.enrolledUsers[existingEnrollmentIndex].cancelledAt = null;
        } else {
          console.log("Creating new enrollment for user:", userId);
          const validUntil = new Date();
          validUntil.setDate(validUntil.getDate() + (course.validityDays || 365));
          
          course.enrolledUsers.push({
            userId: userId,
            enrolledAt: new Date(),
            validUntil: validUntil,
            status: 'active',
          });
        }
        
        await course.save();
        console.log("✅ User enrolled in course:", course.title);
      }

      res.json({
        success: true,
        message: "Payment successful! You are now enrolled.",
      });
    }
  } catch (error) {
    console.error("❌ verifyPayment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment history
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .sort("-createdAt")
      .populate("itemId", "name title");

    res.json({ success: true, data: payments });
  } catch (error) {
    console.error("getPaymentHistory error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createMembershipOrder,
  createCourseOrder,
  verifyPayment,
  getPaymentHistory,
};
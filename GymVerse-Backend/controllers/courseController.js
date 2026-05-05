const Course = require('../models/Course');

// @desc    Create a new course
const createCourse = async (req, res) => {
  try {
    if (req.user.role !== 'trainer' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only trainers can create courses' });
    }
    
    const course = await Course.create({
      ...req.body,
      trainerId: req.user.id,
    });
    
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    console.error('createCourse error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all courses
const getAllCourses = async (req, res) => {
  try {
    const { category, level, page = 1, limit = 10 } = req.query;
    let query = { isActive: true };
    
    if (category) query.category = category;
    if (level) query.level = level;
    
    const courses = await Course.find(query)
      .populate('trainerId', 'name profilePic')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Course.countDocuments(query);
    
    res.json({
      success: true,
      data: courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('getAllCourses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get course by ID
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('trainerId', 'name profilePic');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.json({ success: true, data: course });
  } catch (error) {
    console.error('getCourseById error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update course
const updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    if (course.trainerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: course });
  } catch (error) {
    console.error('updateCourse error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete course
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    if (course.trainerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    await course.deleteOne();
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    console.error('deleteCourse error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Enroll in course
const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    const userId = req.user.id;
    
    
    // ✅ PEHLE CANCELLED CHECK KARO (ACTIVE SE PEHLE)
    const cancelledEnrollmentIndex = course.enrolledUsers.findIndex(
      u => u.userId.toString() === userId && u.status === 'cancelled'
    );
    
    if (cancelledEnrollmentIndex !== -1) {
      
      // Reactivate cancelled enrollment
      course.enrolledUsers[cancelledEnrollmentIndex].status = 'active';
      course.enrolledUsers[cancelledEnrollmentIndex].enrolledAt = new Date();
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + (course.validityDays || 365));
      course.enrolledUsers[cancelledEnrollmentIndex].validUntil = validUntil;
      course.enrolledUsers[cancelledEnrollmentIndex].cancelledAt = null;
      await course.save();
      
      console.log('Enrollment reactivated successfully');
      return res.json({ 
        success: true, 
        message: 'Enrollment reactivated successfully',
        data: { validUntil }
      });
    }
    
    // Check if user has an ACTIVE enrollment
    const activeEnrollment = course.enrolledUsers.find(
      u => u.userId.toString() === userId && u.status === 'active'
    );
    
    if (activeEnrollment) {
      console.log('Active enrollment found - rejecting');
      return res.status(400).json({ success: false, message: 'You are already enrolled in this course' });
    }
    
    // New enrollment
    console.log('No existing enrollment - creating new');
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (course.validityDays || 365));
    
    course.enrolledUsers.push({ 
      userId: req.user.id,
      enrolledAt: new Date(),
      validUntil: validUntil,
      status: 'active',
    });
    await course.save();
    
    console.log('New enrollment created successfully');
    res.json({ success: true, message: 'Enrolled successfully', data: { validUntil } });
  } catch (error) {
    console.error('enrollCourse error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my enrolled courses
const getMyEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    
    // First, update any expired enrollments
    const courses = await Course.find({ 'enrolledUsers.userId': userId });
    
    for (const course of courses) {
      let updated = false;
      for (const enrollment of course.enrolledUsers) {
        if (enrollment.userId.toString() === userId && 
            enrollment.status === 'active' && 
            new Date(enrollment.validUntil) < now) {
          enrollment.status = 'expired';
          updated = true;
        }
      }
      if (updated) {
        await course.save();
      }
    }
    
    // ✅ Fetch updated courses with POPULATE for user details
    const updatedCourses = await Course.find({ 'enrolledUsers.userId': userId })
      .populate('trainerId', 'name profilePic')
      .populate('enrolledUsers.userId', 'name email profilePic phone'); // ✅ Add this
    
    // Add enrollment details to each course
    const coursesWithValidity = updatedCourses.map(course => {
      const enrollment = course.enrolledUsers.find(
        u => u.userId._id.toString() === userId
      );
      const now = new Date();
      const isValid = enrollment?.status === 'active' && new Date(enrollment.validUntil) > now;
      
      // Check if user has rated this course
      const userRating = course.ratings?.find(r => r.userId.toString() === userId);
      
      return {
        ...course.toObject(),
        userRating: userRating || null,
        enrollmentDetails: {
          enrolledAt: enrollment?.enrolledAt,
          validUntil: enrollment?.validUntil,
          isValid: isValid,
          status: enrollment?.status || 'active',
          daysRemaining: isValid ? Math.ceil((new Date(enrollment.validUntil) - now) / (1000 * 60 * 60 * 24)) : 0,
        }
      };
    });
    
    res.json({ success: true, data: coursesWithValidity });
  } catch (error) {
    console.error('getMyEnrolledCourses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my courses (trainer)
const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ trainerId: req.user.id })
      .populate('enrolledUsers.userId', 'name email phone profilePic');
    
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('getMyCourses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Check course access validity
const checkCourseAccess = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    // ✅ GRANT ACCESS TO TRAINER WHO OWN THE COURSE
    if (req.user.role === 'trainer' && course.trainerId.toString() === req.user.id) {
      return res.json({
        success: true,
        data: {
          hasAccess: true,
          isOwner: true,
          message: 'You are the course owner'
        }
      });
    }
    
    // For users / other roles, check enrollment
    const enrollment = course.enrolledUsers?.find(
      u => u.userId.toString() === req.user.id
    );
    
    if (!enrollment) {
      return res.json({
        success: true,
        data: { hasAccess: false, reason: 'Not enrolled' }
      });
    }
    
    const now = new Date();
    const isValid = enrollment.status === 'active' && new Date(enrollment.validUntil) > now;
    
    if (!isValid && enrollment.status === 'active') {
      enrollment.status = 'expired';
      await course.save();
    }
    
    const daysRemaining = Math.ceil((new Date(enrollment.validUntil) - now) / (1000 * 60 * 60 * 24));
    
    res.json({
      success: true,
      data: {
        hasAccess: isValid,
        enrolledAt: enrollment.enrolledAt,
        validUntil: enrollment.validUntil,
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
        status: enrollment.status,
      }
    });
  } catch (error) {
    console.error('checkCourseAccess error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add or update rating for a course (only for enrolled students)
const addCourseRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }
    
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    // ✅ Check if user is enrolled in this course
    const isEnrolled = course.enrolledUsers.some(
      e => e.userId.toString() === userId && e.status === 'active'
    );
    
    if (!isEnrolled) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only rate courses you are enrolled in' 
      });
    }
    
    // Check if user already rated this course
    const existingRatingIndex = course.ratings.findIndex(
      r => r.userId.toString() === userId
    );
    
    if (existingRatingIndex !== -1) {
      // Update existing rating
      course.ratings[existingRatingIndex].rating = rating;
      course.ratings[existingRatingIndex].review = review || '';
      course.ratings[existingRatingIndex].updatedAt = new Date();
    } else {
      // Add new rating
      course.ratings.push({
        userId: userId,
        rating: rating,
        review: review || '',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Update average rating
    await course.updateAverageRating();
    await course.populate('ratings.userId', 'name profilePic');
    
    res.json({ 
      success: true, 
      message: existingRatingIndex !== -1 ? 'Rating updated successfully' : 'Rating added successfully',
      data: {
        averageRating: course.averageRating,
        totalReviews: course.totalReviews,
        userRating: rating,
        userReview: review || ''
      }
    });
  } catch (error) {
    console.error('addCourseRating error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get course ratings and reviews
const getCourseRatings = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findById(id).populate('ratings.userId', 'name profilePic');
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    // Get user's own rating if logged in
    let userRating = null;
    if (req.user && req.user.id) {
      const userRatingObj = course.ratings.find(
        r => r.userId._id.toString() === req.user.id
      );
      if (userRatingObj) {
        userRating = {
          rating: userRatingObj.rating,
          review: userRatingObj.review,
          createdAt: userRatingObj.createdAt
        };
      }
    }
    
    // Check if user can rate (is enrolled)
    let canRate = false;
    if (req.user && req.user.id) {
      canRate = course.enrolledUsers.some(
        e => e.userId.toString() === req.user.id && e.status === 'active'
      );
    }
    
    const sortedRatings = [...course.ratings].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    res.json({ 
      success: true, 
      data: {
        averageRating: course.averageRating,
        totalReviews: course.totalReviews,
        ratings: sortedRatings,
        userRating: userRating,
        canRate: canRate
      }
    });
  } catch (error) {
    console.error('getCourseRatings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user's own rating
const deleteCourseRating = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    const ratingIndex = course.ratings.findIndex(
      r => r.userId.toString() === userId
    );
    
    if (ratingIndex === -1) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }
    
    course.ratings.splice(ratingIndex, 1);
    await course.updateAverageRating();
    
    res.json({ success: true, message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('deleteCourseRating error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel course enrollment
const cancelEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
  
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    // Find enrollment index
    const enrollmentIndex = course.enrolledUsers.findIndex(
      e => e.userId.toString() === userId
    );
    
    if (enrollmentIndex === -1) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }
    
    console.log('Current enrollment status:', course.enrolledUsers[enrollmentIndex].status);
    
    // Update status to cancelled
    course.enrolledUsers[enrollmentIndex].status = 'cancelled';
    course.enrolledUsers[enrollmentIndex].cancelledAt = new Date();
    await course.save();
    
    console.log('Enrollment status changed to:', course.enrolledUsers[enrollmentIndex].status);
    
    res.json({ success: true, message: 'Course enrollment cancelled successfully' });
  } catch (error) {
    console.error('cancelEnrollment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Check and update expired enrollments
const checkExpiredEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    
    // Find all courses where user is enrolled
    const courses = await Course.find({
      'enrolledUsers.userId': userId
    });
    
    let updatedCount = 0;
    
    for (const course of courses) {
      let updated = false;
      
      for (const enrollment of course.enrolledUsers) {
        if (enrollment.userId.toString() === userId && 
            enrollment.status === 'active' && 
            new Date(enrollment.validUntil) < now) {
          enrollment.status = 'expired';
          updated = true;
          updatedCount++;
        }
      }
      
      if (updated) {
        await course.save();
      }
    }
    
    res.json({ 
      success: true, 
      message: `${updatedCount} expired enrollments updated`,
      updatedCount 
    });
  } catch (error) {
    console.error('checkExpiredEnrollments error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clean up all cancelled enrollments for current user
const cleanCancelledEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all courses with cancelled enrollment for this user
    const courses = await Course.find({
      'enrolledUsers.userId': userId,
      'enrolledUsers.status': 'cancelled'
    });
    
    let cleanedCount = 0;
    
    for (const course of courses) {
      const originalLength = course.enrolledUsers.length;
      course.enrolledUsers = course.enrolledUsers.filter(
        e => !(e.userId.toString() === userId && e.status === 'cancelled')
      );
      
      if (originalLength !== course.enrolledUsers.length) {
        cleanedCount++;
        await course.save();
      }
    }
    
    res.json({ 
      success: true, 
      message: `Cleaned ${cleanedCount} cancelled enrollments`,
      cleanedCount 
    });
  } catch (error) {
    console.error('cleanCancelledEnrollments error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollCourse,
  getMyEnrolledCourses,
  getMyCourses,
  checkCourseAccess,
  addCourseRating,
  getCourseRatings,
  deleteCourseRating,
  cancelEnrollment,
  checkExpiredEnrollments,
  cleanCancelledEnrollments,
};

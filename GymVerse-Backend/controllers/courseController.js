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
    
    const alreadyEnrolled = course.enrolledUsers?.some(
      u => u.userId.toString() === req.user.id
    );
    
    if (alreadyEnrolled) {
      return res.status(400).json({ success: false, message: 'Already enrolled' });
    }
    
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (course.validityDays || 365));
    
    course.enrolledUsers.push({ 
      userId: req.user.id,
      enrolledAt: new Date(),
      validUntil: validUntil,
      status: 'active',
    });
    await course.save();
    
    res.json({ success: true, message: 'Enrolled successfully', data: { validUntil } });
  } catch (error) {
    console.error('enrollCourse error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my enrolled courses
const getMyEnrolledCourses = async (req, res) => {
  try {
    const courses = await Course.find({ 'enrolledUsers.userId': req.user.id })
      .populate('trainerId', 'name profilePic');
    
    // Add validity info to each course
    const coursesWithValidity = courses.map(course => {
      const enrollment = course.enrolledUsers.find(
        u => u.userId.toString() === req.user.id
      );
      const now = new Date();
      const isValid = enrollment?.status === 'active' && new Date(enrollment.validUntil) > now;
      
      return {
        ...course.toObject(),
        enrollmentDetails: {
          enrolledAt: enrollment?.enrolledAt,
          validUntil: enrollment?.validUntil,
          isValid: isValid,
          daysRemaining: isValid ? Math.ceil((new Date(enrollment.validUntil) - now) / (1000 * 60 * 60 * 24)) : 0,
          status: enrollment?.status,
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
    const courses = await Course.find({ trainerId: req.user.id });
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
};
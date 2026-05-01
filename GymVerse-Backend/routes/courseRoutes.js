const express = require('express');
const {
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
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ STATIC ROUTES (SPECIFIC STRINGS) - MUST COME FIRST
router.get('/check-expired', protect, checkExpiredEnrollments);
router.delete('/clean-cancelled', protect, cleanCancelledEnrollments);

// Public routes
router.get('/', getAllCourses);

// Get my courses (protected)
router.get('/my/enrolled', protect, authorize('user'), getMyEnrolledCourses);
router.get('/my/courses', protect, authorize('trainer'), getMyCourses);

// Course access
router.get('/:courseId/access', protect, checkCourseAccess);

// Enrollment actions
router.post('/:id/enroll', protect, authorize('user'), enrollCourse);
router.delete('/:id/cancel-enrollment', protect, authorize('user'), cancelEnrollment);

// Ratings routes
router.get('/:id/ratings', protect, getCourseRatings);
router.post('/:id/ratings', protect, addCourseRating);
router.delete('/:id/ratings', protect, deleteCourseRating);

// ✅ DYNAMIC ROUTES (WITH :id) - MUST COME LAST
router.get('/:id', getCourseById);
router.post('/', protect, authorize('trainer', 'admin'), createCourse);
router.put('/:id', protect, updateCourse);
router.delete('/:id', protect, deleteCourse);

module.exports = router;
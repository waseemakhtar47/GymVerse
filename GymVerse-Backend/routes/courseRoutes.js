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
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Protected routes
router.post('/', protect, authorize('trainer', 'admin'), createCourse);
router.put('/:id', protect, updateCourse);
router.delete('/:id', protect, deleteCourse);
router.post('/:id/enroll', protect, authorize('user'), enrollCourse);
router.get('/my/enrolled', protect, authorize('user'), getMyEnrolledCourses);
router.get('/my/courses', protect, authorize('trainer'), getMyCourses);
router.get('/:courseId/access', protect, checkCourseAccess);

module.exports = router;
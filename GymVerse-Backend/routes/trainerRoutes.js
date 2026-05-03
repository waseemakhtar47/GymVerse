const express = require('express');
const {
  getAllTrainers,
  getTrainerById,
  followTrainer,
  getFollowingTrainers,
  getMyFollowers,
  getTrainerStats,
  getTrainerCourses,
  getTrainerBlogs,
  getAvailableGyms,
  applyToGym,
  getMyApplications,
  getMyRequests,
  updateRequestStatus,
  getMyGyms,
  leaveGym,
  getApprovedGymIds,
  getTrainerStudents,
  addTrainerRating,
  getTrainerRatings,
  deleteTrainerRating,
    getTrainerAssociatedGyms,
} = require('../controllers/trainerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public
router.get('/', getAllTrainers);


// Trainer specific
router.get('/approved-gym-ids', protect, authorize('trainer'), getApprovedGymIds);
router.delete('/leave-gym/:gymId', protect, authorize('trainer'), leaveGym);
router.get('/my-gyms', protect, authorize('trainer'), getMyGyms);
router.get('/following', protect, authorize('user'), getFollowingTrainers);
router.get('/my/followers', protect, authorize('trainer'), getMyFollowers);
router.get('/my/stats', protect, authorize('trainer'), getTrainerStats);
router.get('/available-gyms', protect, authorize('trainer'), getAvailableGyms);
router.get('/my-applications', protect, authorize('trainer'), getMyApplications);
router.get('/my-requests', protect, authorize('trainer'), getMyRequests);
router.put('/requests/:requestId', protect, authorize('trainer'), updateRequestStatus);
router.post('/apply/:gymId', protect, authorize('trainer', 'owner'), applyToGym);
router.get('/my-students', protect, authorize('trainer'), getTrainerStudents); 

// Dynamic
// Trainer rating routes

router.get('/:id', getTrainerById);
router.get('/:id/courses', getTrainerCourses);
router.get('/:id/blogs', getTrainerBlogs);
router.post('/:id/follow', protect, authorize('user'), followTrainer);
// Trainer rating routes
router.get('/:id/ratings', getTrainerRatings);
router.post('/:id/ratings', protect, addTrainerRating);
router.delete('/:id/ratings', protect, deleteTrainerRating);
router.get('/:id/associated-gyms', getTrainerAssociatedGyms);

module.exports = router;
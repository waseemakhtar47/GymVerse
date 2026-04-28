const express = require('express');
const {
  getProfile,
  updateProfile,
  changePassword,
  updateProfilePic,
  searchUsers,
  getFitnessStreak,
   getUserById,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile/:id', protect, getUserById);
router.get('/search', protect, searchUsers);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/profile-pic', protect, updateProfilePic);


module.exports = router;
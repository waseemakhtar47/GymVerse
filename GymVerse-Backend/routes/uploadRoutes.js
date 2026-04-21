const express = require('express');
const { 
  videoUpload, 
  thumbnailUpload, 
  uploadVideo, 
  uploadThumbnail 
} = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/video', protect, authorize('trainer', 'admin'), videoUpload.single('video'), uploadVideo);
router.post('/thumbnail', protect, authorize('trainer', 'admin'), thumbnailUpload.single('thumbnail'), uploadThumbnail);

module.exports = router;
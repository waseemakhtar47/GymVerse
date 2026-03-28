const User = require('../models/User');
const Course = require('../models/Course');
const Blog = require('../models/Blog');

// @desc    Get all trainers
const getAllTrainers = async (req, res) => {
  try {
    // Remove isActive filter temporarily
    const trainers = await User.find({ role: 'trainer' })
      .select('-password')
      .sort('-createdAt');
    
    // Add stats to each trainer
    const trainersWithStats = await Promise.all(trainers.map(async (trainer) => {
      const courses = await Course.countDocuments({ trainerId: trainer._id });
      const blogs = await Blog.countDocuments({ authorId: trainer._id });
      const followersCount = trainer.followers?.length || 0;
      
      return { 
        ...trainer.toObject(), 
        courses, 
        blogs, 
        followers: followersCount,
        bio: trainer.bio || 'Expert fitness trainer passionate about helping you achieve your goals.',
        specialty: trainer.specialty || 'Strength & Conditioning',
        experience: trainer.experience || '5+ years',
      };
    }));
    
    res.json({ success: true, data: trainersWithStats });
  } catch (error) {
    console.error('getAllTrainers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Get trainer by ID
const getTrainerById = async (req, res) => {
  try {
    const trainer = await User.findById(req.params.id).select('-password');
    if (!trainer || trainer.role !== 'trainer') {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }
    
    const courses = await Course.find({ trainerId: trainer._id });
    const blogs = await Blog.find({ authorId: trainer._id });
    const followersCount = trainer.followers?.length || 0;
    
    res.json({
      success: true,
      data: { ...trainer.toObject(), courses, blogs, followers: followersCount }
    });
  } catch (error) {
    console.error('getTrainerById error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Follow/unfollow trainer
const followTrainer = async (req, res) => {
  try {
    const trainer = await User.findById(req.params.id);
    if (!trainer || trainer.role !== 'trainer') {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!trainer.followers) trainer.followers = [];
    if (!user.following) user.following = [];
    
    const alreadyFollowing = trainer.followers.includes(req.user.id);
    
    if (alreadyFollowing) {
      trainer.followers = trainer.followers.filter(f => f.toString() !== req.user.id);
      user.following = user.following.filter(f => f.toString() !== req.params.id);
    } else {
      trainer.followers.push(req.user.id);
      user.following.push(req.params.id);
    }
    
    await trainer.save();
    await user.save();
    
    res.json({
      success: true,
      data: { 
        following: !alreadyFollowing, 
        followersCount: trainer.followers?.length || 0 
      }
    });
  } catch (error) {
    console.error('followTrainer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get following trainers (user)
const getFollowingTrainers = async (req, res) => {
  try {
    // Find trainers where the current user is in followers array
    const trainers = await User.find({ 
      role: 'trainer', 
      followers: { $in: [req.user.id] }
    }).select('-password');
    
    // Add stats to each trainer
    const trainersWithStats = await Promise.all(trainers.map(async (trainer) => {
      const courses = await Course.countDocuments({ trainerId: trainer._id });
      const blogs = await Blog.countDocuments({ authorId: trainer._id });
      return { ...trainer.toObject(), courses, blogs, followers: trainer.followers?.length || 0 };
    }));
    
    res.json({ success: true, data: trainersWithStats });
  } catch (error) {
    console.error('getFollowingTrainers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my followers (trainer)
const getMyFollowers = async (req, res) => {
  try {
    const trainer = await User.findById(req.user.id)
      .populate('followers', 'name email profilePic');
    
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }
    
    res.json({ success: true, data: trainer.followers || [] });
  } catch (error) {
    console.error('getMyFollowers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trainer stats
const getTrainerStats = async (req, res) => {
  try {
    const courses = await Course.countDocuments({ trainerId: req.user.id });
    const blogs = await Blog.countDocuments({ authorId: req.user.id });
    
    // Get total enrolled students
    const enrolledStudents = await Course.aggregate([
      { $match: { trainerId: req.user.id } },
      { $unwind: { path: '$enrolledUsers', preserveNullAndEmptyArrays: true } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    
    const trainer = await User.findById(req.user.id);
    const followersCount = trainer?.followers?.length || 0;
    
    res.json({
      success: true,
      data: {
        courses,
        blogs,
        students: enrolledStudents[0]?.count || 0,
        followers: followersCount,
        earnings: 0 // TODO: Add earnings calculation
      }
    });
  } catch (error) {
    console.error('getTrainerStats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trainer's courses
const getTrainerCourses = async (req, res) => {
  try {
    const courses = await Course.find({ 
      trainerId: req.params.id, 
      isActive: true 
    }).select('title price enrolledUsers createdAt thumbnail');
    
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('getTrainerCourses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trainer's blogs
const getTrainerBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ 
      authorId: req.params.id, 
      isPublished: true 
    }).select('title views createdAt excerpt');
    
    res.json({ success: true, data: blogs });
  } catch (error) {
    console.error('getTrainerBlogs error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllTrainers,
  getTrainerById,
  followTrainer,
  getFollowingTrainers,
  getMyFollowers,
  getTrainerStats,
  getTrainerCourses,
  getTrainerBlogs,
};
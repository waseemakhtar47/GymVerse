const User = require('../models/User');
const Gym = require('../models/Gym');
const Course = require('../models/Course');
const Blog = require('../models/Blog');

// @desc    Get all trainers
const getAllTrainers = async (req, res) => {
  try {
    const trainers = await User.find({ role: 'trainer', isActive: true })
      .select('-password')
      .sort('-createdAt');
    
    const trainersWithStats = await Promise.all(trainers.map(async (trainer) => {
      const courses = await Course.countDocuments({ trainerId: trainer._id });
      const blogs = await Blog.countDocuments({ authorId: trainer._id });
      const followersCount = trainer.followers?.length || 0;
      return { ...trainer.toObject(), courses, blogs, followers: followersCount };
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
      data: { following: !alreadyFollowing, followersCount: trainer.followers?.length || 0 }
    });
  } catch (error) {
    console.error('followTrainer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get following trainers (user)
const getFollowingTrainers = async (req, res) => {
  try {
    const trainers = await User.find({ role: 'trainer', followers: { $in: [req.user.id] } }).select('-password');
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
    const trainer = await User.findById(req.user.id).populate('followers', 'name email profilePic');
    res.json({ success: true, data: trainer?.followers || [] });
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
    const enrolledStudents = await Course.aggregate([
      { $match: { trainerId: req.user.id } },
      { $unwind: { path: '$enrolledUsers', preserveNullAndEmptyArrays: true } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    const trainer = await User.findById(req.user.id);
    const followersCount = trainer?.followers?.length || 0;
    
    res.json({
      success: true,
      data: { courses, blogs, students: enrolledStudents[0]?.count || 0, followers: followersCount, earnings: 0 }
    });
  } catch (error) {
    console.error('getTrainerStats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trainer's courses
const getTrainerCourses = async (req, res) => {
  try {
    const courses = await Course.find({ trainerId: req.params.id, isActive: true }).select('title price enrolledUsers createdAt thumbnail');
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('getTrainerCourses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trainer's blogs
const getTrainerBlogs = async (req, res) => {
  try {
    const trainerId = req.params.id;
    
    const trainer = await User.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }
    
    const blogs = await Blog.find({ 
      authorId: trainerId, 
      isPublished: true 
    })
    .select('title views createdAt excerpt featuredImage category')
    .sort({ createdAt: -1 });
    
    const blogsWithCounts = blogs.map(blog => ({
      ...blog.toObject(),
      likeCount: blog.likes?.length || 0,
      commentCount: blog.comments?.length || 0,
    }));
    
    res.json({ success: true, data: blogsWithCounts });
  } catch (error) {
    console.error('getTrainerBlogs error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get available gyms for trainers to apply
const getAvailableGyms = async (req, res) => {
  try {
    const gyms = await Gym.find({ isActive: true }).populate('ownerId', 'name email').select('name address description facilities contactNumber timings');
    res.json({ success: true, data: gyms });
  } catch (error) {
    console.error('getAvailableGyms error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Apply to a gym
const applyToGym = async (req, res) => {
  try {
    const { gymId } = req.params;
    const trainerId = req.user.id;
    
    const gym = await Gym.findById(gymId);
    if (!gym) return res.status(404).json({ success: false, message: 'Gym not found' });
    
    const alreadyApplied = gym.trainers.some(t => t.trainerId.toString() === trainerId);
    if (alreadyApplied) return res.status(400).json({ success: false, message: 'Already applied to this gym' });
    
    gym.trainers.push({ trainerId, status: 'pending' });
    await gym.save();
    
    const trainer = await User.findById(trainerId);
    trainer.appliedGyms.push({ gymId, status: 'pending' });
    await trainer.save();
    
    res.json({ success: true, message: 'Application submitted successfully' });
  } catch (error) {
    console.error('applyToGym error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my applications (trainer)
const getMyApplications = async (req, res) => {
  try {
    const trainer = await User.findById(req.user.id).populate('appliedGyms.gymId', 'name address contactNumber');
    res.json({ success: true, data: trainer.appliedGyms || [] });
  } catch (error) {
    console.error('getMyApplications error:', error);
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
  getAvailableGyms,
  applyToGym,
  getMyApplications,
};
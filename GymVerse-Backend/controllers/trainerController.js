const User = require('../models/User');
const Gym = require('../models/Gym');
const Course = require('../models/Course');
const Blog = require('../models/Blog');

// ============== HELPER FUNCTIONS ==============
const syncRelation = async (trainerId, gymId, status, source) => {
  const trainer = await User.findById(trainerId);
  const gym = await Gym.findById(gymId);
  
  if (!trainer || !gym) return false;
  
  // Update trainer's appliedGyms
  const existingTrainerApp = trainer.appliedGyms.find(a => a.gymId.toString() === gymId);
  if (existingTrainerApp) {
    existingTrainerApp.status = status;
    existingTrainerApp.source = source;
  } else {
    trainer.appliedGyms.push({ gymId, status, source });
  }
  await trainer.save();
  
  // Update gym's trainers
  const existingGymTrainer = gym.trainers.find(t => t.trainerId.toString() === trainerId);
  if (existingGymTrainer) {
    existingGymTrainer.status = status;
    existingGymTrainer.source = source;
    if (status === 'approved') {
      existingGymTrainer.joinedAt = new Date();
    }
  } else {
    gym.trainers.push({ trainerId, status, source });
  }
  await gym.save();
  
  // Update associated gym
  if (status === 'approved') {
    trainer.associatedGym = gymId;
  } else if (status === 'rejected' && trainer.associatedGym?.toString() === gymId) {
    trainer.associatedGym = null;
  }
  await trainer.save();
  
  return true;
};

// ============== MAIN CONTROLLERS ==============

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
// @desc    Get trainer stats
const getTrainerStats = async (req, res) => {
  try {
    const courses = await Course.countDocuments({ trainerId: req.user.id });
    const blogs = await Blog.countDocuments({ authorId: req.user.id });
    
    // ✅ CORRECT: Count unique students across all courses
    const coursesList = await Course.find({ trainerId: req.user.id });
    const enrolledStudents = new Set();
    
    for (const course of coursesList) {
      if (course.enrolledUsers && course.enrolledUsers.length > 0) {
        course.enrolledUsers.forEach(enrollment => {
          enrolledStudents.add(enrollment.userId.toString());
        });
      }
    }
    
    const totalStudents = enrolledStudents.size;
    
    const trainer = await User.findById(req.user.id);
    const followersCount = trainer?.followers?.length || 0;
    
    // Calculate total revenue from course enrollments
    let totalRevenue = 0;
    for (const course of coursesList) {
      if (course.enrolledUsers && course.price) {
        totalRevenue += course.enrolledUsers.length * course.price;
      }
    }
    
    res.json({
      success: true,
      data: { 
        courses, 
        blogs, 
        students: totalStudents, 
        followers: followersCount, 
        earnings: totalRevenue 
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
    
    const blogs = await Blog.find({ authorId: trainerId, isPublished: true })
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

// @desc    Apply to a gym (trainer) OR Send hiring request (owner)
const applyToGym = async (req, res) => {
  try {
    const { gymId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const gym = await Gym.findById(gymId);
    if (!gym) return res.status(404).json({ success: false, message: 'Gym not found' });
    
    let trainerId = userId;
    let source = 'trainer'; // default
    
    if (userRole === 'owner') {
      const { trainerId: trainerIdFromBody } = req.body;
      if (!trainerIdFromBody) {
        return res.status(400).json({ success: false, message: 'Trainer ID is required' });
      }
      trainerId = trainerIdFromBody;
      source = 'owner'; // ✅ Owner-initiated request
      
      const trainer = await User.findById(trainerId);
      if (!trainer || trainer.role !== 'trainer') {
        return res.status(404).json({ success: false, message: 'Trainer not found' });
      }
    }
    
    // Check existing relation
    const trainer = await User.findById(trainerId);
    const existingApp = trainer.appliedGyms.find(a => a.gymId.toString() === gymId);
    
    if (existingApp) {
      if (existingApp.status === 'approved') {
        return res.status(400).json({ success: false, message: 'Already associated with this gym' });
      }
      if (existingApp.status === 'pending') {
        return res.status(400).json({ success: false, message: 'Request already pending' });
      }
      if (existingApp.status === 'rejected') {
        // Update to pending
        existingApp.status = 'pending';
        existingApp.source = source;
        await trainer.save();
        
        // Also update gym
        const gymTrainer = gym.trainers.find(t => t.trainerId.toString() === trainerId);
        if (gymTrainer) {
          gymTrainer.status = 'pending';
          gymTrainer.source = source;
          await gym.save();
        } else {
          gym.trainers.push({ trainerId, status: 'pending', source });
          await gym.save();
        }
        
        return res.json({ 
          success: true, 
          message: source === 'owner' ? 'Hiring request sent again' : 'Application resubmitted' 
        });
      }
    }
    
    // Create new request
    trainer.appliedGyms.push({ gymId, status: 'pending', source });
    await trainer.save();
    
    gym.trainers.push({ trainerId, status: 'pending', source });
    await gym.save();
    
    const trainerName = await User.findById(trainerId);
    const message = source === 'owner' 
      ? `Hiring request sent to ${trainerName.name} successfully` 
      : 'Application submitted successfully';
    
    res.json({ success: true, message, source });
  } catch (error) {
    console.error('applyToGym error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my applications (trainer-initiated only)
const getMyApplications = async (req, res) => {
  try {
    const trainer = await User.findById(req.user.id)
      .populate('appliedGyms.gymId', 'name address contactNumber');
    
    // ✅ Only show trainer-initiated (source = 'trainer')
    const applications = (trainer.appliedGyms || []).filter(a => a.source === 'trainer');
    res.json({ success: true, data: applications });
  } catch (error) {
    console.error('getMyApplications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get offers (owner-initiated requests for trainer)
const getMyRequests = async (req, res) => {
  try {
    const trainer = await User.findById(req.user.id)
      .populate('appliedGyms.gymId', 'name address contactNumber ownerId')
      .populate('appliedGyms.gymId.ownerId', 'name email');
    
    // ✅ Only show owner-initiated (source = 'owner')
    const requests = (trainer.appliedGyms || []).filter(a => a.source === 'owner');
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('getMyRequests error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept or reject request (for trainer)
const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const trainer = await User.findById(req.user.id);
    const request = trainer.appliedGyms.id(requestId);
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    
    const gymId = request.gymId;
    request.status = status;
    await trainer.save();
    
    // Update gym side
    const gym = await Gym.findById(gymId);
    if (gym) {
      const gymTrainer = gym.trainers.find(t => t.trainerId.toString() === req.user.id);
      if (gymTrainer) {
        gymTrainer.status = status;
        if (status === 'approved') {
          gymTrainer.joinedAt = new Date();
        }
        await gym.save();
      }
    }
    
    if (status === 'approved') {
      trainer.associatedGym = gymId;
      await trainer.save();
    }
    
    res.json({ 
      success: true, 
      message: status === 'approved' ? 'Congratulations! You are now associated with the gym' : 'Request declined',
      status: status
    });
  } catch (error) {
    console.error('updateRequestStatus error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get gym applications (for owner) - trainer-initiated requests
const getGymApplications = async (req, res) => {
  try {
    const { gymId } = req.params;
    
    const gym = await Gym.findById(gymId);
    if (!gym) return res.status(404).json({ success: false, message: 'Gym not found' });
    
    if (gym.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    // ✅ Only show trainer-initiated applications
    const applications = gym.trainers.filter(t => t.source === 'trainer' && t.status === 'pending');
    
    // Populate trainer details
    const populatedApps = await Promise.all(applications.map(async (app) => {
      const trainer = await User.findById(app.trainerId).select('name email profilePic phone');
      return { ...app.toObject(), trainerId: trainer };
    }));
    
    res.json({ success: true, data: populatedApps });
  } catch (error) {
    console.error('getGymApplications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get sent requests (for owner) - owner-initiated requests
const getGymSentRequests = async (req, res) => {
  try {
    const { gymId } = req.params;
    
    const gym = await Gym.findById(gymId);
    if (!gym) return res.status(404).json({ success: false, message: 'Gym not found' });
    
    if (gym.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    // ✅ Only show owner-initiated requests
    const requests = gym.trainers.filter(t => t.source === 'owner' && t.status === 'pending');
    
    // Populate trainer details
    const populatedRequests = await Promise.all(requests.map(async (req) => {
      const trainer = await User.findById(req.trainerId).select('name email profilePic phone');
      return { ...req.toObject(), trainerId: trainer };
    }));
    
    res.json({ success: true, data: populatedRequests });
  } catch (error) {
    console.error('getGymSentRequests error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Owner approves/rejects application (trainer-initiated)
const updateApplicationStatus = async (req, res) => {
  try {
    const { gymId, trainerId } = req.params;
    const { status } = req.body;
    
    const gym = await Gym.findById(gymId);
    if (!gym) return res.status(404).json({ success: false, message: 'Gym not found' });
    
    if (gym.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    // Update gym side
    const gymTrainer = gym.trainers.find(t => t.trainerId.toString() === trainerId);
    if (gymTrainer) {
      gymTrainer.status = status;
      if (status === 'approved') {
        gymTrainer.joinedAt = new Date();
      }
      await gym.save();
    }
    
    // Update trainer side
    const trainer = await User.findById(trainerId);
    const trainerApp = trainer.appliedGyms.find(a => a.gymId.toString() === gymId);
    if (trainerApp) {
      trainerApp.status = status;
      await trainer.save();
    }
    
    // Update associated gym if approved
    if (status === 'approved') {
      trainer.associatedGym = gymId;
      await trainer.save();
    }
    
    res.json({ 
      success: true, 
      message: status === 'approved' ? 'Trainer approved successfully' : 'Application rejected' 
    });
  } catch (error) {
    console.error('updateApplicationStatus error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Owner cancels sent request (owner-initiated)
const cancelSentRequest = async (req, res) => {
  try {
    const { gymId, trainerId } = req.params;
    
    const gym = await Gym.findById(gymId);
    if (!gym) return res.status(404).json({ success: false, message: 'Gym not found' });
    
    if (gym.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    // Remove from gym
    gym.trainers = gym.trainers.filter(t => !(t.trainerId.toString() === trainerId && t.source === 'owner'));
    await gym.save();
    
    // Remove from trainer
    const trainer = await User.findById(trainerId);
    if (trainer) {
      trainer.appliedGyms = trainer.appliedGyms.filter(a => !(a.gymId.toString() === gymId && a.source === 'owner'));
      await trainer.save();
    }
    
    res.json({ success: true, message: 'Request cancelled' });
  } catch (error) {
    console.error('cancelSentRequest error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trainer's associated gyms (where approved from either side)
const getMyGyms = async (req, res) => {
  try {
    const trainer = await User.findById(req.user.id)
      .populate('appliedGyms.gymId', 'name address contactNumber timings profilePic facilities description');
    
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }
    
    // ✅ Filter only approved gyms and skip null gymId
    const approvedGyms = trainer.appliedGyms
      .filter(app => app.status === 'approved' && app.gymId !== null)
      .map(app => {
        if (!app.gymId) return null;
        return {
          ...app.gymId.toObject(),
          joinedAt: app.appliedAt,
          status: app.status,
          source: app.source || 'trainer'
        };
      })
      .filter(gym => gym !== null);
    
    res.json({ success: true, data: approvedGyms });
  } catch (error) {
    console.error('getMyGyms error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Trainer leaves a gym (removes association)
const leaveGym = async (req, res) => {
  try {
    const { gymId } = req.params;
    const trainerId = req.user.id;
    
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }
    
    const trainer = await User.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }
    
    // Remove from gym's trainers list
    gym.trainers = gym.trainers.filter(t => t.trainerId.toString() !== trainerId);
    await gym.save();
    
    // Remove from trainer's appliedGyms
    trainer.appliedGyms = trainer.appliedGyms.filter(a => a.gymId.toString() !== gymId);
    
    // Remove associated gym if it matches
    if (trainer.associatedGym?.toString() === gymId) {
      trainer.associatedGym = null;
    }
    await trainer.save();
    
    res.json({ success: true, message: 'Successfully left the gym' });
  } catch (error) {
    console.error('leaveGym error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all approved gym IDs for trainer (for status check)
const getApprovedGymIds = async (req, res) => {
  try {
    const trainer = await User.findById(req.user.id);
    
    const approvedGymIds = trainer.appliedGyms
      .filter(app => app.status === 'approved')
      .map(app => app.gymId.toString());
    
    res.json({ success: true, data: approvedGymIds });
  } catch (error) {
    console.error('getApprovedGymIds error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all students enrolled in trainer's courses
const getTrainerStudents = async (req, res) => {
  try {
    const trainerId = req.user.id;
    
    // Get all courses of this trainer
    const courses = await Course.find({ trainerId: trainerId });
    
    if (!courses.length) {
      return res.json({ success: true, data: [] });
    }
    
    // Collect all enrolled students with their course details
    const studentsMap = new Map();
    
    for (const course of courses) {
      if (course.enrolledUsers && course.enrolledUsers.length > 0) {
        for (const enrollment of course.enrolledUsers) {
          const userId = enrollment.userId;
          
          if (!userId) continue;
          
          // Fetch user details if not already in map
          if (!studentsMap.has(userId.toString())) {
            const user = await User.findById(userId).select('name email phone profilePic');
            if (user) {
              studentsMap.set(userId.toString(), {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || 'N/A',
                profilePic: user.profilePic || null,
                courses: []
              });
            }
          }
          
          // Calculate remaining days
          const validUntil = new Date(enrollment.validUntil);
          const now = new Date();
          const remainingDays = Math.ceil((validUntil - now) / (1000 * 60 * 60 * 24));
          const isExpired = remainingDays <= 0;
          
          // Add course enrollment to student
          if (studentsMap.has(userId.toString())) {
            const student = studentsMap.get(userId.toString());
            student.courses.push({
              courseId: course._id,
              courseTitle: course.title,
              enrolledAt: enrollment.enrolledAt,
              validUntil: enrollment.validUntil,
              remainingDays: remainingDays > 0 ? remainingDays : 0,
              isExpired: isExpired,
              status: enrollment.status || (isExpired ? 'expired' : 'active')
            });
          }
        }
      }
    }
    
    // Convert map to array and sort by name
    const students = Array.from(studentsMap.values());
    students.sort((a, b) => a.name.localeCompare(b.name));
    
    res.json({ success: true, data: students });
  } catch (error) {
    console.error('getTrainerStudents error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {

  getAllTrainers,
  getTrainerById,
  followTrainer,
  getFollowingTrainers,
  getMyGyms,
  getMyFollowers,
  getTrainerStats,
  getTrainerCourses,
  getTrainerBlogs,
  getAvailableGyms,
  applyToGym,
  leaveGym,
  getMyApplications,
  getMyRequests,
  updateRequestStatus,
  getGymApplications,
  getGymSentRequests,
  updateApplicationStatus,
  cancelSentRequest,
  getApprovedGymIds,
  getTrainerStudents,
};
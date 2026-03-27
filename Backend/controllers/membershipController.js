const Membership = require('../models/Membership');
const Gym = require('../models/Gym');
const User = require('../models/User');

// @desc    Create new membership
// @route   POST /api/memberships
const createMembership = async (req, res) => {
  try {
    const { gymId, plan, paymentAmount } = req.body;
    
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }
    
    // Check if user already has active membership for this gym
    const existingMembership = await Membership.findOne({
      userId: req.user.id,
      gymId,
      status: 'active',
    });
    
    if (existingMembership) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have an active membership for this gym' 
      });
    }
    
    // Calculate end date based on plan
    const startDate = new Date();
    let endDate = new Date();
    let price = 0;
    
    switch(plan) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        price = 49;
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        price = 129;
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        price = 499;
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid plan' });
    }
    
    const membership = await Membership.create({
      userId: req.user.id,
      gymId,
      plan,
      startDate,
      endDate,
      paymentAmount: paymentAmount || price,
      paymentStatus: 'completed',
      status: 'active',
    });
    
    // Generate QR code (membership ID + user ID + gym ID)
    membership.qrCode = `${membership._id}|${req.user.id}|${gymId}`;
    await membership.save();
    
    // Populate gym details
    await membership.populate('gymId', 'name address');
    
    res.status(201).json({ success: true, data: membership });
  } catch (error) {
    console.error('createMembership error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my memberships (user)
// @route   GET /api/memberships/my-memberships
// @desc    Get my memberships (user)
const getMyMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find({ userId: req.user.id })
      .populate('gymId', 'name address contactNumber timings')
      .sort('-createdAt');
    
    // Update expired memberships
    const now = new Date();
    let updated = false;
    
    for (const membership of memberships) {
      if (membership.status === 'active' && new Date(membership.endDate) < now) {
        membership.status = 'expired';
        await membership.save();
        updated = true;
      }
    }
    
    if (updated) {
      // Refetch if any were updated
      const freshMemberships = await Membership.find({ userId: req.user.id })
        .populate('gymId', 'name address contactNumber timings')
        .sort('-createdAt');
      return res.json({ success: true, data: freshMemberships });
    }
    
    res.json({ success: true, data: memberships });
  } catch (error) {
    console.error('getMyMemberships error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get gym memberships (owner only)
// @route   GET /api/memberships/gym/:gymId
const getGymMemberships = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.gymId);
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }
    
    // Check if user is the owner of this gym
    if (gym.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view memberships for this gym' 
      });
    }
    
    const memberships = await Membership.find({ gymId: req.params.gymId })
      .populate('userId', 'name email phone profilePic')
      .sort('-createdAt');
    
    // Add stats
    const activeCount = memberships.filter(m => m.status === 'active').length;
    const expiredCount = memberships.filter(m => m.status === 'expired').length;
    const cancelledCount = memberships.filter(m => m.status === 'cancelled').length;
    const totalRevenue = memberships
      .filter(m => m.status === 'active')
      .reduce((sum, m) => sum + m.paymentAmount, 0);
    
    res.json({ 
      success: true, 
      data: memberships,
      stats: {
        total: memberships.length,
        active: activeCount,
        expired: expiredCount,
        cancelled: cancelledCount,
        revenue: totalRevenue,
      }
    });
  } catch (error) {
    console.error('getGymMemberships error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify QR code
// @route   POST /api/memberships/verify
const verifyQR = async (req, res) => {
  try {
    const { qrCode } = req.body;
    
    if (!qrCode) {
      return res.status(400).json({ success: false, message: 'QR code is required' });
    }
    
    const [membershipId, userId, gymId] = qrCode.split('|');
    
    const membership = await Membership.findById(membershipId)
      .populate('userId', 'name email profilePic')
      .populate('gymId', 'name address');
    
    if (!membership) {
      return res.status(404).json({ success: false, message: 'Invalid membership' });
    }
    
    if (membership.status !== 'active') {
      return res.status(400).json({ 
        success: false, 
        message: `Membership is ${membership.status}` 
      });
    }
    
    if (new Date() > membership.endDate) {
      membership.status = 'expired';
      await membership.save();
      return res.status(400).json({ success: false, message: 'Membership has expired' });
    }
    
    // Record last verification time
    membership.lastVerified = new Date();
    await membership.save();
    
    res.json({ 
      success: true, 
      data: {
        membership,
        valid: true,
        message: 'Access granted',
        remainingDays: Math.ceil((membership.endDate - new Date()) / (1000 * 60 * 60 * 24)),
      }
    });
  } catch (error) {
    console.error('verifyQR error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel membership
// @route   PUT /api/memberships/:id/cancel
const cancelMembership = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    
    if (!membership) {
      return res.status(404).json({ success: false, message: 'Membership not found' });
    }
    
    // User can cancel their own membership, owner can cancel any
    if (membership.userId.toString() !== req.user.id && 
        req.user.role !== 'owner' && 
        req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    if (membership.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Membership is not active' });
    }
    
    membership.status = 'cancelled';
    await membership.save();
    
    res.json({ success: true, message: 'Membership cancelled successfully' });
  } catch (error) {
    console.error('cancelMembership error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get membership by ID
// @route   GET /api/memberships/:id
const getMembershipById = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id)
      .populate('userId', 'name email phone profilePic')
      .populate('gymId', 'name address contactNumber timings');
    
    if (!membership) {
      return res.status(404).json({ success: false, message: 'Membership not found' });
    }
    
    // Check authorization
    if (membership.userId._id.toString() !== req.user.id && 
        req.user.role !== 'owner' && 
        req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    res.json({ success: true, data: membership });
  } catch (error) {
    console.error('getMembershipById error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all memberships (admin only)
// @route   GET /api/memberships
const getAllMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find()
      .populate('userId', 'name email role')
      .populate('gymId', 'name')
      .sort('-createdAt');
    
    res.json({ success: true, data: memberships });
  } catch (error) {
    console.error('getAllMemberships error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createMembership,
  getMyMemberships,
  getGymMemberships,
  verifyQR,
  cancelMembership,
  getMembershipById,
  getAllMemberships,
};
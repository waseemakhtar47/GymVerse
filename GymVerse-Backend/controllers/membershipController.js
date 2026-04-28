const Membership = require('../models/Membership');
const Gym = require('../models/Gym');

const createMembership = async (req, res) => {
  try {
    const { gymId, plan, paymentAmount } = req.body;
    const userId = req.user.id;
    
    // ✅ STRONG CHECK: Any active membership for this gym?
    const existingActive = await Membership.findOne({
      userId: userId,
      gymId: gymId,
      status: 'active'
    });
    
    if (existingActive) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have an active membership for this gym',
        code: 'ACTIVE_EXISTS'
      });
    }
    
    // ✅ Get gym to fetch its pricing
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }
    
    // Calculate plan details - USE GYM'S PRICING or fallback to defaults
    let endDate = new Date();
    let price = 0;
    
    switch(plan) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        price = gym.pricing?.monthly || 49;
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        price = gym.pricing?.quarterly || 129;
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        price = gym.pricing?.yearly || 499;
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid plan' });
    }
    
    const membership = await Membership.create({
      userId: userId,
      gymId: gymId,
      plan: plan,
      startDate: new Date(),
      endDate: endDate,
      paymentAmount: paymentAmount || price,
      paymentStatus: 'completed',
      status: 'active',
    });
    
    membership.qrCode = `${membership._id}|${userId}|${gymId}`;
    await membership.save();
    await membership.populate('gymId', 'name address');
    
    res.status(201).json({ 
      success: true, 
      message: 'Membership purchased successfully!', 
      data: membership 
    });
    
  } catch (error) {
    console.error('createMembership error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have an active membership for this gym'
      });
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyMemberships = async (req, res) => {
  try {
    const now = new Date();
    await Membership.updateMany(
      { userId: req.user.id, status: 'active', endDate: { $lt: now } },
      { status: 'expired' }
    );
    
    const memberships = await Membership.find({ userId: req.user.id })
      .populate('gymId', 'name address contactNumber timings')
      .sort('-createdAt');
    
    res.json({ success: true, data: memberships });
  } catch (error) {
    console.error('getMyMemberships error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getGymMemberships = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.gymId);
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }
    
    if (gym.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const memberships = await Membership.find({ gymId: req.params.gymId })
      .populate('userId', 'name email phone profilePic')
      .sort('-createdAt');
    
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

const verifyQR = async (req, res) => {
  try {
    const { qrCode } = req.body;
    
    if (!qrCode) {
      return res.status(400).json({ success: false, message: 'QR code is required' });
    }
    
    const parts = qrCode.split('|');
    
    if (parts.length !== 3) {
      return res.status(400).json({ success: false, message: 'Invalid QR code format' });
    }
    
    const [membershipId, userId, gymId] = parts;
    
    // ✅ CRITICAL FIX: Check if this gym belongs to the logged-in owner
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }
    
    // ✅ Owner can only verify members of their OWN gym
    if (req.user.role === 'owner' && gym.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only verify members of your own gyms' 
      });
    }
    
    // For admin, allow all (optional)
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only gym owners and admins can verify QR codes' 
      });
    }
    
    const membership = await Membership.findById(membershipId)
      .populate('userId', 'name email profilePic phone')
      .populate('gymId', 'name address');
    
    if (!membership) {
      return res.status(404).json({ success: false, message: 'Invalid membership QR code' });
    }
    
    // ✅ Additional check: Membership's gym must match the gym from QR code
    if (membership.gymId._id.toString() !== gymId) {
      return res.status(400).json({ 
        success: false, 
        message: 'QR code does not match this gym' 
      });
    }
    
    if (membership.status !== 'active') {
      return res.status(400).json({ 
        success: false, 
        message: `Membership is ${membership.status}`,
        reason: membership.status === 'expired' ? 'Your membership has expired' : 'Your membership has been cancelled'
      });
    }
    
    const now = new Date();
    if (now > membership.endDate) {
      membership.status = 'expired';
      await membership.save();
      return res.status(400).json({ 
        success: false, 
        message: 'Membership has expired',
        reason: `Expired on ${new Date(membership.endDate).toLocaleDateString()}`
      });
    }
    
    if (!membership.entryLogs) membership.entryLogs = [];
    membership.entryLogs.push({
      timestamp: now,
      verifiedBy: req.user.id,
      status: 'granted',
    });
    membership.lastVerified = now;
    await membership.save();
    
    const remainingDays = Math.ceil((membership.endDate - now) / (1000 * 60 * 60 * 24));
    
    res.json({ 
      success: true, 
      data: {
        membership: {
          _id: membership._id,
          user: membership.userId,
          gym: membership.gymId,
          plan: membership.plan,
          startDate: membership.startDate,
          endDate: membership.endDate,
          remainingDays,
          entryCount: membership.entryLogs.length,
        },
        message: '✅ Access granted! Welcome to the gym.',
      }
    });
  } catch (error) {
    console.error('verifyQR error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelMembership = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    
    if (!membership) {
      return res.status(404).json({ success: false, message: 'Membership not found' });
    }
    
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

const getMembershipById = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id)
      .populate('userId', 'name email phone profilePic')
      .populate('gymId', 'name address contactNumber timings');
    
    if (!membership) {
      return res.status(404).json({ success: false, message: 'Membership not found' });
    }
    
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

const getAllMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find()
      .populate('userId', 'name email')
      .populate('gymId', 'name')
      .sort('-createdAt');
    
    res.json({ success: true, data: memberships });
  } catch (error) {
    console.error('getAllMemberships error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEntryLogs = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id)
      .populate('entryLogs.verifiedBy', 'name email');
    
    if (!membership) {
      return res.status(404).json({ success: false, message: 'Membership not found' });
    }
    
    res.json({ success: true, data: membership.entryLogs || [] });
  } catch (error) {
    console.error('getEntryLogs error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const checkMembershipStatus = async (req, res) => {
  try {
    const { gymId } = req.params;
    
    const membership = await Membership.findOne({
      userId: req.user.id,
      gymId,
      status: 'active',
    });
    
    res.json({ 
      success: true, 
      data: {
        hasActive: !!membership,
        membership: membership || null,
        endDate: membership?.endDate,
      }
    });
  } catch (error) {
    console.error('checkMembershipStatus error:', error);
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
  getEntryLogs,
  checkMembershipStatus,
};
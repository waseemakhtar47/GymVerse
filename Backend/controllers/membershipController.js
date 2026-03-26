const Membership = require('../models/Membership');
const Gym = require('../models/Gym');

// @desc    Create new membership
// @route   POST /api/memberships
const createMembership = async (req, res) => {
  try {
    const { gymId, plan, paymentAmount } = req.body;
    
    // Calculate end date based on plan
    const startDate = new Date();
    let endDate = new Date();
    if (plan === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
    else if (plan === 'quarterly') endDate.setMonth(endDate.getMonth() + 3);
    else if (plan === 'yearly') endDate.setFullYear(endDate.getFullYear() + 1);
    
    const membership = await Membership.create({
      userId: req.user.id,
      gymId,
      plan,
      startDate,
      endDate,
      paymentAmount,
      paymentStatus: 'completed',
    });
    
    // Generate QR code (simple version - can use qrcode library later)
    const qrData = `${membership._id}|${req.user.id}|${gymId}`;
    membership.qrCode = qrData;
    await membership.save();
    
    res.status(201).json({ success: true, data: membership });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my memberships
// @route   GET /api/memberships/my-memberships
const getMyMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find({ userId: req.user.id })
      .populate('gymId', 'name address')
      .sort('-createdAt');
    res.json({ success: true, data: memberships });
  } catch (error) {
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
    
    if (gym.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const memberships = await Membership.find({ gymId: req.params.gymId })
      .populate('userId', 'name email phone')
      .sort('-createdAt');
    res.json({ success: true, data: memberships });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify QR code
// @route   POST /api/memberships/verify
const verifyQR = async (req, res) => {
  try {
    const { qrCode } = req.body;
    const [membershipId, userId, gymId] = qrCode.split('|');
    
    const membership = await Membership.findById(membershipId)
      .populate('userId', 'name email');
    
    if (!membership) {
      return res.status(404).json({ success: false, message: 'Invalid membership' });
    }
    
    if (membership.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Membership not active' });
    }
    
    if (new Date() > membership.endDate) {
      membership.status = 'expired';
      await membership.save();
      return res.status(400).json({ success: false, message: 'Membership expired' });
    }
    
    res.json({ success: true, data: membership });
  } catch (error) {
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
    
    if (membership.userId.toString() !== req.user.id && req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    membership.status = 'cancelled';
    await membership.save();
    
    res.json({ success: true, message: 'Membership cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createMembership,
  getMyMemberships,
  getGymMemberships,
  verifyQR,
  cancelMembership,
};
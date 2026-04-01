const User = require('../models/User');

// @desc    Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, bio, specialty, experience, businessName, gstNumber, profilePic } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (profilePic) user.profilePic = profilePic;
    if (bio && user.role === 'trainer') user.bio = bio;
    if (specialty && user.role === 'trainer') user.specialty = specialty;
    if (experience && user.role === 'trainer') user.experience = experience;
    if (businessName && user.role === 'owner') user.businessName = businessName;
    if (gstNumber && user.role === 'owner') user.gstNumber = gstNumber;
    
    await user.save();
    
    res.json({ success: true, data: user, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update profile picture
const updateProfilePic = async (req, res) => {
  try {
    const { profilePic } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.profilePic = profilePic;
    await user.save();
    
    res.json({ success: true, data: { profilePic: user.profilePic }, message: 'Profile picture updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  updateProfilePic,
};
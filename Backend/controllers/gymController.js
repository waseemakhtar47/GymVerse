const Gym = require('../models/Gym');

// @desc    Create a new gym
const createGym = async (req, res) => {
  try {
    const gym = await Gym.create({
      ...req.body,
      ownerId: req.user.id,
    });
    res.status(201).json({ success: true, data: gym });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all gyms (public)
const getGyms = async (req, res) => {
  try {
    const gyms = await Gym.find({ isActive: true }).populate('ownerId', 'name email');
    res.json({ success: true, data: gyms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get gym by ID
const getGymById = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id).populate('ownerId', 'name email');
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }
    res.json({ success: true, data: gym });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get nearby gyms
const getNearbyGyms = async (req, res) => {
  try {
    const { lng, lat, maxDistance = 10000 } = req.query;
    
    if (!lng || !lat) {
      return res.status(400).json({ success: false, message: 'Longitude and latitude are required' });
    }
    
    const gyms = await Gym.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
      isActive: true,
    });
    
    res.json({ success: true, data: gyms });
  } catch (error) {
    console.error('getNearbyGyms error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update gym
const updateGym = async (req, res) => {
  try {
    let gym = await Gym.findById(req.params.id);
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }
    
    // Check if user is the owner of this gym
    if (gym.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this gym' });
    }
    
    gym = await Gym.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: gym });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete gym
const deleteGym = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }
    
    // Check if user is the owner of this gym
    if (gym.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this gym' });
    }
    
    await gym.deleteOne();
    res.json({ success: true, message: 'Gym deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createGym,
  getGyms,
  getGymById,
  updateGym,
  deleteGym,
  getNearbyGyms,
};
const Gym = require('../models/Gym');

// @desc    Create a new gym
// @route   POST /api/gyms
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

// @desc    Get all gyms
// @route   GET /api/gyms
const getGyms = async (req, res) => {
  try {
    const gyms = await Gym.find({ isActive: true }).populate('ownerId', 'name email');
    res.json({ success: true, data: gyms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get nearby gyms
// @route   GET /api/gyms/nearby
const getNearbyGyms = async (req, res) => {
  try {
    const { lng, lat, maxDistance = 5000 } = req.query; // maxDistance in meters
    
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
    });
    
    res.json({ success: true, data: gyms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get gym by ID
// @route   GET /api/gyms/:id
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

// @desc    Update gym
// @route   PUT /api/gyms/:id
const updateGym = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }
    
    if (gym.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const updatedGym = await Gym.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updatedGym });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete gym
// @route   DELETE /api/gyms/:id
const deleteGym = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }
    
    if (gym.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    await gym.deleteOne();
    res.json({ success: true, message: 'Gym deleted' });
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
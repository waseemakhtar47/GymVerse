const Gym = require('../models/Gym');
const User = require('../models/User');

// Haversine formula to calculate distance between two points (in meters)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

// @desc    Create a new gym
const createGym = async (req, res) => {
  try {
    const gymData = {
      ...req.body,
      ownerId: req.user.id,
    };
    
    // If no coordinates provided, use default
    if (!gymData.location || !gymData.location.coordinates) {
      gymData.location = {
        type: 'Point',
        coordinates: [77.281845, 28.561123] // Ganjdundwara
      };
    }
    
    const gym = await Gym.create(gymData);
    res.status(201).json({ success: true, data: gym });
  } catch (error) {
    console.error('createGym error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all gyms
const getGyms = async (req, res) => {
  try {
    const gyms = await Gym.find({ isActive: true }).populate('ownerId', 'name email');
    res.json({ success: true, data: gyms });
  } catch (error) {
    console.error('getGyms error:', error);
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
    console.error('getGymById error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get nearby gyms
const getNearbyGyms = async (req, res) => {
  try {
    let { lng, lat, maxDistance = 50000 } = req.query;
    
   
    
    if (!lng || !lat) {

      const allGyms = await Gym.find({ isActive: true });
      return res.json({ success: true, data: allGyms });
    }
    
    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);
    
    
    const allGyms = await Gym.find({ isActive: true });
    
    const nearbyGyms = [];
    
    for (const gym of allGyms) {
      let gymLat = null, gymLng = null;
      
      if (gym.location && gym.location.coordinates && gym.location.coordinates.length === 2) {
        gymLng = gym.location.coordinates[0];
        gymLat = gym.location.coordinates[1];
      } else if (gym.lat && gym.lng) {
        gymLat = gym.lat;
        gymLng = gym.lng;
      }
      
      if (gymLat && gymLng) {
        const distance = calculateDistance(latitude, longitude, gymLat, gymLng);
        
        if (distance <= parseInt(maxDistance)) {
          nearbyGyms.push({
            ...gym.toObject(),
            distance: Math.round(distance / 1000)
          });
        }
      }
    }
    
    nearbyGyms.sort((a, b) => a.distance - b.distance);
    
    
    res.json({ success: true, data: nearbyGyms });
    
  } catch (error) {
    console.error('getNearbyGyms error:', error);
    const allGyms = await Gym.find({ isActive: true });
    res.json({ success: true, data: allGyms });
  }
};

// @desc    Update gym
const updateGym = async (req, res) => {
  try {
    let gym = await Gym.findById(req.params.id);
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }
    
    if (gym.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    gym = await Gym.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: gym });
  } catch (error) {
    console.error('updateGym error:', error);
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
    
    if (gym.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    await gym.deleteOne();
    res.json({ success: true, message: 'Gym deleted' });
  } catch (error) {
    console.error('deleteGym error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ NEW: Get gym applications (owner)
const getGymApplications = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id).populate('trainers.trainerId', 'name email profilePic phone');
    if (!gym) return res.status(404).json({ success: false, message: 'Gym not found' });
    if (gym.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const pendingApplications = gym.trainers.filter(t => t.status === 'pending');
    res.json({ success: true, data: pendingApplications });
  } catch (error) {
    console.error('getGymApplications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ NEW: Get gym trainers (approved)
const getGymTrainers = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id).populate('trainers.trainerId', 'name email profilePic phone');
    if (!gym) return res.status(404).json({ success: false, message: 'Gym not found' });
    const approvedTrainers = gym.trainers.filter(t => t.status === 'approved');
    res.json({ success: true, data: approvedTrainers });
  } catch (error) {
    console.error('getGymTrainers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ NEW: Approve trainer
const approveTrainer = async (req, res) => {
  try {
    const { id, trainerId } = req.params;
    const gym = await Gym.findById(id);
    if (!gym) return res.status(404).json({ success: false, message: 'Gym not found' });
    if (gym.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const trainerIndex = gym.trainers.findIndex(t => t.trainerId.toString() === trainerId);
    if (trainerIndex === -1) return res.status(404).json({ success: false, message: 'Application not found' });
    
    gym.trainers[trainerIndex].status = 'approved';
    gym.trainers[trainerIndex].joinedAt = new Date();
    await gym.save();
    
    const trainer = await User.findById(trainerId);
    const appIndex = trainer.appliedGyms.findIndex(a => a.gymId.toString() === id);
    if (appIndex !== -1) trainer.appliedGyms[appIndex].status = 'approved';
    trainer.associatedGym = id;
    await trainer.save();
    
    res.json({ success: true, message: 'Trainer approved successfully' });
  } catch (error) {
    console.error('approveTrainer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ NEW: Reject trainer
const rejectTrainer = async (req, res) => {
  try {
    const { id, trainerId } = req.params;
    const gym = await Gym.findById(id);
    if (!gym) return res.status(404).json({ success: false, message: 'Gym not found' });
    if (gym.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    gym.trainers = gym.trainers.filter(t => t.trainerId.toString() !== trainerId);
    await gym.save();
    
    const trainer = await User.findById(trainerId);
    const appIndex = trainer.appliedGyms.findIndex(a => a.gymId.toString() === id);
    if (appIndex !== -1) trainer.appliedGyms[appIndex].status = 'rejected';
    await trainer.save();
    
    res.json({ success: true, message: 'Application rejected' });
  } catch (error) {
    console.error('rejectTrainer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ NEW: Remove trainer from gym
const removeTrainer = async (req, res) => {
  try {
    const { id, trainerId } = req.params;
    const gym = await Gym.findById(id);
    if (!gym) return res.status(404).json({ success: false, message: 'Gym not found' });
    if (gym.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    gym.trainers = gym.trainers.filter(t => t.trainerId.toString() !== trainerId);
    await gym.save();
    
    const trainer = await User.findById(trainerId);
    trainer.associatedGym = null;
    await trainer.save();
    
    res.json({ success: true, message: 'Trainer removed from gym' });
  } catch (error) {
    console.error('removeTrainer error:', error);
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
   getGymApplications,
  getGymTrainers,
  approveTrainer,
  rejectTrainer,
  removeTrainer,
};
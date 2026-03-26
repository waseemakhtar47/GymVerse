import api from '../utils/api';

export const gymService = {
  // Get all gyms
  getAllGyms: () => api.get('/gyms'),
  
  // Get gym by ID
  getGymById: (id) => api.get(`/gyms/${id}`),
  
  // Create gym (owner only)
  createGym: (data) => api.post('/gyms', data),
  
  // Update gym
  updateGym: (id, data) => api.put(`/gyms/${id}`, data),
  
  // Delete gym
  deleteGym: (id) => api.delete(`/gyms/${id}`),
  
  // Get nearby gyms
  getNearbyGyms: (lng, lat, maxDistance = 5000) => 
    api.get(`/gyms/nearby?lng=${lng}&lat=${lat}&maxDistance=${maxDistance}`),
};
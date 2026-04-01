import api from '../utils/api';

export const gymService = {
  getAllGyms: () => api.get('/gyms'),
  getGymById: (id) => api.get(`/gyms/${id}`),
  createGym: (data) => api.post('/gyms', data),
  updateGym: (id, data) => api.put(`/gyms/${id}`, data),
  deleteGym: (id) => api.delete(`/gyms/${id}`),
  getNearbyGyms: (lng, lat, maxDistance = 5000) => api.get(`/gyms/nearby?lng=${lng}&lat=${lat}&maxDistance=${maxDistance}`),
  
  // ✅ NEW: Owner trainer management functions
  getGymApplications: (gymId) => api.get(`/gyms/${gymId}/applications`),
  getGymTrainers: (gymId) => api.get(`/gyms/${gymId}/trainers`),
  approveTrainer: (gymId, trainerId) => api.put(`/gyms/${gymId}/trainers/${trainerId}/approve`),
  rejectTrainer: (gymId, trainerId) => api.put(`/gyms/${gymId}/trainers/${trainerId}/reject`),
  removeTrainer: (gymId, trainerId) => api.delete(`/gyms/${gymId}/trainers/${trainerId}`),
};
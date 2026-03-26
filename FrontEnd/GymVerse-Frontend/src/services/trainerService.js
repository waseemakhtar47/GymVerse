import api from '../utils/api';

export const trainerService = {
  // Get all trainers
  getAllTrainers: () => api.get('/trainers'),
  
  // Get trainer by ID
  getTrainerById: (id) => api.get(`/trainers/${id}`),
  
  // Follow/unfollow trainer
  followTrainer: (id) => api.post(`/trainers/${id}/follow`),
  
  // Get following trainers (user)
  getFollowingTrainers: () => api.get('/trainers/following'),
  
  // Get followers (trainer)
  getMyFollowers: () => api.get('/trainers/my/followers'),
  
  // Get trainer stats
  getTrainerStats: () => api.get('/trainers/my/stats'),
};
import api from '../utils/api';

export const trainerService = {
  getAllTrainers: () => api.get('/trainers'),
  getTrainerById: (id) => api.get(`/trainers/${id}`),
  followTrainer: (id) => api.post(`/trainers/${id}/follow`),
  getFollowingTrainers: () => api.get('/trainers/following'),
  getMyFollowers: () => api.get('/trainers/my/followers'),
  getTrainerStats: () => api.get('/trainers/my/stats'),
  getTrainerCourses: (id) => api.get(`/trainers/${id}/courses`),
  getTrainerBlogs: (id) => api.get(`/trainers/${id}/blogs`),
  
  // ✅ NEW: Trainer job application functions
  getAvailableGyms: () => api.get('/trainers/available-gyms'),
  getMyApplications: () => api.get('/trainers/my-applications'),
  applyToGym: (gymId) => api.post(`/trainers/apply/${gymId}`),
};
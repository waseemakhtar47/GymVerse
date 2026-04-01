import api from '../utils/api';

export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
  updateProfilePic: (profilePic) => api.put('/users/profile-pic', { profilePic }),
};
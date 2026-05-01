import api from '../utils/api';

export const membershipService = {
  createMembership: (data) => api.post('/memberships', data),
  getMyMemberships: () => api.get('/memberships/my-memberships'),
  getGymMemberships: (gymId) => api.get(`/memberships/gym/${gymId}`),
  verifyQR: (qrCode) => api.post('/memberships/verify', { qrCode }),
  cancelMembership: (id) => api.put(`/memberships/${id}/cancel`),
  checkMembershipStatus: (gymId) => api.get(`/memberships/check/${gymId}`),
  getMembershipById: (id) => api.get(`/memberships/${id}`),
  getEntryLogs: (id) => api.get(`/memberships/${id}/logs`),
  deleteMembership: (id) => api.delete(`/memberships/${id}`),
};
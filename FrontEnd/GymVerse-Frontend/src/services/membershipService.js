import api from '../utils/api';

export const membershipService = {
  // Create membership
  createMembership: (data) => api.post('/memberships', data),
  
  // Get my memberships
  getMyMemberships: () => api.get('/memberships/my-memberships'),
  
  // Get gym memberships (owner only)
  getGymMemberships: (gymId) => api.get(`/memberships/gym/${gymId}`),
  
  // Verify QR code
  verifyQR: (qrCode) => api.post('/memberships/verify', { qrCode }),
  
  // Cancel membership
  cancelMembership: (id) => api.put(`/memberships/${id}/cancel`),
};
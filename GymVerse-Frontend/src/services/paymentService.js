import api from '../utils/api';

export const paymentService = {
  createMembershipOrder: (gymId, plan) => 
    api.post('/payments/create-order/membership', { gymId, plan }),
  
  createCourseOrder: (courseId) => 
    api.post('/payments/create-order/course', { courseId }),
  
  verifyPayment: (data) => 
    api.post('/payments/verify', data),
  
  getPaymentHistory: () => 
    api.get('/payments/history'),
};
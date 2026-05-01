import api from '../utils/api';

export const courseService = {
  getAllCourses: (params = {}) => api.get('/courses', { params }),
  getCourseById: (id) => api.get(`/courses/${id}`),
  createCourse: (data) => api.post('/courses', data),
  updateCourse: (id, data) => api.put(`/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  enrollCourse: (id) => api.post(`/courses/${id}/enroll`),
  getMyEnrolledCourses: () => api.get('/courses/my/enrolled'),
  getMyCourses: () => api.get('/courses/my/courses'),
  checkCourseAccess: (courseId) => api.get(`/courses/${courseId}/access`),
  getCourseRatings: (courseId) => api.get(`/courses/${courseId}/ratings`),
  addCourseRating: (courseId, rating, review) => api.post(`/courses/${courseId}/ratings`, { rating, review }),
  deleteCourseRating: (courseId) => api.delete(`/courses/${courseId}/ratings`),
  cancelEnrollment: (courseId) => api.delete(`/courses/${courseId}/cancel-enrollment`),
  checkExpiredEnrollments: () => api.get('/courses/check-expired'),
  cleanCancelledEnrollments: () => api.delete('/courses/clean-cancelled'),
};
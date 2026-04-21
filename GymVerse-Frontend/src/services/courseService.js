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
};
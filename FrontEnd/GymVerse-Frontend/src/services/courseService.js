import api from '../utils/api';

export const courseService = {
  // Get all courses
  getAllCourses: (params = {}) => api.get('/courses', { params }),
  
  // Get course by ID
  getCourseById: (id) => api.get(`/courses/${id}`),
  
  // Create course (trainer only)
  createCourse: (data) => api.post('/courses', data),
  
  // Update course
  updateCourse: (id, data) => api.put(`/courses/${id}`, data),
  
  // Delete course
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  
  // Enroll in course (user only)
  enrollCourse: (id) => api.post(`/courses/${id}/enroll`),
  
  // Get my enrolled courses (user)
  getMyEnrolledCourses: () => api.get('/courses/my/enrolled'),
  
  // Get my courses (trainer)
  getMyCourses: () => api.get('/courses/my/courses'),
};
import api from "../utils/api";

export const trainerService = {
  getAllTrainers: () => api.get("/trainers"),
  getTrainerById: (id) => api.get(`/trainers/${id}`),
  getTrainerCourses: (id) => api.get(`/trainers/${id}/courses`),
  getTrainerBlogs: (id) => api.get(`/trainers/${id}/blogs`),
  followTrainer: (id) => api.post(`/trainers/${id}/follow`),
  getFollowingTrainers: () => api.get("/trainers/following"),
  getMyFollowers: () => api.get("/trainers/my/followers"),
  getTrainerStats: () => api.get("/trainers/my/stats"),
  getAvailableGyms: () => api.get("/trainers/available-gyms"),
  getMyApplications: () => api.get("/trainers/my-applications"),
  getMyRequests: () => api.get("/trainers/my-requests"),
  getMyGyms: () => api.get("/trainers/my-gyms"),
  leaveGym: (gymId) => api.delete(`/trainers/leave-gym/${gymId}`),
  getApprovedGymIds: () => api.get('/trainers/approved-gym-ids'),
  updateRequestStatus: (requestId, status) =>
    api.put(`/trainers/requests/${requestId}`, { status }),
  applyToGym: (gymId, trainerId) => {
    const data = trainerId ? { trainerId } : {};
    return api.post(`/trainers/apply/${gymId}`, data);
  },
  getMyStudents: () => api.get('/trainers/my-students'),
};

import api from '../utils/api';

export const uploadService = {
  uploadVideo: (formData) => api.post('/upload/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadThumbnail: (formData) => api.post('/upload/thumbnail', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
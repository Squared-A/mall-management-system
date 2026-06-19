import axiosClient from './axiosClient';

export const maintenanceApi = {
  getAll: (params) => axiosClient.get('/maintenance', { params }),
  getById: (id) => axiosClient.get(`/maintenance/${id}`),
  create: (payload) => axiosClient.post('/maintenance', payload),
  update: (id, payload) => axiosClient.put(`/maintenance/${id}`, payload),
  remove: (id) => axiosClient.delete(`/maintenance/${id}`),
  addComment: (id, payload) => axiosClient.post(`/maintenance/${id}/comments`, payload),
  updateStatus: (id, status) => axiosClient.put(`/maintenance/${id}/status`, { status }),
};

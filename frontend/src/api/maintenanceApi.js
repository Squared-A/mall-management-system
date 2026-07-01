import axiosClient from './axiosClient';

export const maintenanceApi = {
  getAll: (params) => axiosClient.get('/maintenances', { params }),
  getById: (id) => axiosClient.get(`/maintenances/${id}`),
  create: (payload) => axiosClient.post('/maintenances/add', payload),
  update: (id, payload) => axiosClient.put(`/maintenances/${id}`, payload),
  remove: (id) => axiosClient.delete(`/maintenances/${id}`),
  addComment: (id, payload) => axiosClient.post(`/maintenances/${id}/comments`, payload),
  updateStatus: (id, status) => axiosClient.put(`/maintenances/${id}/status`, { status }),
};

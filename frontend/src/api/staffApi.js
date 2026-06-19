import axiosClient from './axiosClient';

export const staffApi = {
  getAll: (params) => axiosClient.get('/staff', { params }),
  getById: (id) => axiosClient.get(`/staff/${id}`),
  create: (payload) => axiosClient.post('/staff', payload),
  update: (id, payload) => axiosClient.put(`/staff/${id}`, payload),
  remove: (id) => axiosClient.delete(`/staff/${id}`),
};

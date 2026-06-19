import axiosClient from './axiosClient';

export const shopApi = {
  getAll: (params) => axiosClient.get('/shops', { params }),
  getById: (id) => axiosClient.get(`/shops/${id}`),
  create: (payload) => axiosClient.post('/shops', payload),
  update: (id, payload) => axiosClient.put(`/shops/${id}`, payload),
  remove: (id) => axiosClient.delete(`/shops/${id}`),
};

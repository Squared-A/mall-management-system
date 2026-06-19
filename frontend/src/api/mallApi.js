import axiosClient from './axiosClient';

export const mallApi = {
  getAll: (params) => axiosClient.get('/malls', { params }),
  getById: (id) => axiosClient.get(`/malls/${id}`),
  create: (payload) => axiosClient.post('/malls', payload),
  update: (id, payload) => axiosClient.put(`/malls/${id}`, payload),
  remove: (id) => axiosClient.delete(`/malls/${id}`),
  getStats: (id) => axiosClient.get(`/malls/${id}/stats`),
};

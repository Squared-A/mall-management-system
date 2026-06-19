import axiosClient from './axiosClient';

export const staffApi = {
  getAll: (params) => axiosClient.get('/staffs', { params }),
  getById: (id) => axiosClient.get(`/staffs/${id}`),
  create: (payload) => axiosClient.post('/staffs/add', payload),
  update: (id, payload) => axiosClient.put(`/staffs/${id}`, payload),
  remove: (id) => axiosClient.delete(`/staffs/${id}`),
};

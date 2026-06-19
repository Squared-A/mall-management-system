import axiosClient from './axiosClient';

export const leaseApi = {
  getAll: (params) => axiosClient.get('/leases', { params }),
  getById: (id) => axiosClient.get(`/leases/${id}`),
  create: (payload) => axiosClient.post('/leases', payload),
  update: (id, payload) => axiosClient.put(`/leases/${id}`, payload),
  remove: (id) => axiosClient.delete(`/leases/${id}`),
  terminate: (id, payload) => axiosClient.put(`/leases/${id}/terminate`, payload),
};

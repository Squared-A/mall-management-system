import axiosClient from './axiosClient';

export const tenantApi = {
  getAll: (params) => axiosClient.get('/tenants', { params }),
  getById: (id) => axiosClient.get(`/tenants/${id}`),
  create: (payload) => axiosClient.post('/tenants/register', payload),
  update: (id, payload) => axiosClient.put(`/tenants/${id}`, payload),
  remove: (id) => axiosClient.delete(`/tenants/${id}`),
};

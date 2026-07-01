import axiosClient from './axiosClient';

export const leaseApi = {
  getAll: (params) => axiosClient.get('/leases', { params }),
  getById: (id) => axiosClient.get(`/leases/${id}`),
  create: (payload) => axiosClient.post('/leases/add', payload),
  update: (id, payload) => axiosClient.put(`/leases/${id}`, payload),
  remove: (id) => axiosClient.delete(`/leases/${id}`),
  // Previously used PUT /leases/:id/terminate, but the backend exposes
  // these lifecycle transitions as POST endpoints (they're actions, not
  // idempotent field updates) — this was a guaranteed 404/405 on every
  // termination attempt.
  terminate: (id) => axiosClient.post(`/leases/${id}/terminate`),
  expire: (id) => axiosClient.post(`/leases/${id}/expire`),
  renew: (id, payload) => axiosClient.post(`/leases/${id}/renew`, payload),
};

import axiosClient from './axiosClient';

export const paymentApi = {
  getAll: (params) => axiosClient.get('/payments', { params }),
  getById: (id) => axiosClient.get(`/payments/${id}`),
  create: (payload) => axiosClient.post('/payments', payload),
  update: (id, payload) => axiosClient.put(`/payments/${id}`, payload),
  remove: (id) => axiosClient.delete(`/payments/${id}`),
  getHistory: (params) => axiosClient.get('/payments/history', { params }),
  getInvoice: (id) => axiosClient.get(`/payments/invoices/${id}`),
  downloadInvoice: (id) =>
    axiosClient.get(`/payments/invoices/${id}/download`, { responseType: 'blob' }),
};

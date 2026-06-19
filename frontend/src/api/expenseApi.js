import axiosClient from './axiosClient';

// This file did not exist before. The backend has a full expenses module
// (create/list/update/delete), and the Reports section already has a
// read-only "Expense Report" page, but there was no way for an owner,
// manager, or accountant to actually RECORD an expense anywhere in the
// frontend — the data the report depends on could never be entered.
export const expenseApi = {
  getAll: (params) => axiosClient.get('/expenses', { params }),
  getById: (id) => axiosClient.get(`/expenses/${id}`),
  create: (payload) => axiosClient.post('/expenses/add', payload),
  update: (id, payload) => axiosClient.put(`/expenses/${id}`, payload),
  remove: (id) => axiosClient.delete(`/expenses/${id}`),
};

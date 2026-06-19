import axiosClient from './axiosClient';

export const reportApi = {
  getRevenueReport: (params) => axiosClient.get('/reports/revenue', { params }),
  getOccupancyReport: (params) => axiosClient.get('/reports/occupancy', { params }),
  getExpenseReport: (params) => axiosClient.get('/reports/expense', { params }),
  exportReport: (type, params) =>
    axiosClient.get(`/reports/${type}/export`, { params, responseType: 'blob' }),
};

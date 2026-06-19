import axiosClient from './axiosClient';

export const announcementApi = {
  getAll: (params) => axiosClient.get('/announcements', { params }),
  getById: (id) => axiosClient.get(`/announcements/${id}`),
  create: (payload) => axiosClient.post('/announcements', payload),
  update: (id, payload) => axiosClient.put(`/announcements/${id}`, payload),
  remove: (id) => axiosClient.delete(`/announcements/${id}`),
};

export const dashboardApi = {
  getStats: (params) => axiosClient.get('/dashboard/stats', { params }),
  getRevenueSummary: (params) => axiosClient.get('/dashboard/revenue-summary', { params }),
  getOccupancySummary: (params) => axiosClient.get('/dashboard/occupancy-summary', { params }),
  getRecentActivities: (params) => axiosClient.get('/dashboard/activities', { params }),
};

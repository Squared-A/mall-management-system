import { staffApi } from '../api/staffApi';
import { reportApi } from '../api/reportApi';
import { announcementApi, dashboardApi } from '../api/announcementApi';

export const staffService = {
  async list(params) {
    const { data } = await staffApi.getAll(params);
    return data.data || data;
  },
  async getById(id) {
    const { data } = await staffApi.getById(id);
    return data.data || data;
  },
  async create(payload) {
    const { data } = await staffApi.create(payload);
    return data.data || data;
  },
  async update(id, payload) {
    const { data } = await staffApi.update(id, payload);
    return data.data || data;
  },
  async remove(id) {
    const { data } = await staffApi.remove(id);
    return data;
  },
};

export const reportService = {
  async revenue(params) {
    const { data } = await reportApi.getRevenueReport(params);
    return data.data || data;
  },
  async occupancy(params) {
    const { data } = await reportApi.getOccupancyReport(params);
    return data.data || data;
  },
  async expense(params) {
    const { data } = await reportApi.getExpenseReport(params);
    return data.data || data;
  },
};

export const announcementService = {
  async list(params) {
    const { data } = await announcementApi.getAll(params);
    return data.data || data;
  },
  async getById(id) {
    const { data } = await announcementApi.getById(id);
    return data.data || data;
  },
  async create(payload) {
    const { data } = await announcementApi.create(payload);
    return data.data || data;
  },
  async update(id, payload) {
    const { data } = await announcementApi.update(id, payload);
    return data.data || data;
  },
  async remove(id) {
    const { data } = await announcementApi.remove(id);
    return data;
  },
};

export const dashboardService = {
  async stats(params) {
    const { data } = await dashboardApi.getStats(params);
    return data.data || data;
  },
  async revenueSummary(params) {
    const { data } = await dashboardApi.getRevenueSummary(params);
    return data.data || data;
  },
  async occupancySummary(params) {
    const { data } = await dashboardApi.getOccupancySummary(params);
    return data.data || data;
  },
  async recentActivities(params) {
    const { data } = await dashboardApi.getRecentActivities(params);
    return data.data || data;
  },
};

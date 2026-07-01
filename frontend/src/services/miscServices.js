import { staffApi } from "../api/staffApi";
import { reportApi } from "../api/reportApi";
import { announcementApi } from "../api/announcementApi";
import { dashboardApi } from "../api/dashboardApi";
import { expenseApi } from "../api/expenseApi";

export const staffService = {
  async list(params) {
    const { data } = await staffApi.getAll(params);
    return data.result || data.data || [];
  },
  async getById(id) {
    const { data } = await staffApi.getById(id);
    return data.result || data.data || {};
  },
  async create(payload) {
    console.log(payload);
    const { data } = await staffApi.create(payload);
    console.log(data);
    return data.result || data.data || {};
  },
  async update(id, payload) {
    const { data } = await staffApi.update(id, payload);
    return data.result || data.data || {};
  },
  async remove(id) {
    const { data } = await staffApi.remove(id);
    return data;
  },
};

export const reportService = {
  async platform() {
    const { data } = await reportApi.getPlatformReport();
    return data.result || data.data || {};
  },
  async revenue(params) {
    const { data } = await reportApi.getRevenueReport(params);
    return data.result || data.data || [];
  },
  async occupancy(params) {
    const { data } = await reportApi.getOccupancyReport(params);
    return data.result || data.data || [];
  },
  async expense(params) {
    const { data } = await reportApi.getExpenseReport(params);
    return data.result || data.data || [];
  },
};

export const announcementService = {
  async list(params) {
    const { data } = await announcementApi.getAll(params);
    return data.result || data.data || [];
  },
  async getById(id) {
    const { data } = await announcementApi.getById(id);
    return data.result || data.data || {};
  },
  async create(payload) {
    const { data } = await announcementApi.create(payload);
    return data.result || data.data || {};
  },
  async update(id, payload) {
    const { data } = await announcementApi.update(id, payload);
    return data.result || data.data || {};
  },
  async remove(id) {
    const { data } = await announcementApi.remove(id);
    return data;
  },
};

export const dashboardService = {
  async stats() {
    const { data } = await dashboardApi.getStats();
    return data.result || data.data || {};
  },
  async revenueSummary(params) {
    const { data } = await dashboardApi.getRevenueSummary(params);
    return data.result || data.data || {};
  },
  async occupancySummary(params) {
    const { data } = await dashboardApi.getOccupancySummary(params);
    return data.result || data.data || {};
  },
  async recentActivities() {
    const { data } = await dashboardApi.getRecentActivities();
    return data.result || data.data || [];
  },
};

export const expenseService = {
  async list(params) {
    const { data } = await expenseApi.getAll(params);
    return data.data || [];
  },
  async getById(id) {
    const { data } = await expenseApi.getById(id);
    return data.data || {};
  },
  async create(payload) {
    const { data } = await expenseApi.create(payload);
    return data.data || {};
  },
  async update(id, payload) {
    const { data } = await expenseApi.update(id, payload);
    return data.data || {};
  },
  async remove(id) {
    const { data } = await expenseApi.remove(id);
    return data;
  },
};

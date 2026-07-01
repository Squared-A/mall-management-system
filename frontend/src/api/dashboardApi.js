import axiosClient from "./axiosClient";

export const dashboardApi = {
  getStats: () => axiosClient.get("/reports/dashboard/stats"),
  getRevenue: () => axiosClient.get("/reports/revenue"),
  getRevenueSummary: (params) => axiosClient.get("/reports/revenue", { params }),
  getOccupancySummary: (params) =>
    axiosClient.get("/reports/occupancy", { params }),
  getRecentActivities: () => axiosClient.get("/reports/activities"),
};

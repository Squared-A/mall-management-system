import axiosClient from "./axiosClient";

export const announcementApi = {
  getAll: (params) => axiosClient.get("/announcements", { params }),
  getById: (id) => axiosClient.get(`/announcements/${id}`),
  create: (payload) => axiosClient.post("/announcements/add", payload),
  update: (id, payload) => axiosClient.put(`/announcements/${id}`, payload),
  remove: (id) => axiosClient.delete(`/announcements/${id}`),
};

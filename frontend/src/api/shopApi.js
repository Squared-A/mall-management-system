import axiosClient from "./axiosClient";

export const shopApi = {
  getAll: () => axiosClient.get("/shops"),
  getById: (id) => axiosClient.get(`/shops/${id}`),
  create: (payload) => axiosClient.post("/shops/register", payload),
  update: (id, payload) => axiosClient.put(`/shops/${id}`, payload),
  remove: (id) => axiosClient.delete(`/shops/${id}`),
};

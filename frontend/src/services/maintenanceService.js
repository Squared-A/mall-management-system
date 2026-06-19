import { maintenanceApi } from '../api/maintenanceApi';

export const maintenanceService = {
  async list(params) {
    const { data } = await maintenanceApi.getAll(params);
    return data.data || data;
  },
  async getById(id) {
    const { data } = await maintenanceApi.getById(id);
    return data.data || data;
  },
  async create(payload) {
    const { data } = await maintenanceApi.create(payload);
    return data.data || data;
  },
  async update(id, payload) {
    const { data } = await maintenanceApi.update(id, payload);
    return data.data || data;
  },
  async remove(id) {
    const { data } = await maintenanceApi.remove(id);
    return data;
  },
  async addComment(id, payload) {
    const { data } = await maintenanceApi.addComment(id, payload);
    return data.data || data;
  },
  async updateStatus(id, status) {
    const { data } = await maintenanceApi.updateStatus(id, status);
    return data.data || data;
  },
};

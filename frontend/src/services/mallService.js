import { mallApi } from '../api/mallApi';

export const mallService = {
  async list(params) {
    const { data } = await mallApi.getAll(params);
    return data.result || data.data || [];
  },
  async getById(id) {
    const { data } = await mallApi.getById(id);
    return data.result || data.data || {};
  },
  async create(payload) {
    const { data } = await mallApi.create(payload);
    return data.result || data.data || {};
  },
  async update(id, payload) {
    const { data } = await mallApi.update(id, payload);
    return data.result || data.data || {};
  },
  async remove(id) {
    const { data } = await mallApi.remove(id);
    return data;
  },
  async getStats(id) {
    const { data } = await mallApi.getStats(id);
    return data.result || data.data || {};
  },
};

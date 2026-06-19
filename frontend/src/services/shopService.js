import { shopApi } from "../api/shopApi";

export const shopService = {
  async list() {
    const { data } = await shopApi.getAll();
    return data.result || data.data || [];
  },
  async getById(id) {
    const { data } = await shopApi.getById(id);
    return data.result || data.data || {};
  },
  async create(payload) {
    const { data } = await shopApi.create(payload);
    return data.result || data.data || {};
  },
  async update(id, payload) {
    const { data } = await shopApi.update(id, payload);
    return data.result || data.data || {};
  },
  async remove(id) {
    const { data } = await shopApi.remove(id);
    return data;
  },
};


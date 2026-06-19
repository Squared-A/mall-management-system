import { tenantApi } from '../api/tenantApi';

export const tenantService = {
  async list(params) {
    const { data } = await tenantApi.getAll(params);
    return data.result || data.data || [];
  },
  async getById(id) {
    const { data } = await tenantApi.getById(id);
    return data.result || data.data || {};
  },
  async create(payload) {
    const { data } = await tenantApi.create(payload);
    return data.result || data.data || {};
  },
  async update(id, payload) {
    const { data } = await tenantApi.update(id, payload);
    return data.result || data.data || {};
  },
  async remove(id) {
    const { data } = await tenantApi.remove(id);
    return data;
  },
};

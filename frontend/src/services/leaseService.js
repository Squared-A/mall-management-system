import { leaseApi } from '../api/leaseApi';

export const leaseService = {
  async list(params) {
    const { data } = await leaseApi.getAll(params);
    return data.result || data.data || [];
  },
  async getById(id) {
    const { data } = await leaseApi.getById(id);
    return data.result || data.data || {};
  },
  async create(payload) {
    const { data } = await leaseApi.create(payload);
    return data.result || data.data || {};
  },
  async update(id, payload) {
    const { data } = await leaseApi.update(id, payload);
    return data.result || data.data || {};
  },
  async remove(id) {
    const { data } = await leaseApi.remove(id);
    return data;
  },
  async terminate(id) {
    const { data } = await leaseApi.terminate(id);
    return data.data || data;
  },
  async expire(id) {
    const { data } = await leaseApi.expire(id);
    return data.data || data;
  },
  async renew(id, payload) {
    const { data } = await leaseApi.renew(id, payload);
    return data.data || data;
  },
};

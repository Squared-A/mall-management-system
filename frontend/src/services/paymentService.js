import { paymentApi } from '../api/paymentApi';

export const paymentService = {
  async list(params) {
    const { data } = await paymentApi.getAll(params);
    return data.data || data;
  },
  async getById(id) {
    const { data } = await paymentApi.getById(id);
    return data.data || data;
  },
  async create(payload) {
    const { data } = await paymentApi.create(payload);
    return data.data || data;
  },
  async update(id, payload) {
    const { data } = await paymentApi.update(id, payload);
    return data.data || data;
  },
  async remove(id) {
    const { data } = await paymentApi.remove(id);
    return data;
  },
  async history(params) {
    const { data } = await paymentApi.getHistory(params);
    return data.data || data;
  },
  async getInvoice(id) {
    const { data } = await paymentApi.getInvoice(id);
    return data.data || data;
  },
};

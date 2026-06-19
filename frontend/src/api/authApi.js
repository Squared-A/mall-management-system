import axiosClient from './axiosClient';

export const authApi = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),

  registerMall: (payload) => axiosClient.post('/auth/register-mall', payload),

  forgotPassword: (email) => axiosClient.post('/auth/forgot-password', { email }),

  resetPassword: (payload) => axiosClient.post('/auth/reset-password', payload),

  refreshToken: (refreshToken) => axiosClient.post('/auth/refresh', { refreshToken }),

  logout: () => axiosClient.post('/auth/logout'),

  getProfile: () => axiosClient.get('/auth/me'),

  updateProfile: (payload) => axiosClient.put('/auth/me', payload),

  changePassword: (payload) => axiosClient.put('/auth/change-password', payload),
};

import { authApi } from '../api/authApi';
import { storage } from '../utils/storage';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '../constants';

export const authService = {
  async login(credentials) {
    const { data } = await authApi.login(credentials);
    const { user, accessToken, refreshToken } = data.data || data;
    storage.set(TOKEN_KEY, accessToken);
    storage.set(REFRESH_TOKEN_KEY, refreshToken);
    storage.set(USER_KEY, user);
    return user;
  },

  async registerMall(payload) {
    const { data } = await authApi.registerMall(payload);
    const { user, accessToken, refreshToken } = data.data || data;
    if (accessToken) storage.set(TOKEN_KEY, accessToken);
    if (refreshToken) storage.set(REFRESH_TOKEN_KEY, refreshToken);
    if (user) storage.set(USER_KEY, user);
    return data.data || data;
  },

  async forgotPassword(email) {
    const { data } = await authApi.forgotPassword(email);
    return data;
  },

  async resetPassword(payload) {
    const { data } = await authApi.resetPassword(payload);
    return data;
  },

  logout() {
    storage.remove(TOKEN_KEY);
    storage.remove(REFRESH_TOKEN_KEY);
    storage.remove(USER_KEY);
  },

  getCurrentUser() {
    return storage.get(USER_KEY);
  },

  isAuthenticated() {
    return Boolean(storage.get(TOKEN_KEY));
  },

  getToken() {
    return storage.get(TOKEN_KEY);
  },
};

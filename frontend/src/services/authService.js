import { authApi } from "../api/authApi";
import { storage } from "../utils/storage";
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "../constants";

const normalizeRole = (role) => {
  if (!role) return role;
  return typeof role === "string" ? role.toLowerCase() : role;
};

const normalizeUser = (user) => {
  if (!user) return user;
  return {
    ...user,
    role: normalizeRole(user.role),
  };
};

export const authService = {
  async login(credentials) {
    console.log(credentials);
    const { data } = await authApi.login(credentials);
    console.log(data);
    const { user, accessToken, refreshToken } = data.data || data;
    const normalizedUser = normalizeUser(user);
    storage.set(TOKEN_KEY, accessToken);
    storage.set(REFRESH_TOKEN_KEY, refreshToken);
    storage.set(USER_KEY, normalizedUser);
    return normalizedUser;
  },

  async registerMall(payload) {
    const { data } = await authApi.registerMall(payload);
    const { user, accessToken, refreshToken } = data.data || data;
    const normalizedUser = normalizeUser(user);
    if (accessToken) storage.set(TOKEN_KEY, accessToken);
    if (refreshToken) storage.set(REFRESH_TOKEN_KEY, refreshToken);
    if (normalizedUser) storage.set(USER_KEY, normalizedUser);
    return { ...data.data, user: normalizedUser } || data;
  },

  async getProfile() {
    const { data } = await authApi.getProfile();
    const normalizedUser = normalizeUser(data.data || data.user || data);
    if (normalizedUser) storage.set(USER_KEY, normalizedUser);
    return normalizedUser;
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
    return normalizeUser(storage.get(USER_KEY));
  },

  isAuthenticated() {
    return Boolean(storage.get(TOKEN_KEY));
  },

  getToken() {
    return storage.get(TOKEN_KEY);
  },
};


import axios from "axios";
import { API_BASE_URL, TOKEN_KEY, REFRESH_TOKEN_KEY } from "../constants";
import { storage } from "../utils/storage";

const ACTIVE_MALL_KEY = "mms_active_mall_id";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = storage.get(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const activeMallId = storage.get(ACTIVE_MALL_KEY);
    const shouldAttachMallId =
      activeMallId && !String(config.url || '').startsWith('/malls');
    if (shouldAttachMallId) {
      if (config.method === "get" || config.method === "delete") {
        config.params = { mallId: activeMallId, ...config.params };
      } else if (
        config.data &&
        typeof config.data === "object" &&
        !(config.data instanceof FormData) &&
        config.data.mallId === undefined
      ) {
        config.data = { mallId: activeMallId, ...config.data };
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  refreshQueue = [];
};

// Handle 401s by attempting a token refresh, then logging out if that fails
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = storage.get(REFRESH_TOKEN_KEY);
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const newToken = data?.data?.accessToken || data?.accessToken;
        storage.set(TOKEN_KEY, newToken);
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        storage.remove(TOKEN_KEY);
        storage.remove(REFRESH_TOKEN_KEY);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;


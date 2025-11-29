// src/api-client/setupAxios.ts
import axios from "axios";
import { api } from "./client";

/**
 * Interceptor, który:
 * - przy 401 próbuje wywołać api.userTokenRefresh()
 * - jeśli otrzyma nowy token -> zapisuje go i retry request
 * - zabezpiecza przed wieloma równoległymi refreshami
 */

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

axios.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;
    if (!config || !response) return Promise.reject(error);

    if (response.status !== 401) {
      return Promise.reject(error);
    }

    // Avoid infinite loop for refresh endpoint itself
    if (config.url?.includes("/auth/refresh") || config.url?.includes("/userTokenRefresh")) {
      // logout fallback
      localStorage.removeItem("accessToken");
      return Promise.reject(error);
    }

    // If already refreshing, queue the request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        addRefreshSubscriber((token: string) => {
          // set header and retry
          config.headers = config.headers || {};
          config.headers["Authorization"] = `Bearer ${token}`;
          resolve(axios(config));
        });
      });
    }

    isRefreshing = true;
    try {
      const refreshRes: any = await api.userTokenRefresh();
      // Try to be flexible with where token might be:
      const token =
        (refreshRes && refreshRes.data && (refreshRes.data.token || refreshRes.data.accessToken)) ||
        (refreshRes && (refreshRes.token || refreshRes.accessToken)) ||
        null;

      if (token) {
        localStorage.setItem("accessToken", token);
        // notify queued requests
        onRefreshed(token);
        // retry original
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
        isRefreshing = false;
        return axios(config);
      } else {
        // if backend returned something unexpected, clear storage
        localStorage.removeItem("accessToken");
        isRefreshing = false;
        return Promise.reject(error);
      }
    } catch (e) {
      isRefreshing = false;
      localStorage.removeItem("accessToken");
      return Promise.reject(e);
    }
  }
);

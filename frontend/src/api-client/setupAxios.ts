// src/api-client/setupAxios.ts
import axios from "axios";

const basePath = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1.0";

// zawsze wysyłaj ciasteczka (refreshToken)
axios.defaults.withCredentials = true;

axios.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
    console.log("Request interceptor: doklejono Authorization", config.headers["Authorization"]);
  }
  return config;
});

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

    // unikamy pętli przy refresh
    if (config.url?.includes("/auth/refresh")) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        addRefreshSubscriber((token: string) => {
          config.headers = config.headers || {};
          config.headers["Authorization"] = `Bearer ${token}`;
          resolve(axios(config));
        });
      });
    }

    isRefreshing = true;
    try {
      const refreshRes = await axios.post(`${basePath}/auth/refresh`, {}, { withCredentials: true });
      const token = refreshRes?.data?.token;

      if (token) {
        localStorage.setItem("accessToken", token);
        onRefreshed(token);

        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
        isRefreshing = false;
        return axios(config);
      } else {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        isRefreshing = false;
        return Promise.reject(error);
      }
    } catch (e) {
      isRefreshing = false;
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
      return Promise.reject(e);
    }
  }
);

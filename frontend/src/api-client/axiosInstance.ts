import axios, { AxiosError, AxiosInstance } from "axios";

const basePath =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1.0";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: basePath,
  withCredentials: true,
});

// =========================
// REQUEST INTERCEPTOR
// =========================
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// =========================
// RESPONSE INTERCEPTOR
// =========================
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function resolveQueue(token: string) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest: any = error.config;
    const response = error.response;

    if (!response || response.status !== 401) {
      return Promise.reject(error);
    }

    // NIE blokujemy refresh
    if (
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/logout")
    ) {
      return Promise.reject(error);
    }

    const message = response.data?.message;

    // ❌ Token nie wygasł — jest niepoprawny → wyloguj
    if (message !== "Token expired") {
      logout();
      return Promise.reject(error);
    }

    // ❌ Unikamy pętli
    if (originalRequest._retry) {
      logout();
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    // Kolejka równoległych requestów
    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(axiosInstance(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      // 🔥 używamy czystego axios, NIE axiosInstance
      const refreshResponse = await axios.post(
        `${basePath}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const newToken = refreshResponse.data?.token;
      if (!newToken) throw new Error("No token in refresh response");

      localStorage.setItem("accessToken", newToken);
      resolveQueue(newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(originalRequest);
    } catch (err) {
      // ❌ Refresh się nie udał → refreshToken wygasł → wyloguj
      logout();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

// =========================
// LOGOUT
// =========================
function logout() {
  localStorage.removeItem("accessToken");
  window.location.href = "/login";
}

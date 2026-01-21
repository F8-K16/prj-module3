import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

const instance: AxiosInstance = axios.create({
  baseURL,
});

/* ================= REQUEST ================= */
instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ================= REFRESH TOKEN ================= */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(instance(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post<{
          success: boolean;
          message: string;
          data: {
            accessToken: string;
            refreshToken: string;
          };
        }>(`${baseURL}/api/auth/refresh-token`, {
          refreshToken,
        });

        const newAccessToken = res.data.data.accessToken;
        const newRefreshToken = res.data.data.refreshToken;

        localStorage.setItem("access_token", newAccessToken);
        localStorage.setItem("refresh_token", newRefreshToken);

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return instance(originalRequest);
      } catch (err) {
        processQueue(err as AxiosError, null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default instance;

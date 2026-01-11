import { getNewTokenApi } from "@/services/authApi";
import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

/* ================= CONFIG ================= */
const baseURL: string = import.meta.env.VITE_BASE_URL;

/* ================= TYPES ================= */
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/* ================= AXIOS INSTANCE ================= */
const instance: AxiosInstance = axios.create({
  baseURL,
});

/* ================= REQUEST INTERCEPTOR ================= */
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    const status = error.response?.status;
    const refreshToken = localStorage.getItem("refresh_token");

    if (status === 401 && refreshToken && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await getNewTokenApi();

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return instance(originalRequest);
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;

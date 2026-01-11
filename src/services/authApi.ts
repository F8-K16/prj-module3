import instance from "@/utils/axios";
import type {
  ApiErrorResponse,
  LoginPayload,
  RefreshResponse,
  RegisterPayload,
} from "@/types/auth";
import { AxiosError } from "axios";
import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

export const loginApi = async (data: LoginPayload) => {
  try {
    const res = await instance.post("/auth/login", data);
    return res.data;
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    console.log(error);

    if (error.response) {
      const status = error.response.status;

      if (status === 400) {
        throw new Error("Email hoặc mật khẩu không đúng.");
      } else {
        throw new Error("Lỗi hệ thống. Vui lòng thử lại sau.");
      }
    }

    throw new Error("Đã có lỗi xảy ra. Vui lòng thử lại.");
  }
};

export const getNewTokenApi = async (): Promise<string> => {
  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const res = await axios.post<RefreshResponse>(
    `${baseURL}/auth/refresh-token`,
    { refreshToken }
  );

  const { access_token, refresh_token } = res.data;

  localStorage.setItem("access_token", access_token);
  localStorage.setItem("refresh_token", refresh_token);

  return access_token;
};

export const getProfileApi = () => instance.get("/auth/me");

export const registerApi = (data: RegisterPayload) =>
  instance.post("/auth/register", data);

export const logoutApi = () => instance.delete("/auth/logout");

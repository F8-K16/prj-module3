import instance from "@/utils/axios";
import type {
  ApiErrorResponse,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  ResendVerifyPayload,
} from "@/types/auth";
import { AxiosError } from "axios";

/* ================= LOGIN ================= */
export const loginApi = async (data: LoginPayload): Promise<LoginResponse> => {
  try {
    const res = await instance.post<LoginResponse>("/api/auth/login", data);
    return res.data;
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    throw new Error(error.response?.data.message ?? "Login failed");
  }
};

/* ================= REGISTER ================= */
export const registerApi = async (data: RegisterPayload) => {
  try {
    const res = await instance.post("/api/auth/register", data);
    return res.data;
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    throw new Error(error.response?.data.message ?? "Register failed");
  }
};

/* ================= VERIFY EMAIL ================= */
export const verifyEmailApi = async (token: string) => {
  const res = await instance.post(`/api/auth/verify-email/${token}`);

  if (!res.data.success) {
    throw new Error(res.data.message || "Verify email failed");
  }

  return res.data;
};

/* ================= RESEND VERIFY ================= */
export const resendVerifyEmailApi = async (data: ResendVerifyPayload) => {
  try {
    const res = await instance.post(
      "/api/auth/resend-verification-email",
      data,
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Resend verification email failed");
    }

    return res.data;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }

    throw new Error("Không thể gửi lại email xác thực");
  }
};

/* ================= GET PROFILE ================= */
export const getProfileApi = async () => {
  const res = await instance.get("/api/users/profile");
  return res.data;
};

/* ================= LOGOUT ================= */
export const logoutApi = async () => {
  const refreshToken = localStorage.getItem("refresh_token");

  try {
    const res = await instance.post("/api/auth/logout", {
      refreshToken,
    });

    if (!res.data.success) {
      throw new Error(res.data.message || "Logout failed");
    }

    return res.data;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("Logout failed");
  }
};

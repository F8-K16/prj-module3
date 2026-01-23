import instance from "@/utils/axios";
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  ResendVerifyPayload,
} from "@/types/auth";
import { parseApiError } from "@/utils/helper";

/* ================= LOGIN ================= */
export const loginApi = async (data: LoginPayload): Promise<LoginResponse> => {
  try {
    const res = await instance.post<LoginResponse>("/api/auth/login", data);
    return res.data;
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ================= REGISTER ================= */
export const registerApi = async (data: RegisterPayload) => {
  try {
    const res = await instance.post("/api/auth/register", data);
    return res.data;
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ================= VERIFY EMAIL ================= */
export const verifyEmailApi = async (token: string) => {
  try {
    const res = await instance.post(`/api/auth/verify-email/${token}`);

    if (!res.data.success) {
      throw {
        message: res.data.message || "Xác minh email thất bại",
      };
    }

    return res.data;
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ================= RESEND VERIFY ================= */
export const resendVerifyEmailApi = async (data: ResendVerifyPayload) => {
  try {
    const res = await instance.post(
      "/api/auth/resend-verification-email",
      data,
    );

    if (!res.data.success) {
      throw {
        message: res.data.message || "Gửi lại email xác minh thất bại",
      };
    }

    return res.data;
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ================= GET PROFILE ================= */
export const getProfileApi = async () => {
  try {
    const res = await instance.get("/api/users/profile");
    return res.data;
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ================= LOGOUT ================= */
export const logoutApi = async () => {
  const refreshToken = localStorage.getItem("refresh_token");

  try {
    const res = await instance.post("/api/auth/logout", {
      refreshToken,
    });

    if (!res.data.success) {
      throw {
        message: res.data.message || "Đăng xuất thất bại",
      };
    }

    return res.data;
  } catch (err) {
    throw parseApiError(err);
  }
};

/* ================= RESET PASSWORD ================= */
export const forgotPasswordApi = (email: string) => {
  return instance.post(`/api/auth/forgot-password`, { email });
};

export const resetPasswordApi = (
  token: string,
  password: string,
  confirmPassword: string,
) => {
  return instance.post(`/api/auth/reset-password/${token}`, {
    password,
    confirmPassword,
  });
};

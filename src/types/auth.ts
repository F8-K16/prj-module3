import type { User } from "./user";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  error: string | null;
  isProfileUpdated: boolean;

  loginLoading: boolean;
  registerLoading: boolean;
  authLoading: boolean;
  updateLoading: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

export interface ResendVerifyPayload {
  email: string;
}

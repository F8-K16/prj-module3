import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  loginApi,
  logoutApi,
  getProfileApi,
  registerApi,
  forgotPasswordApi,
  resetPasswordApi,
} from "@/services/authApi";
import {
  type LoginResponse,
  type AuthState,
  type LoginPayload,
  type RegisterPayload,
} from "@/types/auth";
import { updateProfileApi } from "@/services/userApi";
import type { User } from "@/types/user";
import type { ApiError } from "@/types/api";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  error: null,
  isProfileUpdated: false,

  authLoading: false,
  loginLoading: false,
  registerLoading: false,
  updateLoading: false,

  forgotLoading: false,
  forgotSuccess: false,
  resetLoading: false,
  resetSuccess: false,
};

export const login = createAsyncThunk<
  LoginResponse,
  LoginPayload,
  { rejectValue: ApiError }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    return await loginApi(payload);
  } catch (err) {
    return rejectWithValue(err as ApiError);
  }
});

export const register = createAsyncThunk<
  void,
  RegisterPayload,
  { rejectValue: ApiError }
>("auth/register", async (data, { rejectWithValue }) => {
  try {
    await registerApi(data);
  } catch (err) {
    return rejectWithValue(err as ApiError);
  }
});

export const getProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: ApiError }
>("auth/getProfile", async (_, { rejectWithValue }) => {
  try {
    const res = await getProfileApi();
    return res.data;
  } catch (err) {
    return rejectWithValue(err as ApiError);
  }
});

export const updateProfile = createAsyncThunk<
  User,
  FormData,
  { rejectValue: ApiError }
>("auth/updateProfile", async (formData, { rejectWithValue }) => {
  try {
    return await updateProfileApi(formData);
  } catch (err) {
    return rejectWithValue(err as ApiError);
  }
});

export const logout = createAsyncThunk<void, void, { rejectValue: ApiError }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
    } catch (err) {
      return rejectWithValue(err as ApiError);
    }
  },
);

export const initAuth = createAsyncThunk<User, void, { rejectValue: ApiError }>(
  "auth/initAuth",
  async (_, { dispatch, rejectWithValue }) => {
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      return rejectWithValue({ message: "NO_TOKEN" });
    }

    try {
      return await dispatch(getProfile()).unwrap();
    } catch (err) {
      return rejectWithValue(err as ApiError);
    }
  },
);

export const forgotPassword = createAsyncThunk<
  string,
  string,
  { rejectValue: ApiError }
>("auth/forgotPassword", async (email, { rejectWithValue }) => {
  try {
    const res = await forgotPasswordApi(email);
    return res.data.message;
  } catch (err) {
    return rejectWithValue(err as ApiError);
  }
});

export const resetPassword = createAsyncThunk<
  string,
  { token: string; password: string; confirmPassword: string },
  { rejectValue: ApiError }
>("auth/resetPassword", async (data, { rejectWithValue }) => {
  try {
    const res = await resetPasswordApi(
      data.token,
      data.password,
      data.confirmPassword,
    );
    return res.data.message;
  } catch (err) {
    return rejectWithValue(err as ApiError);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    resetProfileUpdated(state) {
      state.isProfileUpdated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // INIT
      .addCase(initAuth.pending, (state) => {
        state.isInitialized = false;
      })
      .addCase(initAuth.fulfilled, (state) => {
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(initAuth.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.registerLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.registerLoading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.registerLoading = false;
        state.error = action.payload?.message ?? "Đăng ký thất bại";
      })

      // LOGIN
      .addCase(login.pending, (state) => {
        state.loginLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.isAuthenticated = true;
        state.isInitialized = true;

        const { user, tokens } = action.payload.data;

        state.user = user;

        localStorage.setItem("access_token", tokens.accessToken);
        localStorage.setItem("refresh_token", tokens.refreshToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.loginLoading = false;
        state.isInitialized = true;
        state.error = action.payload?.message ?? "Đăng nhập thất bại";
      })

      // GET PROFILE
      .addCase(getProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })

      // UPDATE PROFILE
      .addCase(updateProfile.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
        state.isProfileUpdated = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.user = action.payload;
        state.isProfileUpdated = true;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload?.message ?? "Cập nhật thông tin thất bại";
      })

      // LOGOUT
      .addCase(logout.pending, (state) => {
        state.authLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.authLoading = false;
        state.user = null;
        state.isAuthenticated = false;

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      })
      .addCase(logout.rejected, (state) => {
        state.authLoading = false;
        state.user = null;
        state.isAuthenticated = false;

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      })

      // RESET PASSWORD
      .addCase(forgotPassword.pending, (state) => {
        state.forgotLoading = true;
        state.error = null;
        state.forgotSuccess = false;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.forgotLoading = false;
        state.forgotSuccess = true;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotLoading = false;
        state.error = action.payload?.message || "Có lỗi xảy ra";
      })

      .addCase(resetPassword.pending, (state) => {
        state.resetLoading = true;
        state.error = null;
        state.resetSuccess = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetLoading = false;
        state.resetSuccess = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetLoading = false;
        state.error = action.payload?.message || "Reset mật khẩu thất bại";
      });
  },
});

export default authSlice.reducer;
export const { clearAuthError, resetProfileUpdated } = authSlice.actions;

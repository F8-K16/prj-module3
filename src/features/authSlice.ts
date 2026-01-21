import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  loginApi,
  logoutApi,
  getProfileApi,
  registerApi,
} from "@/services/authApi";
import {
  type LoginResponse,
  type AuthState,
  type LoginPayload,
  type RegisterPayload,
} from "@/types/auth";
import { updateProfileApi } from "@/services/userApi";
import type { User } from "@/types/user";

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
};

export const login = createAsyncThunk<
  LoginResponse,
  LoginPayload,
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    return await loginApi(payload);
  } catch (err) {
    return rejectWithValue((err as Error).message);
  }
});

export const register = createAsyncThunk(
  "auth/register",
  async (data: RegisterPayload, { rejectWithValue }) => {
    try {
      const res = await registerApi(data);
      return res;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const getProfile = createAsyncThunk<User, void, { rejectValue: string }>(
  "auth/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getProfileApi();
      return res.data;
    } catch {
      return rejectWithValue("UNAUTHORIZED");
    }
  },
);

export const updateProfile = createAsyncThunk<
  User,
  FormData,
  { rejectValue: string }
>("auth/updateProfile", async (formData, { rejectWithValue }) => {
  try {
    const res = await updateProfileApi(formData);
    return res.data;
  } catch {
    return rejectWithValue("Update profile failed");
  }
});

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Logout failed",
      );
    }
  },
);

export const initAuth = createAsyncThunk(
  "auth/init",
  async (_, { dispatch, rejectWithValue }) => {
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      return rejectWithValue("NO_TOKEN");
    }
    try {
      return await dispatch(getProfile()).unwrap();
    } catch {
      return rejectWithValue("UNAUTHORIZED");
    }
  },
);

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
        state.error = action.payload as string;
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
        state.error = action.payload ?? "Đăng nhập thất bại";
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
        state.error = action.payload as string;
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
      });
  },
});

export default authSlice.reducer;
export const { clearAuthError, resetProfileUpdated } = authSlice.actions;

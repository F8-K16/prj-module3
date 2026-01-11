import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  loginApi,
  logoutApi,
  getNewTokenApi,
  getProfileApi,
} from "@/services/authApi";
import {
  type LoginResponse,
  type AuthState,
  type LoginPayload,
  type User,
} from "@/types/auth";

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem("access_token"),
  isAuthenticated: false,
  isInitialized: false,
  loading: false,
  loginLoading: false,
  error: null,
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

export const getProfile = createAsyncThunk("auth/getProfile", async () => {
  const res = await getProfileApi();
  return res.data as User;
});

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
    } catch {
      return rejectWithValue("LOGOUT_FAILED");
    }
  }
);

export const initAuth = createAsyncThunk(
  "auth/init",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await dispatch(getProfile()).unwrap();
    } catch {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        return rejectWithValue("Unauthorized");
      }
      try {
        await getNewTokenApi();
        await dispatch(getProfile()).unwrap();
      } catch {
        return rejectWithValue("REFRESH_FAILED");
      }
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // INIT
      .addCase(initAuth.fulfilled, (state) => {
        state.isInitialized = true;
      })
      .addCase(initAuth.rejected, (state, action) => {
        state.isInitialized = true;
        state.isAuthenticated = false;
        state.user = null;

        if (action.payload === "REFRESH_FAILED") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      })

      // LOGIN
      .addCase(login.pending, (state) => {
        state.loginLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.accessToken = action.payload.access_token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isInitialized = true;

        localStorage.setItem("access_token", action.payload.access_token);
        localStorage.setItem("refresh_token", action.payload.refresh_token);
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

      // LOGOUT
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default authSlice.reducer;
export const { clearAuthError } = authSlice.actions;

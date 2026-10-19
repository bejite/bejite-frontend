// src/redux/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
//import axios from 'axios';
import axiosInstance from '../../utils/axiosInstance';

// ✅ Async thunk for signup
export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/signup', userData);
      const data = response.data;
      return {
        success: data?.success ?? true,
        message: data?.message,
        email: userData?.email ?? data?.user?.email,
      };
    } catch (err) {
      console.error("API error:", err);
      if (err.response?.data) {
        console.log("Validation errors from API:", err.response.data);
        return rejectWithValue(err.response.data);
      }
      return rejectWithValue({ error: "Network Error" });
    }
  }
);

// ✅ Async thunk for login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/auth/login',
        credentials
      );
      return response.data;
    } catch (err) {
      console.error("Login API error:", err);
      if (err.response?.data) {
        console.log("Login errors from API:", err.response.data);
        return rejectWithValue({
          ...err.response.data,
          status: err.response.status,
        });
      }
      return rejectWithValue({ error: "Network Error", status: 0 });
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    loading: false,
    user: null,
    token: null,
    errors: {},
  },
  reducers: {
    clearErrors: (state) => {
      console.log("Clearing errors");
      state.errors = {};
    },
    hydrateAuth: (state) => {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken") ||
        null;
      if (token) state.token = token;
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.id || parsed?.email) {
            state.user = parsed;
          }
        }
      } catch {
        /* ignore corrupt user blob */
      }
    },
    updateUser: (state, action) => {
      if (state.user) {
        const updatedUser = { ...state.user, ...action.payload };
        state.user = updatedUser;
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        try {
          const stored = JSON.parse(localStorage.getItem("user") || "{}");
          const merged = { ...stored, ...action.payload };
          localStorage.setItem("user", JSON.stringify(merged));
          // Hydrate Redux so Nav / feed see avatar updates (recruiters often only had localStorage until sync).
          if (merged?.id || merged?.email) {
            state.user = merged;
          }
        } catch {
          let fallback = {};
          try {
            fallback = JSON.parse(localStorage.getItem("user") || "{}");
          } catch {
            /* keep empty fallback */
          }
          const merged = { ...fallback, ...action.payload };
          localStorage.setItem("user", JSON.stringify(merged));
          if (merged?.id || merged?.email) {
            state.user = merged;
          }
        }
      }
    },
    logout: (state) => {
      console.log("Logging out");
      state.user = null;
      state.token = null;
      state.errors = {};
      localStorage.removeItem("authToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    // ✅ New reducer for Google login
    setGoogleAuth: (state, action) => {
      state.token = action.payload.token || null;
      state.errors = {};
      
      // Build merged user with image and set both Redux state and localStorage
      if (action.payload.user) {
        const userData = action.payload.user;
        const userWithImage = {
          ...userData,
          image: action.payload.profilePhoto || userData.image || null
        };
        state.user = userWithImage;
        localStorage.setItem("user", JSON.stringify(userWithImage));
      } else {
        state.user = null;
      }
    },
    /** JWT from POST /api/admin-auth/login (username/password) */
    setAdminAuth: (state, action) => {
      const { accessToken, refreshToken, admin } = action.payload || {};
      state.loading = false;
      state.token = accessToken || null;
      state.user = admin || null;
      state.errors = {};
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      if (admin) {
        localStorage.setItem("user", JSON.stringify(admin));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.errors = {};
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.loading = false;
        // Do not persist signup as a logged-in session (no tokens; avoid stale user on /signup).
        state.user = null;
        state.token = null;
        state.errors = {};
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.errors = action.payload || { error: "Signup failed" };
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.errors = {};
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.accessToken;
        state.errors = {};

        // Build the merged user object with image and profileCompleted
        const userData = action.payload.confirmedUser || action.payload.user;
        if (userData) {
          const rawPhoto =
            action.payload.profilePhoto ??
            userData.profile_photo ??
            userData.profilePhoto ??
            userData.image ??
            null;
          const normalizedPhoto =
            typeof rawPhoto === 'string' && rawPhoto.trim()
              ? rawPhoto.trim()
              : null;

          const userWithProfileStatus = {
            ...userData,
            profileCompleted: action.payload.profileCompleted || false,
            ...(normalizedPhoto
              ? {
                  profile_photo: normalizedPhoto,
                  profilePhoto: normalizedPhoto,
                  image: normalizedPhoto,
                }
              : {
                  image:
                    userData.image ??
                    userData.profile_photo ??
                    userData.profilePhoto ??
                    null,
                }),
          };
          // Set Redux state with the merged user (includes image)
          state.user = userWithProfileStatus;
          // Also persist to localStorage
          localStorage.setItem("user", JSON.stringify(userWithProfileStatus));
        } else {
          state.user = null;
        }

        // Store tokens in localStorage
        if (action.payload.accessToken) {
          localStorage.setItem("accessToken", action.payload.accessToken);
        }
        if (action.payload.refreshToken) {
          localStorage.setItem("refreshToken", action.payload.refreshToken);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.errors = action.payload || { error: "Login failed" };
      });
  },
});

export const { clearErrors, logout, setGoogleAuth, setAdminAuth, updateUser, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;

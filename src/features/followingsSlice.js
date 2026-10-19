import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAccessToken } from "../utils/tokenManager";
const API_URL = import.meta.env.VITE_API_URL;


// Thunk to call the backend complete-signup API
export const completeSignupThunk = createAsyncThunk(
  "followings/completeSignup",
  async ({ role, mode, followings }, { rejectWithValue }) => {
    console.log(" completeSignupThunk called with:", { role, mode, followings });

    try {
      const token = getAccessToken();
      if (!token) {
        return rejectWithValue("Authentication required");
      }
      const res = await fetch(`${API_URL}/auth/complete-signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role, mode, followings }),
      });

      const data = await res.json();
      console.log(" completeSignup API response:", data);

      if (!res.ok) {
        return rejectWithValue(data.error || "Failed to complete signup");
      }

      return data;
    } catch (err) {
      console.error(" completeSignupThunk error:", err);
      return rejectWithValue(err.message || "Network error");
    }
  }
);

const followingsSlice = createSlice({
  name: "followings",
  initialState: {
    followings: [],
    loading: false,
    error: null,
  },
  reducers: {
    setFollowings: (state, action) => {
      console.log("🗂 setFollowings called:", action.payload);
      state.followings = action.payload;
    },
    clearFollowings: (state) => {
      console.log("🧹 clearFollowings called");
      state.followings = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(completeSignupThunk.pending, (state) => {
        console.log(" completeSignupThunk pending");
        state.loading = true;
        state.error = null;
      })
      .addCase(completeSignupThunk.fulfilled, (state, action) => {
        console.log(" completeSignupThunk fulfilled:", action.payload);
        state.loading = false;
        state.followings = [];
      })
      .addCase(completeSignupThunk.rejected, (state, action) => {
        console.error(" completeSignupThunk rejected:", action.payload);
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFollowings, clearFollowings } = followingsSlice.actions;

export default followingsSlice.reducer;

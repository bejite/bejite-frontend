// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
// import followingsReducer from "../features/followingsSlice";
// import workHistoryReducer from "../features/workHistory/workHistorySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // followings: followingsReducer,
    // workHistory: workHistoryReducer,
  },
});

export default store;

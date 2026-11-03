import axios from "axios";
import { API_URL } from "../config.mjs";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - automatically attach access token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Default instance Content-Type is application/json — breaks multipart uploads (Multer sees no file).
    if (config.data instanceof FormData && config.headers) {
      if (typeof config.headers.delete === "function") {
        config.headers.delete("Content-Type");
      } else {
        delete config.headers["Content-Type"];
      }
    }

    const accessToken = localStorage.getItem("accessToken");
    const legacyAuthToken = localStorage.getItem("authToken");
    const tokenToUse = accessToken || legacyAuthToken;

    // Promote legacy token key so other parts of app can rely on accessToken.
    if (!accessToken && legacyAuthToken) {
      localStorage.setItem("accessToken", legacyAuthToken);
    }

    if (tokenToUse) {
      config.headers.Authorization = `Bearer ${tokenToUse}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

function isNetworkOrServerRefreshFailure(err) {
  if (!err?.response) return true; // timeout, offline, CORS, aborted
  const status = err.response.status;
  return status >= 500;
}

// Response interceptor - handle token refresh on 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Never retry the refresh endpoint itself.
    if (originalRequest?.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const {
        clearAuthData,
        refreshAccessToken,
        restoreUserFromServer,
        dispatchHydrateAuth,
        getAccessToken,
        hasValidAccessToken,
        getRefreshToken,
      } = await import("./tokenManager.js");

      try {
        if (!getRefreshToken() && !hasValidAccessToken()) {
          return Promise.reject(error);
        }

        const { accessToken: newAccessToken } = await refreshAccessToken();
        const tokenToUse = newAccessToken || getAccessToken();
        if (!tokenToUse) {
          throw new Error("Refresh produced no access token");
        }

        try {
          await restoreUserFromServer();
          await dispatchHydrateAuth();
        } catch {
          /* profile restore is best-effort after a successful refresh */
        }

        originalRequest.headers.Authorization = `Bearer ${tokenToUse}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Network / 5xx: keep the session so the user is not kicked for a blip.
        if (isNetworkOrServerRefreshFailure(refreshError)) {
          return Promise.reject(refreshError);
        }

        // Another tab may have refreshed while we failed — retry once with storage tokens.
        if (hasValidAccessToken()) {
          originalRequest.headers.Authorization = `Bearer ${getAccessToken()}`;
          return axiosInstance(originalRequest);
        }

        clearAuthData();
        sessionStorage.setItem("sessionExpired", "true");
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;

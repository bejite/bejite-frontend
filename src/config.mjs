/** Backend origin for API + resolving `/uploads/...` paths; no trailing slash */
const trimTrailingSlash = (value) => {
  if (value == null || value === "") return "";
  return String(value).trim().replace(/\/+$/, "");
};

export const API_URL = trimTrailingSlash(import.meta.env.VITE_API_URL);
export const API_KEY = import.meta.env.VITE_API_KEY;
/** Must match the backend's Google CLIENT_ID so Google ID tokens pass verification. */
export const GOOGLE_CLIENT_ID = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();

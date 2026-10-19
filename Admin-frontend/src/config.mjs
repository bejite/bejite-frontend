/** Backend origin for API + resolving `/uploads/...` paths; no trailing slash */
const trimTrailingSlash = (value) => {
  if (value == null || value === "") return "";
  return String(value).trim().replace(/\/+$/, "");
};

export const API_URL = trimTrailingSlash(import.meta.env.VITE_API_URL);
export const API_KEY = import.meta.env.VITE_API_KEY;

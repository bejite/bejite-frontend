import axiosInstance from "../utils/axiosInstance";

function readError(error, fallback) {
  return error?.response?.data?.error || error?.message || fallback;
}

export async function getTwoFactorStatus() {
  try {
    const { data } = await axiosInstance.get("/auth/2fa/status");
    return data;
  } catch (error) {
    throw new Error(readError(error, "Could not load 2FA status"));
  }
}

export async function setupTwoFactor(password) {
  try {
    const { data } = await axiosInstance.post("/auth/2fa/setup", { password });
    return data;
  } catch (error) {
    throw new Error(readError(error, "Could not start 2FA setup"));
  }
}

export async function enableTwoFactor(code, password) {
  try {
    const { data } = await axiosInstance.post("/auth/2fa/enable", { code, password });
    return data;
  } catch (error) {
    throw new Error(readError(error, "Could not enable 2FA"));
  }
}

export async function disableTwoFactor(code) {
  try {
    const { data } = await axiosInstance.post("/auth/2fa/disable", { code });
    return data;
  } catch (error) {
    throw new Error(readError(error, "Could not disable 2FA"));
  }
}

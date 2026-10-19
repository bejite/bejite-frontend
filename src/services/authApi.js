import axiosPublic from "./axiosPublic";
import axiosInstance from "../utils/axiosInstance";

export async function signupUserRequest(userData) {
  const response = await axiosPublic.post("/auth/signup", userData);
  return response.data;
}

export async function loginUserRequest(credentials) {
  const response = await axiosPublic.post("/auth/login", credentials);
  return response.data;
}

export async function changePasswordRequest({
  currentPassword,
  newPassword,
  confirmPassword,
  twoFactorCode,
}) {
  const response = await axiosInstance.patch("/auth/change-password", {
    currentPassword,
    newPassword,
    confirmPassword,
    twoFactorCode,
  });
  return response.data;
}

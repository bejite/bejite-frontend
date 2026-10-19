import axiosInstance from "../utils/axiosInstance";

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

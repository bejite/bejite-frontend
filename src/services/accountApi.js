import axiosInstance from "../utils/axiosInstance";

function toAccountError(error, fallback) {
  const data = error?.response?.data;
  const status = error?.response?.status;
  let message = data?.error || data?.message || error?.message || fallback;
  if (status === 429) {
    message = "Too many attempts. Please wait 15 minutes and try again.";
  }
  const wrapped = new Error(message);
  wrapped.status = status;
  wrapped.code = data?.code;
  return wrapped;
}

/** Temporarily hide the account; logging in again reactivates it. */
export async function deactivateAccount({ reasonId, details }) {
  try {
    const { data } = await axiosInstance.post("/auth/account/deactivate", {
      reasonId,
      ...(details ? { details } : {}),
    });
    return data;
  } catch (error) {
    throw toAccountError(error, "Could not deactivate your account");
  }
}

/**
 * Permanently delete the account. Email/password accounts send `password`;
 * Google accounts send a fresh Google ID token as `googleToken`.
 */
export async function deleteAccount({ reasonId, details, password, googleToken }) {
  try {
    const { data } = await axiosInstance.delete("/auth/account", {
      data: {
        reasonId,
        ...(details ? { details } : {}),
        ...(password ? { password } : {}),
        ...(googleToken ? { googleToken } : {}),
      },
    });
    return data;
  } catch (error) {
    throw toAccountError(error, "Could not delete your account");
  }
}

export const AUTH_ERROR_CODES = {
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
};

/** @param {object} err - rejectWithValue payload or axios error data */
export function isEmailNotVerifiedError(err) {
  if (!err) return false;
  if (err.code === AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED) return true;
  if (
    err.status === 403 &&
    err.code === AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED
  ) {
    return true;
  }
  const message = String(err.error || err.message || "").toLowerCase();
  return message.includes("verify your email");
}

export function emailVerificationPath(email) {
  const trimmed = String(email || "").trim();
  if (!trimmed) return "/auth/email-sent?reason=login";
  return `/auth/email-sent?email=${encodeURIComponent(trimmed)}&reason=login`;
}

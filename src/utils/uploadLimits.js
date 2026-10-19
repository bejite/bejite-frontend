/** Client-side upload limits (keep in sync with backend uploadLimits.js). */

export const BYTES_IN_MB = 1024 * 1024;
export const IMAGE_MAX_BYTES = 20 * BYTES_IN_MB;
export const VIDEO_MAX_BYTES = 100 * BYTES_IN_MB;
export const CHAT_MAX_BYTES = 25 * BYTES_IN_MB;
export const CERTIFICATE_MAX_BYTES = 5 * BYTES_IN_MB;
export const PROFILE_PHOTO_MAX_BYTES = 20 * BYTES_IN_MB;

export function formatBytesAsMb(bytes) {
  return `${Math.round(bytes / BYTES_IN_MB)}MB`;
}

export function maxBytesForFile(file) {
  if (file?.type?.startsWith("video/")) return VIDEO_MAX_BYTES;
  return IMAGE_MAX_BYTES;
}

export function maxBytesForChatFile(file) {
  return Math.min(maxBytesForFile(file), CHAT_MAX_BYTES);
}

export function getUploadSizeError(file, maxBytes = maxBytesForFile(file)) {
  if (!file) return null;
  if (file.size <= maxBytes) return null;
  return `File too large. Maximum allowed size is ${formatBytesAsMb(maxBytes)}.`;
}

export function apiErrorMessage(error, fallback = "An error occurred") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    (typeof error?.message === "string" ? error.message : null) ||
    (typeof error === "string" ? error : null) ||
    fallback
  );
}

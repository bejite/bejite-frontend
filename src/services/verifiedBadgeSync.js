import { getBadgeStatus } from './verifiedBadgeApi';
import { getAccessToken, getUser, storeUser } from '../utils/tokenManager';
import { updateUser } from '../features/auth/authSlice';

/**
 * Fetch current verified-badge status and merge into the stored user session.
 * @param {import('@reduxjs/toolkit').Dispatch} [dispatch] - optional Redux dispatch
 */
export async function refreshVerifiedBadgeInSession(dispatch) {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const status = await getBadgeStatus();
    const hasVerifiedBadge = Boolean(status?.hasVerifiedBadge);
    const existing = getUser() || {};

    storeUser({
      ...existing,
      hasVerifiedBadge,
    });
    dispatch?.(updateUser({ hasVerifiedBadge }));

    return hasVerifiedBadge;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[refreshVerifiedBadgeInSession]', err?.message || err);
    }
    return null;
  }
}

/** @deprecated Use refreshVerifiedBadgeInSession */
export const refreshVerifiedBadge = refreshVerifiedBadgeInSession;

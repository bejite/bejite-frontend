/**
 * Token Management Utility
 * Provides helper functions to manage JWT tokens in localStorage
 */

import axios from 'axios';
import { API_URL } from '../config';
import { profilePhotoUrl } from './profilePhotoUrl';

let refreshInFlight = null;

// Store tokens after login/signup
export const storeTokens = (accessToken, refreshToken) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('authToken', accessToken);
  }
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

// Get access token
export const getAccessToken = () => {
  return localStorage.getItem('accessToken') || localStorage.getItem('authToken');
};

// Get refresh token
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

// Store user data
export const storeUser = (user) => {
  if (user && typeof user === 'object') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// Get user data (safe parse — corrupt blobs must not crash the app)
export const getUser = () => {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

// Clear all auth data (logout)
export const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('authToken'); // legacy token
  localStorage.removeItem('token'); // legacy key checked by EmailSent
  // Allow profile reminder to show again on the next login if still incomplete.
  sessionStorage.removeItem('bejite_profile_reminder_dismissed_for');
};

// Check if user is authenticated (access or refresh token present)
export const isAuthenticated = () => {
  return hasValidAccessToken() || Boolean(getRefreshToken());
};

/** Sync localStorage tokens/user into Redux (dynamic import avoids circular deps). */
export async function dispatchHydrateAuth() {
  const { hydrateAuthFromStorage } = await import('./authHydration.js');
  hydrateAuthFromStorage();
}

/** OAuth callback routes hand tokens via URL — AuthBootstrap must not race them. */
export function isOAuthCallbackPath(pathname, search = '') {
  if (pathname === '/auth/success') return true;
  if (pathname === '/complete-signup') {
    const params = new URLSearchParams(search);
    return (
      params.has('accessToken') ||
      params.has('refreshToken') ||
      params.has('token') ||
      params.has('code')
    );
  }
  return false;
}

/**
 * Exchange one-time OAuth handoff code for tokens (POST).
 * @param {string} code
 */
export async function exchangeOAuthCode(code) {
  const { data } = await axios.post(
    `${API_URL}/auth/oauth/exchange`,
    { code },
    { withCredentials: true, timeout: 12_000 },
  );
  if (data?.accessToken) {
    storeTokens(data.accessToken, data.refreshToken);
  }
  if (data?.user) {
    const existing = getUser() || {};
    storeUser(
      mergeAuthUsers(existing, {
        ...data.user,
        profileCompleted:
          data.profileCompleted === true || data.user.profileCompleted === true,
      }),
    );
  }
  await dispatchHydrateAuth();
  return data;
}

/**
 * Persist access/refresh tokens and user object from OAuth redirect query params.
 * Prefer `code` handoff; legacy query tokens still supported then stripped from URL.
 * @returns {Promise<{ accessToken: string|null, refreshToken: string|null, captured: boolean }>}
 */
export async function captureOAuthSessionFromUrl(search) {
  const params = new URLSearchParams(search);
  const handoffCode = params.get('code');

  if (handoffCode) {
    try {
      const data = await exchangeOAuthCode(handoffCode);
      stripAuthParamsFromUrl();
      return {
        accessToken: data?.accessToken || null,
        refreshToken: data?.refreshToken || null,
        captured: Boolean(data?.accessToken || data?.refreshToken),
      };
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('[captureOAuthSessionFromUrl] code exchange failed', err);
      }
      return { accessToken: null, refreshToken: null, captured: false };
    }
  }

  const accessToken = params.get('token') || params.get('accessToken');
  const refreshToken = params.get('refreshToken');
  const userParam = params.get('user');
  const profileCompleted = params.get('profileCompleted');

  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('authToken', accessToken);
  }
  if (userParam) {
    try {
      const userData = JSON.parse(decodeURIComponent(userParam));
      const existing = getUser() || {};
      const merged = mergeAuthUsers(existing, {
        ...userData,
        id: userData.id ?? userData.userId ?? userData.sub ?? existing.id ?? null,
        profileCompleted:
          profileCompleted === 'true' ||
          userData.profileCompleted === true ||
          existing.profileCompleted,
      });
      storeUser(merged);
    } catch {
      /* ignore malformed user param */
    }
  }

  if (accessToken || refreshToken) {
    stripAuthParamsFromUrl();
  }

  return {
    accessToken,
    refreshToken,
    captured: Boolean(accessToken || refreshToken),
  };
}

/** Remove sensitive query params from the address bar without navigation. */
export function stripAuthParamsFromUrl() {
  try {
    const url = new URL(window.location.href);
    [
      'token',
      'accessToken',
      'refreshToken',
      'user',
      'code',
      'twoFactorToken',
    ].forEach((key) => url.searchParams.delete(key));
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
  } catch {
    /* ignore */
  }
}

/** Re-fetch profile from GET /auth/me when tokens exist but user blob is missing/sparse. */
export async function restoreUserFromServer() {
  const token = getAccessToken();
  if (!token) return null;

  const existing = getUser();
  const hasIdentity = existing?.id || existing?.email;
  const hasDisplayName =
    existing?.firstName ||
    existing?.lastName ||
    existing?.name;
  if (hasIdentity && hasDisplayName) {
    return existing;
  }

  try {
      const { data } = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
        timeout: 12_000,
      });
    const me = data?.user ?? data;
    if (me && typeof me === 'object' && (me.id || me.email)) {
      const merged = mergeAuthUsers(existing || {}, me);
      storeUser(merged);
      return merged;
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[restoreUserFromServer]', err?.response?.status || err?.message);
    }
  }

  return existing;
}

/** Exchange refresh token for new access/refresh JWTs (regular users). Mutex prevents parallel rotation races. */
export const refreshAccessToken = async () => {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const { data } = await axios.post(
        `${API_URL}/auth/refresh`,
        { refreshToken },
        {
          withCredentials: true,
          timeout: 12_000,
        },
      );

      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('authToken', data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      await dispatchHydrateAuth();
      return data;
    } catch (err) {
      if (isRefreshAuthError(err)) {
        discardStaleRefreshToken();
      }
      throw err;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
};

// Decode JWT token
export const decodeToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Error decoding token:', error);
    }
    return null;
  }
};

/** True when JWT is missing, malformed, or past exp (tokens without exp never expire). */
export const isTokenExpired = (token, bufferSeconds = 30) => {
  if (!token) return true;
  const payload = decodeToken(token);
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000 - bufferSeconds * 1000;
};

export const hasValidAccessToken = () => {
  const token = getAccessToken();
  return Boolean(token && !isTokenExpired(token));
};

const isRefreshAuthError = (err) =>
  err?.response?.status === 401 &&
  typeof err?.response?.data?.error === 'string';

/** Drop stale refresh token after a failed rotation attempt. */
export const discardStaleRefreshToken = () => {
  localStorage.removeItem('refreshToken');
};

/**
 * Merge Redux user onto localStorage user without wiping defined fields with null/empty.
 * Fixes stale Redux overwriting profile_photo after OAuth/uploads stored only in localStorage.
 */
export const mergeAuthUsers = (localUser, reduxUser) => {
  const local = localUser && typeof localUser === 'object' ? { ...localUser } : {};
  if (!reduxUser || typeof reduxUser !== 'object') return local;
  const out = { ...local };
  Object.entries(reduxUser).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      out[key] = value;
    }
  });
  return out;
};

export const pickProfilePhotoPath = (user) => {
  if (!user || typeof user !== 'object') return null;
  return user.profile_photo || user.profilePhoto || user.image || null;
};

/** @deprecated Prefer profilePhotoUrl / profileAvatarSrc from ./profilePhotoUrl.js */
export const resolveProfileImageSrc = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') return null;
  if (imagePath.startsWith('/assets/')) return imagePath;
  if (imagePath.startsWith('assets/')) return `/${imagePath}`;
  return profilePhotoUrl(imagePath) ?? null;
};

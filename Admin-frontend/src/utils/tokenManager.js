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
};

// Check if user is authenticated (access or refresh token present)
export const isAuthenticated = () => {
  return !!(getAccessToken() || getRefreshToken());
};

/** Sync localStorage tokens/user into Redux (dynamic import avoids circular deps). */
export async function dispatchHydrateAuth() {
  const { default: store } = await import('../store/store.js');
  const { hydrateAuth } = await import('../features/auth/authSlice.js');
  store.dispatch(hydrateAuth());
}

/** OAuth callback routes hand tokens via URL — AuthBootstrap must not race them. */
export function isOAuthCallbackPath(pathname, search = '') {
  if (pathname === '/auth/success') return true;
  if (pathname === '/complete-signup') {
    const params = new URLSearchParams(search);
    return (
      params.has('accessToken') ||
      params.has('refreshToken') ||
      params.has('token')
    );
  }
  return false;
}

/**
 * Persist access/refresh tokens and user object from OAuth redirect query params.
 * @returns {{ accessToken: string|null, refreshToken: string|null, captured: boolean }}
 */
export function captureOAuthSessionFromUrl(search) {
  const params = new URLSearchParams(search);
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

  return {
    accessToken,
    refreshToken,
    captured: Boolean(accessToken || refreshToken),
  };
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

      const { data } = await axios.get(`${API_URL}/auth/refresh`, {
        params: { refreshToken },
        withCredentials: true,
      });

      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('authToken', data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      await dispatchHydrateAuth();
      return data;
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
    console.error('Error decoding token:', error);
    return null;
  }
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

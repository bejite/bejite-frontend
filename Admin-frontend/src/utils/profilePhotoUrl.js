/**
 * Profile / avatar image URL resolution against `VITE_API_URL` (backend origin, no trailing slash).
 *
 * @typedef {string | null | undefined} StoredPhoto
 */

import { API_URL } from '../config.mjs';

/** Default placeholder served from the Vite public folder */
export const PROFILE_PHOTO_PLACEHOLDER = '/assets/images/profile.svg';

/**
 * Upgrade Cloudinary delivery URLs so HTTPS pages never request http:// assets.
 *
 * @param {string | null | undefined} url
 * @returns {string | null | undefined}
 */
export function ensureCloudinaryHttps(url) {
  if (url == null || url === '') return url;
  const value = String(url).trim();
  if (!value) return url;
  if (value.startsWith('//') && /res\.cloudinary\.com/i.test(value)) {
    return `https:${value}`;
  }
  return value.replace(
    /^http:\/\/res\.cloudinary\.com/i,
    'https://res.cloudinary.com',
  );
}

/**
 * Returns an absolute URL for display, or `undefined` when there is nothing to show.
 * - Empty → `undefined`
 * - Already `http://` or `https://` → absolute URL (Cloudinary http upgraded to https)
 * - Protocol-relative `//…` → `https://…`
 * - `blob:` / `data:` → unchanged (local previews)
 * - `/assets/…` or `assets/…` → site-relative public path (no API prefix)
 * - Otherwise → `{API_URL}{path}` with a single slash between origin and path
 *
 * @param {StoredPhoto} stored
 * @returns {string | undefined}
 */
export function profilePhotoUrl(stored) {
  if (stored == null) return undefined;
  const s = String(stored).trim();
  if (!s) return undefined;
  if (/^https?:\/\//i.test(s)) return ensureCloudinaryHttps(s);
  if (s.startsWith('//')) {
    const upgraded = ensureCloudinaryHttps(s);
    return upgraded.startsWith('//') ? `https:${upgraded}` : upgraded;
  }
  if (s.startsWith('blob:') || s.startsWith('data:')) return s;
  if (s.startsWith('/assets/')) return s;
  if (s.startsWith('assets/')) return `/${s}`;

  const base = String(API_URL || '').trim().replace(/\/+$/, '');
  if (!base) return undefined;
  const path = s.startsWith('/') ? s : `/${s}`;
  return `${base}${path}`;
}

/**
 * @param {StoredPhoto} stored
 * @param {string} [placeholder]
 * @returns {string}
 */
export function profileAvatarSrc(stored, placeholder = PROFILE_PHOTO_PLACEHOLDER) {
  return profilePhotoUrl(stored) ?? placeholder;
}

import { ensureCloudinaryHttps, profilePhotoUrl } from './profilePhotoUrl';

/** Resolve post media URLs (Cloudinary, relative paths, etc.). */
export function resolvePostMediaUrl(url) {
  const resolved = profilePhotoUrl(url) || (url ? String(url).trim() : undefined);
  return resolved ? ensureCloudinaryHttps(resolved) : undefined;
}

/** Derive a poster frame for videos when thumbnailUrl is missing (Cloudinary). */
export function getVideoPosterUrl(item) {
  const storedThumb = resolvePostMediaUrl(item?.thumbnailUrl);
  if (storedThumb) return storedThumb;

  const videoUrl = resolvePostMediaUrl(item?.url);
  if (!videoUrl) return undefined;

  if (videoUrl.includes('res.cloudinary.com') && videoUrl.includes('/video/upload/')) {
    const [origin, rest] = videoUrl.split('/video/upload/');
    if (!rest) return undefined;
    const framePath = rest.replace(/\.(mp4|mov|webm|mkv|avi|m4v)(\?.*)?$/i, '.jpg$2');
    return ensureCloudinaryHttps(
      `${origin}/video/upload/so_0,w_800,h_450,c_fill/${framePath}`,
    );
  }

  return undefined;
}

export function isVideoMedia(item) {
  if (!item) return false;
  if (item.kind === 'video') return true;
  const url = String(item.url || '').toLowerCase();
  return /\.(mp4|mov|webm|mkv|avi|m4v)(\?|$)/.test(url);
}

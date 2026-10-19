import { profilePhotoUrl } from './profilePhotoUrl';

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp|svg|heic|heif)($|[?#])/i;
const PDF_EXT = /\.pdf($|[?#])/i;

/**
 * @param {string | null | undefined} stored
 * @returns {boolean}
 */
export function isDocumentImage(stored) {
  if (!stored) return false;
  return IMAGE_EXT.test(String(stored));
}

/**
 * @param {string | null | undefined} stored
 * @returns {boolean}
 */
export function isDocumentPdf(stored) {
  if (!stored) return false;
  const value = String(stored).toLowerCase();
  if (PDF_EXT.test(value)) return true;
  if (/\/raw\/upload\//.test(value)) return true;
  if (/application\/pdf/.test(value)) return true;
  return false;
}

/**
 * Client-side URL for document preview when no authenticated proxy is available.
 * Do NOT add unsigned Cloudinary transforms — they return 401 on strict accounts.
 *
 * @param {string | null | undefined} stored
 * @returns {string | undefined}
 */
export function documentViewUrl(stored) {
  const resolved = profilePhotoUrl(stored) || (stored ? String(stored).trim() : '');
  if (!resolved) return undefined;

  if (!/res\.cloudinary\.com/i.test(resolved)) {
    return resolved;
  }

  return resolved
    .replace(/\/upload\/fl_attachment:false\//i, '/upload/')
    .replace(/\/upload\/fl_attachment\//i, '/upload/');
}

/**
 * @param {string | null | undefined} fileUrl
 * @param {string | null | undefined} resolvedUrl
 * @returns {'image' | 'pdf' | 'unknown'}
 */
export function getDocumentMediaKind(fileUrl, resolvedUrl) {
  if (isDocumentImage(fileUrl) || isDocumentImage(resolvedUrl)) {
    return 'image';
  }
  if (isDocumentPdf(fileUrl) || isDocumentPdf(resolvedUrl)) {
    return 'pdf';
  }
  if (resolvedUrl && /\/image\/upload\//.test(resolvedUrl)) {
    return 'pdf';
  }
  return 'unknown';
}

/**
 * @param {string | null | undefined} fileUrl
 * @param {string | null | undefined} contentType
 * @returns {string}
 */
export function getDocumentDownloadFilename(fileUrl, contentType) {
  const type = String(contentType || '').toLowerCase();
  const fromPath = String(fileUrl || '').split('?')[0].split('/').pop() || '';

  if (fromPath && /\.[a-z0-9]{2,5}$/i.test(fromPath) && !/^[a-z0-9]{16,}\.[a-z0-9]+$/i.test(fromPath)) {
    return fromPath;
  }
  if (type.includes('pdf') || isDocumentPdf(fileUrl)) return 'document.pdf';
  if (type.includes('png') || /\.png/i.test(String(fileUrl))) return 'document.png';
  if (type.includes('jpeg') || type.includes('jpg') || isDocumentImage(fileUrl)) {
    return 'document.jpg';
  }
  return 'document';
}

/**
 * @param {string} url
 * @param {string} filename
 */
export function triggerDocumentDownload(url, filename) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

import { CHAT_MAX_BYTES } from './uploadLimits';

/** Infer attachment render type from stored metadata, then URL/caption fallback. */
export function extensionOf(name = '') {
  const base = String(name).split('?')[0].split('#')[0].trim();
  const match = base.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : '';
}

export function isPdfFilename(name = '') {
  return extensionOf(name) === 'pdf';
}

export function isPdfMime(mime = '') {
  return String(mime).toLowerCase().split(';')[0].trim() === 'application/pdf';
}

export function getAttachmentType(url, caption = '', meta = {}) {
  if (meta.kind) return meta.kind;
  if (!url || typeof url !== 'string') return null;
  const lower = url.toLowerCase();
  const captionLower = String(caption || '').toLowerCase();

  const isAudioExt = /\.(webm|mp3|wav|m4a|ogg)(\?|$)/i.test(lower);

  if (lower.includes('/raw/upload/') && isAudioExt) {
    return 'audio';
  }
  if (lower.includes('/video/upload/') || /\.(mp4|mov|webm|ogg)(\?|$)/i.test(lower)) {
    return 'video';
  }
  if (isAudioExt) {
    return 'audio';
  }
  if (
    captionLower.startsWith('📎') ||
    isPdfFilename(lower.split('?')[0]) ||
    /\.(doc|docx|xls|xlsx|ppt|pptx|txt|zip)(\?|$)/i.test(lower) ||
    /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip)$/i.test(captionLower.replace(/^📎\s*/, ''))
  ) {
    return 'document';
  }
  if (lower.includes('/raw/upload/')) {
    return 'document';
  }
  if (lower.includes('/image/upload/') || /\.(jpe?g|png|gif|webp|bmp|svg)(\?|$)/i.test(lower)) {
    return 'image';
  }
  return 'image';
}

export function isPdfAttachment(url, caption = '', meta = {}) {
  const kind = meta.kind || getAttachmentType(url, caption);
  if (kind && kind !== 'document') return false;
  if (isPdfMime(meta.mime)) return true;
  if (isPdfFilename(meta.name)) return true;
  if (isPdfFilename(String(caption || '').replace(/^📎\s*/, ''))) return true;
  if (isPdfFilename(String(url || '').split('?')[0])) return true;
  return false;
}

export function getDocumentFilename(caption, url, storedName) {
  if (storedName && String(storedName).trim()) return String(storedName).trim();
  const fromCaption = String(caption || '').replace(/^📎\s*/, '').trim();
  if (fromCaption && fromCaption !== 'Document') return fromCaption;
  try {
    const path = new URL(url, 'https://placeholder.local').pathname;
    const last = path.split('/').pop();
    if (last && last.includes('.')) return decodeURIComponent(last);
  } catch {
    // ignore
  }
  return 'Document';
}

export function hasPdfMagic(bytes) {
  return Boolean(
    bytes &&
      bytes.length >= 5 &&
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46 &&
      bytes[4] === 0x2d,
  );
}

/**
 * Cloudinary only accepts simple data URLs (e.g. data:audio/webm;base64,...).
 * FileReader can produce data:audio/webm;codecs=opus;base64,... which fails.
 */
export function normalizeDataUrlForUpload(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    return dataUrl;
  }
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx === -1) return dataUrl;

  const header = dataUrl.slice(0, commaIdx);
  const payload = dataUrl.slice(commaIdx + 1);
  const isBase64 = header.includes('base64');
  if (!isBase64) return dataUrl;

  const mime = header.slice(5).split(';')[0];
  return `data:${mime};base64,${payload}`;
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(normalizeDataUrlForUpload(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Plain MIME for MediaRecorder blobs (no ;codecs=opus). */
export function simpleAudioMime(recorderMime) {
  const raw = recorderMime || 'audio/webm';
  return raw.split(';')[0] || 'audio/webm';
}

export function inferUploadKind(file) {
  if (!file?.type) return 'document';
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'document';
}

export function isVoiceMessageCaption(caption) {
  return caption === '🎤 Voice message';
}

export function inferAudioMimeFromUrl(url) {
  if (!url || typeof url !== 'string') return 'audio/webm';
  const ext = url.toLowerCase().split('.').pop()?.split('?')[0];
  if (ext === 'm4a' || ext === 'mp4') return 'audio/mp4';
  if (ext === 'mp3') return 'audio/mpeg';
  if (ext === 'ogg') return 'audio/ogg';
  if (ext === 'wav') return 'audio/wav';
  return 'audio/webm';
}

export function isCloudinaryRawAudioUrl(url) {
  return /\/raw\/upload\/.*\.(webm|m4a|mp3|ogg|wav)(\?|$)/i.test(url || '');
}

export async function resolveVoicePlaybackUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (!isCloudinaryRawAudioUrl(url)) return url;

  const response = await fetch(url, { mode: 'cors' });
  if (!response.ok) {
    throw new Error(`Failed to load voice message (${response.status})`);
  }

  const mime = inferAudioMimeFromUrl(url);
  const blob = new Blob([await response.arrayBuffer()], { type: mime });
  return URL.createObjectURL(blob);
}

/**
 * Fetch a document and only treat it as a PDF if the file actually starts with %PDF-.
 */
export async function resolveDocumentForView(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('Missing document URL');
  }
  const maxBytes = CHAT_MAX_BYTES;
  const response = await fetch(url, { mode: 'cors' });
  if (!response.ok) {
    throw new Error(`Failed to load document (${response.status})`);
  }
  const declaredLength = Number(response.headers.get('content-length') || 0);
  if (declaredLength > maxBytes) {
    const err = new Error('File is too large to preview in chat');
    err.code = 'TOO_LARGE';
    throw err;
  }
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > maxBytes) {
    const err = new Error('File is too large to preview in chat');
    err.code = 'TOO_LARGE';
    throw err;
  }
  const isPdf = hasPdfMagic(new Uint8Array(buffer.slice(0, 5)));
  const blob = new Blob([buffer], {
    type: isPdf ? 'application/pdf' : (response.headers.get('content-type') || 'application/octet-stream'),
  });
  return {
    blobUrl: URL.createObjectURL(blob),
    isPdf,
  };
}

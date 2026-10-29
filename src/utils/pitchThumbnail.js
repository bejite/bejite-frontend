const CLOUDINARY_VIDEO_UPLOAD_RE =
  /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/)(.+)$/i;

const VIDEO_EXT_RE = /\.(mp4|webm|mov|m4v|ogv|avi|mkv)(\?.*)?$/i;

function isCloudinaryTransformSegment(segment) {
  if (!segment) return false;
  if (segment.includes(",")) return true;
  return /^(?:so|eo|c|w|h|f|q|g|ar|dpr|e|t|ac|vc|br|du)_/i.test(segment);
}

function ensureJpgExtension(assetPath) {
  if (VIDEO_EXT_RE.test(assetPath)) {
    return assetPath.replace(VIDEO_EXT_RE, ".jpg$2");
  }
  if (!/\.[a-z0-9]{2,5}(\?.*)?$/i.test(assetPath)) {
    return `${assetPath}.jpg`;
  }
  return assetPath;
}

function extractPreferredStartOffset(transformSegment) {
  if (!transformSegment) return "so_auto";
  const match = transformSegment.match(/(?:^|,)so_([^,/]+)/i);
  if (!match) return "so_auto";
  const rawOffset = match[1].trim();
  if (rawOffset === "0" || rawOffset === "0.0" || rawOffset === "0s") {
    return "so_auto";
  }
  return `so_${rawOffset}`;
}

/**
 * Normalizes or derives a non-black Cloudinary video frame URL.
 * - mode "og": 1200x630 landscape social preview frame
 * - mode "poster": 360x640 vertical 9:16 video poster frame
 * - mode "upload": upgrades `so_0` -> `so_auto` while keeping dimensions
 */
export function upgradePitchThumbnailUrl(
  thumbnailUrl,
  videoUrl = null,
  { mode = "poster" } = {}
) {
  const candidate =
    thumbnailUrl && !/\.svg(\?|$)/i.test(String(thumbnailUrl).trim())
      ? String(thumbnailUrl).trim()
      : "";

  const source =
    (candidate && CLOUDINARY_VIDEO_UPLOAD_RE.test(candidate) ? candidate : "") ||
    (!candidate && videoUrl && CLOUDINARY_VIDEO_UPLOAD_RE.test(String(videoUrl).trim())
      ? String(videoUrl).trim()
      : "");

  if (!source) {
    return candidate || null;
  }

  const match = source.match(CLOUDINARY_VIDEO_UPLOAD_RE);
  if (!match) return candidate || null;

  const [, prefix, rest] = match;
  const segments = rest.split("/");
  const hasTransform = isCloudinaryTransformSegment(segments[0]);
  const existingTransform = hasTransform ? segments[0] : "";
  const assetPath = ensureJpgExtension(
    (hasTransform ? segments.slice(1) : segments).join("/")
  );
  const startOffset = extractPreferredStartOffset(existingTransform);

  if (mode === "og") {
    return `${prefix}c_fill,g_auto,h_630,${startOffset},w_1200/${assetPath}`;
  }

  if (mode === "upload") {
    if (existingTransform) {
      const updatedTransform = /(?:^|,)so_0(?:\.0)?s?(?=,|$)/i.test(existingTransform)
        ? existingTransform.replace(/(^|,)so_0(?:\.0)?s?(?=,|$)/i, `$1${startOffset}`)
        : existingTransform;
      return `${prefix}${updatedTransform}/${assetPath}`;
    }
    return `${prefix}c_fill,g_auto,h_640,${startOffset},w_360/${assetPath}`;
  }

  return `${prefix}c_fill,g_auto,h_640,${startOffset},w_360/${assetPath}`;
}

export function resolvePitchPosterUrl(pitch) {
  if (!pitch) return undefined;
  return (
    upgradePitchThumbnailUrl(
      pitch.videoPoster || pitch.videoThumbnailUrl || pitch.thumbnailUrl,
      pitch.videoUrl,
      { mode: "poster" }
    ) || undefined
  );
}


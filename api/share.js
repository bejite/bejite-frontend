/**
 * Vercel Serverless Function: serves Open Graph / Twitter Card HTML for shared
 * Bejite resources (/v/:pitchId, /p/:postId, /j/:jobId, /a/:campaignId, and
 * crawler requests to /pitch?id=:pitchId).
 */

const ALLOWED_TYPES = new Set(["pitch", "post", "job", "ad"]);

const CRAWLER_UA_RE =
  /whatsapp|facebookexternalhit|facebot|meta-externalagent|twitterbot|linkedinbot|slackbot|slack-imgproxy|telegrambot|discordbot|pinterest|skypeuripreview|vkshare|redditbot|embedly|iframely|quora link preview|outbrain|w3c_validator|applebot|googlebot|bingbot|yandex|baiduspider|duckduckbot/i;

const CLOUDINARY_VIDEO_UPLOAD_RE =
  /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/)(.+)$/i;

const VIDEO_EXT_RE = /\.(mp4|webm|mov|m4v|ogv|avi|mkv)(\?.*)?$/i;

function decodeHtmlEntities(str) {
  if (!str) return "";
  return String(str)
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function extractMetaContent(html, attrName, attrValue) {
  const escaped = attrValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(
      `<meta[^>]+${attrName}=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+${attrName}=["']${escaped}["'][^>]*>`,
      "i"
    ),
  ];

  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1] != null) {
      return decodeHtmlEntities(m[1]).trim();
    }
  }
  return "";
}

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? decodeHtmlEntities(m[1]).replace(/\s+/g, " ").trim() : "";
}

function isCloudinaryTransformSegment(segment) {
  if (!segment) return false;
  if (segment.includes(",")) return true;
  return /^(?:so|eo|c|w|h|f|q|g|ar|dpr|e|t|ac|vc|br|du)_/i.test(segment);
}

function upgradeCloudinaryOgImage(url) {
  const match = String(url || "").trim().match(CLOUDINARY_VIDEO_UPLOAD_RE);
  if (!match) return url;

  const [, prefix, rest] = match;
  const segments = rest.split("/");
  const hasTransform = isCloudinaryTransformSegment(segments[0]);
  const existingTransform = hasTransform ? segments[0] : "";
  let assetPath = (hasTransform ? segments.slice(1) : segments).join("/");

  if (VIDEO_EXT_RE.test(assetPath)) {
    assetPath = assetPath.replace(VIDEO_EXT_RE, ".jpg$2");
  } else if (!/\.[a-z0-9]{2,5}(\?.*)?$/i.test(assetPath)) {
    assetPath = `${assetPath}.jpg`;
  }

  const soMatch = existingTransform.match(/(?:^|,)so_([^,/]+)/i);
  const rawOffset = soMatch ? soMatch[1].trim() : "";
  const startOffset =
    !rawOffset || rawOffset === "0" || rawOffset === "0.0" || rawOffset === "0s"
      ? "so_auto"
      : `so_${rawOffset}`;

  return `${prefix}c_fill,g_auto,h_630,${startOffset},w_1200/${assetPath}`;
}

function resolveOrigin(req) {
  const rawHost = String(
    req.headers["x-forwarded-host"] || req.headers.host || "bejite.com"
  )
    .split(",")[0]
    .trim();

  const normalizedHost =
    rawHost.toLowerCase() === "www.bejite.com" ? "bejite.com" : rawHost;

  const isLocal =
    normalizedHost.startsWith("localhost") ||
    normalizedHost.startsWith("127.0.0.1");

  const proto = String(
    req.headers["x-forwarded-proto"] || (isLocal ? "http" : "https")
  )
    .split(",")[0]
    .trim();

  return `${proto}://${normalizedHost}`;
}

function resolvePublicShareUrl(origin, type, encodedId, from) {
  if (type === "pitch") {
    if (from === "pitch") return `${origin}/pitch?id=${encodedId}`;
    if (from === "pitches") return `${origin}/pitches?id=${encodedId}`;
    return `${origin}/v/${encodedId}`;
  }
  if (type === "post") return `${origin}/p/${encodedId}`;
  if (type === "job") return `${origin}/j/${encodedId}`;
  if (type === "ad") return `${origin}/a/${encodedId}`;
  return origin;
}

function resolveAppTargetPath(type, encodedId) {
  if (type === "pitch") return `/pitch?id=${encodedId}`;
  if (type === "post") return `/post/${encodedId}`;
  if (type === "job") return `/job-vacancy?jobId=${encodedId}`;
  if (type === "ad") return `/adpro/campaign/${encodedId}`;
  return "/";
}

function normalizeOgImage(rawImage, { origin, apiBase }) {
  const fallback = `${origin}/og-default.png`;
  if (!rawImage) return fallback;

  let img = String(rawImage).trim();
  if (!img || /\.svg(\?|$)/i.test(img)) {
    return fallback;
  }

  if (img.startsWith("/uploads/")) {
    img = `${apiBase}${img}`;
  } else if (img.startsWith("/")) {
    img = `${origin}${img}`;
  } else if (img.startsWith("https://www.bejite.com/")) {
    const subPath = img.slice("https://www.bejite.com/".length);
    if (/\.svg(\?|$)/i.test(subPath)) return fallback;
    img = `${origin}/${subPath}`;
  }

  return upgradeCloudinaryOgImage(img);
}

function inferImageMimeType(imageUrl) {
  if (/\.png(\?|$)/i.test(imageUrl)) return "image/png";
  if (/\.webp(\?|$)/i.test(imageUrl)) return "image/webp";
  if (/\.gif(\?|$)/i.test(imageUrl)) return "image/gif";
  return "image/jpeg";
}

function getDefaultMeta(type) {
  if (type === "pitch") {
    return {
      title: "Bejite Pitch — Watch Talent & Opportunity Pitches",
      description:
        "Discover professionals, opportunities, services, and ideas through short pitches on Bejite.",
    };
  }
  if (type === "job") {
    return {
      title: "Job Opportunity on Bejite",
      description: "Explore job vacancies and connect with recruiters on Bejite.",
    };
  }
  if (type === "ad") {
    return {
      title: "Featured Campaign on Bejite",
      description: "Discover featured opportunities and campaigns on Bejite.",
    };
  }
  return {
    title: "Bejite",
    description:
      "Bejite — connect job seekers and recruiters. Discover opportunities, share posts, and grow your network.",
  };
}

export default async function handler(req, res, options = {}) {
  const rawType = String(req.query?.type || "pitch").trim().toLowerCase();
  const type = ALLOWED_TYPES.has(rawType) ? rawType : "pitch";
  const rawId = String(req.query?.id || "").trim();
  const from = String(req.query?.from || "").trim().toLowerCase();

  if (!rawId) {
    res.statusCode = 302;
    res.setHeader("Location", type === "pitch" ? "/pitch" : "/");
    res.end();
    return;
  }

  const encodedId = encodeURIComponent(rawId);
  const origin = resolveOrigin(req);
  const apiBase = String(
    options.apiBase ||
      process.env.VITE_API_URL ||
      process.env.BACKEND_URL ||
      process.env.API_URL ||
      "https://api.bejite.com"
  )
    .trim()
    .replace(/\/+$/, "");

  const userAgent = String(req.headers["user-agent"] || "");
  const isCrawler = CRAWLER_UA_RE.test(userAgent);
  const publicShareUrl = resolvePublicShareUrl(origin, type, encodedId, from);
  const appTargetPath = resolveAppTargetPath(type, encodedId);
  const appTargetUrl = `${origin}${appTargetPath}`;

  const defaults = getDefaultMeta(type);
  let title = defaults.title;
  let description = defaults.description;
  let rawImage = "";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const upstream = await fetch(`${apiBase}/share/${type}/${encodedId}`, {
      headers: {
        "User-Agent": "WhatsApp/2.23.20.0",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
    });

    if (upstream.ok) {
      const upstreamHtml = await upstream.text();
      title =
        extractMetaContent(upstreamHtml, "property", "og:title") ||
        extractMetaContent(upstreamHtml, "name", "twitter:title") ||
        extractTitle(upstreamHtml) ||
        defaults.title;

      description =
        extractMetaContent(upstreamHtml, "property", "og:description") ||
        extractMetaContent(upstreamHtml, "name", "twitter:description") ||
        extractMetaContent(upstreamHtml, "name", "description") ||
        defaults.description;

      rawImage =
        extractMetaContent(upstreamHtml, "property", "og:image") ||
        extractMetaContent(upstreamHtml, "name", "twitter:image") ||
        "";
    }
  } catch (error) {
    console.error(`Share preview fetch failed (${type}/${rawId}):`, error?.message || error);
  } finally {
    clearTimeout(timeout);
  }

  const ogImage = normalizeOgImage(rawImage, { origin, apiBase });
  const ogImageMime = inferImageMimeType(ogImage);
  const shouldAutoRedirect = !isCrawler && !from;

  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImage = escapeHtml(ogImage);
  const safeShareUrl = escapeHtml(publicShareUrl);
  const safeTargetUrl = escapeHtml(appTargetUrl);

  const redirectScript = shouldAutoRedirect
    ? `\n  <script>window.location.replace(${JSON.stringify(appTargetPath)});</script>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}" />
  <link rel="canonical" href="${safeShareUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Bejite" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:url" content="${safeShareUrl}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />
  <meta property="og:image" content="${safeImage}" />
  <meta property="og:image:secure_url" content="${safeImage}" />
  <meta property="og:image:type" content="${ogImageMime}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${safeTitle}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@bejite" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <meta name="twitter:image" content="${safeImage}" />
  <meta name="twitter:image:alt" content="${safeTitle}" />${redirectScript}
</head>
<body>
  <p><a href="${safeTargetUrl}">View on Bejite</a></p>
</body>
</html>`;

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.setHeader("Vary", "User-Agent");
  res.end(html);
}

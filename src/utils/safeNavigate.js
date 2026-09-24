/**
 * Safe navigation helpers — prevent open redirects off trusted Bejite hosts.
 */

const ALLOWED_HOST_SUFFIXES = [
  "bejite.com",
  "bejite-frontend.vercel.app",
  "localhost",
  "127.0.0.1",
];

function isAllowedHost(hostname) {
  const host = String(hostname || "").toLowerCase();
  return ALLOWED_HOST_SUFFIXES.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`),
  );
}

/**
 * @param {string} pathOrUrl
 * @returns {{ kind: 'internal', path: string } | { kind: 'external', url: string } | { kind: 'reject' }}
 */
export function classifyNavigationTarget(pathOrUrl) {
  const raw = String(pathOrUrl || "").trim();
  if (!raw) return { kind: "reject" };

  if (raw.startsWith("/") && !raw.startsWith("//")) {
    return { kind: "internal", path: raw };
  }

  try {
    const url = new URL(raw, window.location.origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { kind: "reject" };
    }
    if (url.origin === window.location.origin) {
      return { kind: "internal", path: `${url.pathname}${url.search}${url.hash}` };
    }
    if (isAllowedHost(url.hostname)) {
      return { kind: "external", url: url.toString() };
    }
    return { kind: "reject" };
  } catch {
    return { kind: "reject" };
  }
}

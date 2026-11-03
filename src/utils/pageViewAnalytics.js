import { API_URL } from "../config.mjs";

const SESSION_KEY = "bejite_pv_sid";
const MAX_BATCH = 20;
const FLUSH_MS = 4000;
const DEDUPE_MS = 800;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NUMERIC_ID_RE = /^\d+$/;
const SHORT_TOKEN_RE = /^[A-Za-z0-9_-]{10,}$/;

/**
 * Keep in sync with bejite-backend `pageViewEvents.js` FEATURE_RULES.
 * Server re-derives feature from path; client tags are advisory only.
 */
const FEATURE_RULES = [
  [/^\/admin(\/|$)/i, null],
  [/^\/(news-feed|post-page)(\/|$)/i, "news_feed"],
  [/^\/post(\/|$)/i, "news_feed"],
  [/^\/p(\/|$)/i, "news_feed"],
  [/^\/pitch(es)?(\/|$)/i, "pitches"],
  [/^\/v(\/|$)/i, "pitches"],
  [/^\/job-vacancy(\/|$)/i, "job_board"],
  [/^\/j(\/|$)/i, "job_board"],
  [/^\/(chats|messages)(\/|$)/i, "messaging"],
  [/^\/candidate-search-page(\/|$)/i, "ase_search"],
  [/^\/employer\/recruitment-management(\/|$)/i, "recruitment"],
  [/^\/employer(\/|$)/i, "employer_dashboard"],
  [/^\/ad-?pro(\/|$)/i, "adpro"],
  [/^\/a(\/|$)/i, "adpro"],
  [/^\/(user-profile|profile)(\/|$)/i, "profile"],
  [/^\/connection(\/|$)/i, "connections"],
  [/^\/milestones(\/|$)/i, "milestones"],
  [/^\/notifications?(\/|$)/i, "notifications"],
  [/^\/badge(\/|$)/i, "badge"],
  [/^\/activity-logs?(\/|$)/i, "activity"],
  [/^\/account-settings(\/|$)/i, "account"],
  [
    /^\/(resume|bio|education|skills|job-type|work-history|certificate|links)(\/|$)/i,
    "cv_builder",
  ],
  [
    /^\/(jobseeker-option|employer-option|jobconnection|save-progress|individual|corporate|edit-profile)(\/|$)/i,
    "onboarding",
  ],
  [/^\/(payment|add-card|subscription|ase)(\/|$|-)/i, "payments"],
  [
    /^\/(about|teams|security-advice|privacy-policy|contact|help)(\/|$)/i,
    "marketing",
  ],
  [
    /^\/(signup|signin|login|forgot-password|email-check|signup-role|confirmpassword|reset-password|complete-signup|auth)(\/|$)/i,
    "auth",
  ],
  [/^\/$/, "auth"],
];

let queue = [];
let flushTimer = null;
let lastTracked = { path: "", at: 0 };
let lastAuthToken = null;
let listenersBound = false;

function randomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 32);
  }
  return `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

export function getPageViewSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id || id.length < 8) {
      id = randomId();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return randomId();
  }
}

/**
 * Normalize a browser pathname into a stable route pattern.
 * `/post/abc-uuid` → `/post/:id`
 */
export function normalizePagePath(pathname) {
  const raw = String(pathname || "/").split("?")[0].split("#")[0] || "/";
  const cleaned = raw.replace(/\/{2,}/g, "/");
  const parts = cleaned.split("/").map((segment) => {
    if (!segment) return segment;
    if (segment === ":id") return segment;
    if (UUID_RE.test(segment) || NUMERIC_ID_RE.test(segment)) return ":id";
    if (SHORT_TOKEN_RE.test(segment) && /[0-9]/.test(segment)) return ":id";
    return segment;
  });
  let path = parts.join("/") || "/";
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path.slice(0, 200);
}

export function resolvePageFeature(normalizedPath) {
  const path = normalizedPath || "/";
  for (const [re, feature] of FEATURE_RULES) {
    if (re.test(path)) return feature;
  }
  return "other";
}

function readAuthToken() {
  try {
    return (
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken") ||
      null
    );
  } catch {
    return null;
  }
}

function authHeader(tokenOverride) {
  const token =
    tokenOverride === undefined ? readAuthToken() : tokenOverride;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function analyticsUrl() {
  const base = String(API_URL || "").replace(/\/+$/, "");
  return `${base}/api/analytics/page-views`;
}

function takeQueue(max = MAX_BATCH) {
  if (queue.length === 0) return [];
  return queue.splice(0, max);
}

async function postEvents(
  events,
  { keepalive = false, authTokenOverride } = {},
) {
  if (!events.length) return;

  try {
    const response = await fetch(analyticsUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(authTokenOverride),
      },
      body: JSON.stringify({
        sessionId: getPageViewSessionId(),
        events,
      }),
      credentials: "include",
      keepalive,
    });

    if (!response.ok && response.status >= 500) {
      throw new Error(`page-views ${response.status}`);
    }
  } catch {
    // Drop on failure — analytics must never break the app.
  }
}

/**
 * When auth changes, take the current queue synchronously and send it with the
 * *previous* token so attribution does not flip mid-batch.
 */
function flushOnAuthBoundary() {
  const token = readAuthToken();
  if (lastAuthToken === null) {
    lastAuthToken = token;
    return;
  }
  if (token === lastAuthToken) return;

  const previousToken = lastAuthToken;
  lastAuthToken = token;

  if (flushTimer != null) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  const pending = takeQueue(queue.length);
  if (pending.length === 0) return;
  void postEvents(pending, { authTokenOverride: previousToken });
}

function scheduleFlush() {
  if (flushTimer != null) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushPageViews();
  }, FLUSH_MS);
}

export async function flushPageViews({
  keepalive = false,
  authTokenOverride,
} = {}) {
  const events = takeQueue(MAX_BATCH);
  if (events.length === 0) return;

  await postEvents(events, { keepalive, authTokenOverride });

  if (queue.length > 0) scheduleFlush();
}

/**
 * Queue a route view. No-ops for excluded features / rapid duplicates.
 */
export function trackPageView(pathname) {
  const path = normalizePagePath(pathname);
  const feature = resolvePageFeature(path);
  if (!feature) return;

  flushOnAuthBoundary();

  const now = Date.now();
  if (path === lastTracked.path && now - lastTracked.at < DEDUPE_MS) return;
  lastTracked = { path, at: now };

  queue.push({ path, feature });
  if (queue.length >= MAX_BATCH) {
    if (flushTimer != null) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    void flushPageViews();
    return;
  }
  scheduleFlush();
}

function onVisibilityOrUnload() {
  if (flushTimer != null) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  // fetch + keepalive keeps Authorization; sendBeacon cannot.
  const pending = takeQueue(queue.length);
  void postEvents(pending, { keepalive: true });
}

export function bindPageViewLifecycle() {
  if (listenersBound || typeof window === "undefined") return;
  listenersBound = true;
  lastAuthToken = readAuthToken();

  window.addEventListener("pagehide", onVisibilityOrUnload);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") onVisibilityOrUnload();
  });

  window.addEventListener("storage", (event) => {
    if (event.key === "accessToken" || event.key === "authToken") {
      flushOnAuthBoundary();
    }
  });
}

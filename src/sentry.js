import * as Sentry from "@sentry/react";

const dsn = import.meta.env.VITE_SENTRY_DSN;
const WINDOW_MS = 60_000;
const MAX_EVENTS_PER_WINDOW = 8;
const sentAt = [];

function withinQuota() {
  const now = Date.now();
  while (sentAt.length && now - sentAt[0] > WINDOW_MS) sentAt.shift();
  if (sentAt.length >= MAX_EVENTS_PER_WINDOW) return false;
  sentAt.push(now);
  return true;
}

function eventText(event, hint) {
  const exception = event?.exception?.values?.[0]?.value || "";
  const message = event?.message || hint?.originalException?.message || "";
  const extra = [
    event?.request?.url,
    ...(event?.exception?.values || []).flatMap((value) =>
      (value?.stacktrace?.frames || []).map((frame) => frame?.filename),
    ),
  ]
    .filter(Boolean)
    .join(" ");
  return `${exception} ${message} ${extra}`;
}

function isGlitchtipNoise(text) {
  return /app\.glitchtip\.com/i.test(text);
}

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: import.meta.env.MODE,
  tracesSampleRate: 0,
  ignoreErrors: [/Mixed Content/i, /ResizeObserver loop/i],
  denyUrls: [/app\.glitchtip\.com/i, /^chrome:\/\//i, /^chrome-extension:\/\//i],
  beforeBreadcrumb(breadcrumb) {
    const message = String(breadcrumb?.message || "");
    const url = String(breadcrumb?.data?.url || breadcrumb?.data?.to || "");
    if (/mixed content/i.test(message)) return null;
    if (isGlitchtipNoise(`${message} ${url}`)) return null;
    return breadcrumb;
  },
  beforeSend(event, hint) {
    const text = eventText(event, hint);
    if (/mixed content/i.test(text)) return null;
    if (isGlitchtipNoise(text)) return null;
    if (!withinQuota()) return null;
    return event;
  },
});

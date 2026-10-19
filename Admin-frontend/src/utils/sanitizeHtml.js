import DOMPurify from "dompurify";

const DEFAULT_CONFIG = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input", "link"],
  FORBID_ATTR: ["onerror", "onload", "onclick"],
};

export function sanitizeHtml(dirty) {
  if (!dirty || typeof dirty !== "string") return "";
  return DOMPurify.sanitize(dirty, DEFAULT_CONFIG);
}

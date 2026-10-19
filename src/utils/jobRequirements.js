/**
 * Repair requirement bullets that were stored after splitting on commas.
 * New jobs are saved one-per-line; this only rejoins obvious fragments.
 */

const FRAGMENT_START = /^(and|or|nor)\b/i;
const NEW_ITEM_START =
  /^(experience|experiences|strong|good|excellent|solid|proven|familiarity|familiar|bachelor(?:'s)?|master(?:'s)?|phd|must|ability|able|minimum|knowledge|degree|proficiency|understanding|willingness|willing|previous|prior|comfortable|hands-on|working|work\b|demonstrated|advanced|basic|intermediate|expert|you\b|the\s+ideal|candidates?|applicants?|required|preferred|plus\b)/i;

function trimItem(value) {
  return String(value || "")
    .replace(/^[-•*]\s*/, "")
    .trim();
}

function endsSentence(text) {
  return /[.!?]["')\]]*$/.test(String(text || "").trim());
}

function looksLikeFragment(item) {
  const text = String(item || "").trim();
  if (!text) return false;
  if (/^[a-z]/.test(text)) return true;
  if (FRAGMENT_START.test(text)) return true;
  return false;
}

function shouldJoin(prev, item) {
  if (endsSentence(prev)) return false;
  if (looksLikeFragment(item)) return true;
  if (!/\s/.test(item)) return true;
  const wordCount = item.split(/\s+/).length;
  return wordCount <= 8 && !NEW_ITEM_START.test(item);
}

export function formatStoredRequirements(value) {
  const items = Array.isArray(value)
    ? value
        .filter((item) => typeof item === "string")
        .map(trimItem)
        .filter(Boolean)
    : [];

  if (items.length <= 1) return items;
  if (!items.some(looksLikeFragment)) return items;

  const merged = [];
  for (const item of items) {
    if (merged.length && shouldJoin(merged[merged.length - 1], item)) {
      merged[merged.length - 1] = `${merged[merged.length - 1]}, ${item}`;
    } else {
      merged.push(item);
    }
  }
  return merged;
}

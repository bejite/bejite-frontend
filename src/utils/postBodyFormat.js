export const LABELED_MENTION_RE =
  /@\[([^\]]{1,80})\]\(([A-Za-z0-9_-]{1,64})\)/g;

const MENTION_CHIP_STYLE =
  "color:#16730F;font-weight:600;background:#EAF6E8;border-radius:4px;padding:0 3px;user-select:none";

const TOKEN_RE = new RegExp(
  `(?<labeled>@\\[(?<label>[^\\]]{1,80})\\]\\((?<userId>[A-Za-z0-9_-]{1,64})\\))` +
    `|(?<boldDouble>\\*\\*(?<boldDoubleInner>[^*]+)\\*\\*)` +
    `|(?<italicDouble>__(?<italicDoubleInner>[^_]+)__)` +
    `|(?<bold>\\*(?<boldInner>[^*\\n]+)\\*)` +
    `|(?<italic>(?:^|[^a-zA-Z0-9])_(?<italicInner>[^_\\n]{1,200})_(?![a-zA-Z0-9]))` +
    `|(?<url>https?:\\/\\/[^\\s<]+)` +
    `|(?<mention>(?:^|[^a-zA-Z0-9_])@(?<handle>[a-zA-Z0-9._'-]{2,40})(?![a-zA-Z0-9._'-]))` +
    `|(?<hashtag>(?:^|[^a-zA-Z0-9_])#(?<tag>[a-zA-Z0-9_]{2,40}))`,
  "g",
);

function decodeHtml(value) {
  return String(value)
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function parsePostBody(text) {
  if (!text) return [];

  const tokens = [];
  let lastIndex = 0;
  const re = new RegExp(TOKEN_RE.source, "g");
  let match;

  while ((match = re.exec(text)) !== null) {
    const g = match.groups || {};
    if (match.index > lastIndex) {
      tokens.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }

    if (g.userId) {
      tokens.push({
        type: "mention",
        content: g.label,
        userId: g.userId,
        label: g.label,
      });
    } else if (g.boldDoubleInner != null) {
      tokens.push({ type: "bold", children: parsePostBody(g.boldDoubleInner) });
    } else if (g.italicDoubleInner != null) {
      tokens.push({ type: "italic", children: parsePostBody(g.italicDoubleInner) });
    } else if (g.boldInner != null) {
      tokens.push({ type: "bold", children: parsePostBody(g.boldInner) });
    } else if (g.italicInner != null) {
      const raw = g.italic || "";
      const prefix = raw.slice(0, raw.length - g.italicInner.length - 2);
      if (prefix) tokens.push({ type: "text", content: prefix });
      tokens.push({ type: "italic", children: parsePostBody(g.italicInner) });
    } else if (g.url) {
      tokens.push({ type: "link", content: g.url });
    } else if (g.handle) {
      const raw = g.mention || "";
      const prefix = raw.slice(0, raw.length - g.handle.length - 1);
      if (prefix) tokens.push({ type: "text", content: prefix });
      tokens.push({ type: "mention", content: g.handle });
    } else if (g.tag) {
      const raw = g.hashtag || "";
      const prefix = raw.slice(0, raw.length - g.tag.length - 1);
      if (prefix) tokens.push({ type: "text", content: prefix });
      tokens.push({ type: "hashtag", content: g.tag });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: "text", content: text.slice(lastIndex) });
  }

  return tokens;
}

export function tokenVisibleLength(token) {
  if (!token) return 0;
  if (token.type === "bold" || token.type === "italic") {
    return (token.children || []).reduce(
      (sum, child) => sum + tokenVisibleLength(child),
      0,
    );
  }
  if (token.type === "mention") {
    return 1 + String(token.label || token.content || "").length;
  }
  if (token.type === "hashtag") {
    return 1 + String(token.content || "").length;
  }
  return String(token.content || "").length;
}

export function truncatePostBody(text, maxChars) {
  const source = text || "";
  if (!maxChars || source.length === 0) {
    return { tokens: parsePostBody(source), truncated: false };
  }

  const tokens = parsePostBody(source);
  const total = tokens.reduce((sum, token) => sum + tokenVisibleLength(token), 0);
  if (total <= maxChars) {
    return { tokens, truncated: false };
  }

  const kept = [];
  let used = 0;
  for (const token of tokens) {
    const len = tokenVisibleLength(token);
    if (used + len <= maxChars) {
      kept.push(token);
      used += len;
      continue;
    }
    if (token.type === "text" && maxChars > used) {
      kept.push({
        type: "text",
        content: String(token.content || "").slice(0, maxChars - used),
      });
    }
    break;
  }

  return { tokens: kept, truncated: true };
}

export function htmlToMarkdown(html) {
  if (!html) return "";

  const withBreaks = String(html)
    .replace(/<div><br\s*\/?><\/div>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<div[^>]*>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<(strong|b)[^>]*>/gi, "*")
    .replace(/<\/(strong|b)>/gi, "*")
    .replace(/<(em|i)[^>]*>/gi, "_")
    .replace(/<\/(em|i)>/gi, "_")
    .replace(/<[^>]+>/g, "");

  return decodeHtml(withBreaks).replace(/^\n+/, "").replace(/\n+$/, "");
}

export function formatLabeledMention(label, userId) {
  const safeLabel = String(label || "User")
    .replace(/[[\]]/g, "")
    .trim() || "User";
  const id = String(userId || "").trim();
  if (!id) return `@${safeLabel}`;
  return `@[${safeLabel}](${id})`;
}

export function extractLabeledMentions(text) {
  const out = [];
  const re = new RegExp(LABELED_MENTION_RE.source, "g");
  let match;
  while ((match = re.exec(String(text || ""))) !== null) {
    out.push({ label: match[1], id: match[2] });
  }
  return out;
}

export function extractMentionedUserIds(text) {
  return extractLabeledMentions(text).map((mention) => mention.id).filter(Boolean);
}

export function toComposerDisplay(stored) {
  return String(stored || "").replace(
    new RegExp(LABELED_MENTION_RE.source, "g"),
    "@$1",
  );
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function fromComposerDisplay(display, previousStored, extraMentions = []) {
  const mentions = [
    ...extractLabeledMentions(previousStored),
    ...extractLabeledMentions(display),
    ...(Array.isArray(extraMentions) ? extraMentions : []),
  ];
  const byId = new Map();
  for (const mention of mentions) {
    const label = String(mention.label || "").trim();
    const id = String(mention.id || "").trim();
    if (!label || !id) continue;
    byId.set(id, { label, id });
  }
  const labels = [...byId.values()].sort((a, b) => b.label.length - a.label.length);

  let result = String(display || "");
  for (const { label, id } of labels) {
    const pattern = new RegExp(`@${escapeRegExp(label)}(?![\\w'\\[-])`, "gi");
    result = result.replace(pattern, formatLabeledMention(label, id));
  }
  return result;
}

export function bodyToMentionEditorHtml(text) {
  const source = String(text || "");
  let html = "";
  let lastIndex = 0;
  const re = new RegExp(LABELED_MENTION_RE.source, "g");
  let match;
  while ((match = re.exec(source)) !== null) {
    html += escapeHtml(source.slice(lastIndex, match.index)).replace(/\n/g, "<br>");
    html += `<span class="bejite-mention" data-user-id="${escapeHtml(match[2])}" contenteditable="false" style="${MENTION_CHIP_STYLE}">@${escapeHtml(match[1])}</span>`;
    lastIndex = match.index + match[0].length;
  }
  html += escapeHtml(source.slice(lastIndex)).replace(/\n/g, "<br>");
  return html;
}

export function mentionEditorHtmlToBody(html) {
  return decodeHtml(
    String(html || "")
      .replace(
        /<span[^>]*data-user-id="([^"]+)"[^>]*>@?([^<]*)<\/span>/gi,
        (_, id, label) => formatLabeledMention(decodeHtml(label), decodeHtml(id)),
      )
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<div[^>]*>/gi, "")
      .replace(/<p[^>]*>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\u00a0/g, " "),
  );
}

export function markdownToEditorHtml(text) {
  const escaped = escapeHtml(text || "");
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<em>$1</em>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}

export function getActiveComposeToken(text, caret) {
  const source = String(text || "");
  const clamped = Math.max(0, Math.min(caret ?? source.length, source.length));
  const before = source.slice(0, clamped).replace(/[\n\r\u200B]+$/, "");
  const mention = before.match(
    /(^|[^a-zA-Z0-9_])@([a-zA-Z0-9._'-]*(?: [a-zA-Z0-9._'-]*){0,3})$/,
  );
  if (mention) {
    return {
      type: "mention",
      query: mention[2],
      start: before.length - mention[2].length - 1,
    };
  }
  const hashtag = before.match(/(^|[^a-zA-Z0-9_])#([a-zA-Z0-9_]{0,40})$/);
  if (hashtag) {
    return {
      type: "hashtag",
      query: hashtag[2],
      start: before.length - hashtag[2].length - 1,
    };
  }
  return null;
}

export function replaceComposeToken(text, caret, tokenStart, insertion) {
  const source = String(text || "");
  const after = source.slice(Math.max(0, caret)).replace(/^[a-zA-Z0-9._'-]*/, "");
  const next = `${source.slice(0, tokenStart)}${insertion}${after}`;
  return { next, caret: tokenStart + insertion.length };
}

export function replaceActiveMentionToken(text, caret, query, insertion) {
  const source = String(text || "");
  const caretAt = Math.max(0, Math.min(caret ?? source.length, source.length));
  const left = source.slice(0, caretAt);
  const right = source.slice(caretAt);
  const token = getActiveComposeToken(left, left.length);
  if (token?.type === "mention") {
    return {
      next: `${left.slice(0, token.start)}${insertion}${right}`,
      caret: token.start + String(insertion).length,
    };
  }

  const suffix = `@${query || ""}`;
  if (suffix.length > 0) {
    const idx = left.toLowerCase().lastIndexOf(suffix.toLowerCase());
    if (idx >= 0) {
      return {
        next: `${left.slice(0, idx)}${insertion}${left.slice(idx + suffix.length)}${right}`,
        caret: idx + String(insertion).length,
      };
    }
  }

  return {
    next: `${left}${insertion}${right}`,
    caret: left.length + String(insertion).length,
  };
}

export function normalizeHashtag(value) {
  return String(value || "")
    .trim()
    .replace(/^#+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 40);
}

export function extractHashtags(text) {
  const tags = new Set();
  for (const token of parsePostBody(text)) {
    collectHashtags(token, tags);
  }
  return [...tags];
}

function collectHashtags(token, tags) {
  if (token.type === "hashtag") {
    tags.add(String(token.content || "").toLowerCase());
  }
  if (Array.isArray(token.children)) {
    token.children.forEach((child) => collectHashtags(child, tags));
  }
}

export function mentionSearchFields(user) {
  if (!user || typeof user !== "object") return [];
  return [
    user.username,
    user.nickname,
    user.handle,
    user.firstName,
    user.lastName,
    `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    user.company_name || user.companyName,
  ]
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean);
}

export function mentionMatchScore(user, query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return 0;
  const username = String(user?.username || "").toLowerCase();
  const nickname = String(user?.nickname || "").toLowerCase();
  const handle = String(user?.handle || "").toLowerCase();
  const firstName = String(user?.firstName || "").toLowerCase();
  const lastName = String(user?.lastName || "").toLowerCase();
  const fullName = `${firstName} ${lastName}`.trim();
  const company = String(user?.company_name || user?.companyName || "").toLowerCase();

  if (username === q || handle === q) return 0;
  if (nickname === q) return 1;
  if (username.startsWith(q) || handle.startsWith(q)) return 2;
  if (nickname.startsWith(q)) return 3;
  if (firstName.startsWith(q)) return 4;
  if (lastName.startsWith(q)) return 5;
  if (fullName.startsWith(q)) return 6;
  if (company.startsWith(q)) return 7;
  if (mentionSearchFields(user).some((field) => field.includes(q))) return 8;
  return 99;
}

export function rankMentionUsers(users, query) {
  const list = Array.isArray(users) ? users : [];
  const q = String(query || "").trim();
  return list
    .map((user) => ({ user, score: mentionMatchScore(user, q) }))
    .filter((entry) => !q || entry.score < 99)
    .sort((a, b) => {
      const connectedDelta =
        Number(!a.user?.connected) - Number(!b.user?.connected);
      if (connectedDelta !== 0) return connectedDelta;
      return a.score - b.score;
    })
    .map((entry) => entry.user);
}

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { searchMentionSuggestions } from "../services/postsApi";
import { formatDisplayPersonName } from "../utils/personDisplayName";
import {
  formatLabeledMention,
  getActiveComposeToken,
  rankMentionUsers,
  replaceComposeToken,
  toComposerDisplay,
} from "../utils/postBodyFormat";

const SUGGESTION_LIMIT = 12;

export default function useMentionAutocomplete({
  value,
  onChange,
  textareaRef,
  boundaryRef,
  onPick,
} = {}) {
  const listId = useId();
  const listRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [activeToken, setActiveToken] = useState(null);
  const [highlight, setHighlight] = useState(0);
  const cacheRef = useRef([]);

  const dismissSuggestions = useCallback(() => {
    setSuggestions([]);
    setSuggestionsLoading(false);
    setActiveToken(null);
  }, []);

  const refreshToken = useCallback((nextValue, caret) => {
    const token = getActiveComposeToken(nextValue, caret);
    const mention = token?.type === "mention" ? token : null;
    setActiveToken((prev) => {
      if (!mention) return null;
      if (prev && prev.query === mention.query && prev.start === mention.start) {
        return prev;
      }
      return mention;
    });
    if (!mention) {
      setSuggestions([]);
      setSuggestionsLoading(false);
    }
  }, []);

  const mentionQuery =
    activeToken?.type === "mention" ? String(activeToken.query || "") : null;

  useEffect(() => {
    if (mentionQuery === null) return undefined;

    const query = mentionQuery.trim();
    setSuggestions(rankMentionUsers(cacheRef.current, query));
    setHighlight(0);
    setSuggestionsLoading(true);

    const controller = new AbortController();
    let cancelled = false;
    const timer = setTimeout(
      async () => {
        try {
          const users = await searchMentionSuggestions(query, SUGGESTION_LIMIT, {
            signal: controller.signal,
          });
          if (cancelled) return;
          cacheRef.current = users;
          setSuggestions(users);
          setHighlight(0);
        } catch (error) {
          if (!cancelled && error?.name !== "AbortError") {
            setSuggestions([]);
          }
        } finally {
          if (!cancelled) setSuggestionsLoading(false);
        }
      },
      query.length <= 1 ? 0 : 40,
    );

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [mentionQuery]);

  useEffect(() => {
    if (!activeToken) return undefined;

    const onPointerDown = (event) => {
      const target = event.target;
      if (textareaRef?.current?.contains?.(target)) return;
      if (boundaryRef?.current?.contains?.(target)) return;
      if (listRef.current?.contains(target)) return;
      dismissSuggestions();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [activeToken, boundaryRef, dismissSuggestions, textareaRef]);

  const applyMention = useCallback(
    (user) => {
      if (!activeToken || !user) return;
      const handle = String(user.handle || user.username || user.nickname || "")
        .trim()
        .replace(/^@/, "");
      const name = formatDisplayPersonName(user).replace(/[[\]]/g, "").trim();
      const label = name || handle || "User";
      const displayInsertion = `@${label} `;
      const insertion = user.id
        ? `${formatLabeledMention(label, user.id)} `
        : displayInsertion;
      const el = textareaRef?.current;
      const caret = el?.selectionStart ?? String(value || "").length;
      const token = getActiveComposeToken(value || "", caret);
      const start = token?.type === "mention" ? token.start : activeToken.start;
      const { next } = replaceComposeToken(
        value || "",
        caret,
        start,
        insertion,
      );
      const displayNext = toComposerDisplay(next);
      const displayCaret = Math.min(
        start + displayInsertion.length,
        displayNext.length,
      );
      onPick?.({ label, id: user.id || null });
      onChange?.(next);
      dismissSuggestions();
      requestAnimationFrame(() => {
        el?.focus();
        el?.setSelectionRange(displayCaret, displayCaret);
        refreshToken(displayNext, displayCaret);
      });
    },
    [activeToken, dismissSuggestions, onChange, onPick, refreshToken, textareaRef, value],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (!suggestions.length) return false;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((i) => (i + 1) % suggestions.length);
        return true;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((i) => (i - 1 + suggestions.length) % suggestions.length);
        return true;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        applyMention(suggestions[highlight]);
        return true;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        dismissSuggestions();
        return true;
      }
      return false;
    },
    [applyMention, dismissSuggestions, highlight, suggestions],
  );

  const textareaAria = {
    role: "combobox",
    "aria-autocomplete": "list",
    "aria-expanded": suggestions.length > 0 || suggestionsLoading,
    "aria-controls": listId,
    "aria-activedescendant":
      suggestions.length > 0 ? `${listId}-opt-${highlight}` : undefined,
  };

  return {
    suggestions,
    suggestionsLoading,
    highlight,
    activeToken,
    applyMention,
    handleKeyDown,
    refreshToken,
    listRef,
    listId,
    textareaAria,
  };
}

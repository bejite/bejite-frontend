import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";
import useMentionAutocomplete from "../../hooks/useMentionAutocomplete";
import {
  extractLabeledMentions,
  fromComposerDisplay,
  toComposerDisplay,
} from "../../utils/postBodyFormat";
import MentionSuggestionList from "./MentionSuggestionList";

function mergeMentionExtras(current, incoming) {
  const byId = new Map();
  for (const mention of [...(current || []), ...(incoming || [])]) {
    const label = String(mention?.label || "").trim();
    const id = String(mention?.id || "").trim();
    if (!label || !id) continue;
    byId.set(id, { label, id });
  }
  return [...byId.values()];
}

const MentionComposerField = forwardRef(function MentionComposerField(
  {
    value,
    onChange,
    placeholder = "",
    className = "",
    autoFocus = false,
    spellCheck = true,
  },
  ref,
) {
  const wrapRef = useRef(null);
  const textareaRef = useRef(null);
  const extrasRef = useRef(extractLabeledMentions(value));
  const display = toComposerDisplay(value);

  const commitDisplay = useCallback(
    (nextDisplay) => {
      extrasRef.current = mergeMentionExtras(
        extrasRef.current,
        extractLabeledMentions(value),
      );
      const stored = fromComposerDisplay(
        nextDisplay,
        value,
        extrasRef.current,
      );
      extrasRef.current = mergeMentionExtras(
        extrasRef.current,
        extractLabeledMentions(stored),
      );
      onChange?.(stored);
    },
    [onChange, value],
  );

  const {
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
  } = useMentionAutocomplete({
    value: display,
    onChange: commitDisplay,
    textareaRef,
    boundaryRef: wrapRef,
    onPick: (mention) => {
      extrasRef.current = mergeMentionExtras(extrasRef.current, [mention]);
    },
  });

  useImperativeHandle(ref, () => ({
    insertText(text) {
      const el = textareaRef.current;
      const current = display;
      if (!el) {
        commitDisplay(`${current}${text}`);
        return;
      }
      const start = el.selectionStart ?? current.length;
      const end = el.selectionEnd ?? start;
      const next = `${current.slice(0, start)}${text}${current.slice(end)}`;
      commitDisplay(next);
      requestAnimationFrame(() => {
        const caret = start + String(text).length;
        el.focus();
        el.setSelectionRange(caret, caret);
        refreshToken(next, caret);
      });
    },
    focus(options) {
      textareaRef.current?.focus(options);
    },
  }));

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <textarea
        ref={textareaRef}
        value={display}
        placeholder={placeholder}
        autoFocus={autoFocus}
        spellCheck={spellCheck}
        onChange={(e) => {
          const next = e.target.value;
          commitDisplay(next);
          refreshToken(next, e.target.selectionStart);
        }}
        onKeyUp={(e) =>
          refreshToken(e.currentTarget.value, e.currentTarget.selectionStart)
        }
        onClick={(e) =>
          refreshToken(e.currentTarget.value, e.currentTarget.selectionStart)
        }
        onKeyDown={handleKeyDown}
        {...textareaAria}
        className="block w-full h-full min-h-[inherit] bg-transparent outline-none resize-none"
      />
      <MentionSuggestionList
        suggestions={suggestions}
        loading={suggestionsLoading}
        mentionActive={Boolean(activeToken)}
        highlight={highlight}
        onSelect={applyMention}
        anchorRef={wrapRef}
        listRef={listRef}
        listId={listId}
      />
    </div>
  );
});

export default MentionComposerField;

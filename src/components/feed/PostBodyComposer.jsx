import React, { forwardRef, useImperativeHandle, useRef } from "react";
import MentionComposerField from "./MentionComposerField";

const PostBodyComposer = forwardRef(function PostBodyComposer(
  {
    value,
    onChange,
    placeholder = "What do you want to talk about?",
    minHeightClass = "min-h-[150px]",
    className = "",
    autoFocus = false,
    textClassName = "text-base",
    showHint = true,
    toolbar = null,
  },
  ref,
) {
  const fieldRef = useRef(null);

  useImperativeHandle(ref, () => ({
    insertText(text) {
      fieldRef.current?.insertText(text);
    },
    focus(options) {
      fieldRef.current?.focus(options);
    },
  }));

  const fieldClassName = toolbar
    ? `w-full ${minHeightClass} px-3 pt-3 pb-1 ${textClassName}`
    : `w-full ${minHeightClass} p-3 border border-gray-300 rounded-lg focus-within:border-[#16730F] ${textClassName}`;

  return (
    <div className={className}>
      <div
        className={
          toolbar
            ? "rounded-lg border border-gray-300 focus-within:border-[#16730F]"
            : undefined
        }
      >
        <MentionComposerField
          ref={fieldRef}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={fieldClassName}
        />
        {toolbar ? (
          <div className="flex items-center gap-0.5 px-1.5 pb-1.5">{toolbar}</div>
        ) : null}
      </div>
      {showHint && (
        <p className={`mt-1.5 text-xs text-gray-500 ${toolbar ? "hidden sm:block" : ""}`}>
          Use <span className="font-semibold">*bold*</span>,{" "}
          <span className="italic">_italic_</span>,{" "}
          <span className="text-[#16730F]">@name</span>, and{" "}
          <span className="text-[#16730F]">#topic</span>
        </p>
      )}
    </div>
  );
});

export default PostBodyComposer;

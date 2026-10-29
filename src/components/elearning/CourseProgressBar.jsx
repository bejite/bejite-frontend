import React from "react";

/**
 * Reusable E-Learning progress bar with header labels and optional footer metadata.
 */
export default function CourseProgressBar({
  label = "Overall Course Progress",
  percent = 0,
  rightText,
  footer = null,
  trackClassName = "bg-gray-100",
  fillClassName = "bg-[#16730F]",
  heightClassName = "h-2",
  className = "",
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)));
  const resolvedRightText =
    rightText !== undefined ? rightText : `${clamped}% Complete`;

  return (
    <div className={className}>
      {(label || resolvedRightText) && (
        <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
          {label ? <span className="text-gray-800">{label}</span> : <span />}
          {resolvedRightText ? (
            <span className="text-[#16A34A]">{resolvedRightText}</span>
          ) : null}
        </div>
      )}

      <div
        className={`w-full ${heightClassName} rounded-full ${trackClassName} overflow-hidden mt-1.5`}
      >
        <div
          className={`h-full rounded-full ${fillClassName} transition-all duration-300`}
          style={{ width: `${clamped}%` }}
        />
      </div>

      {footer && <div className="mt-2 text-[11px] text-gray-500">{footer}</div>}
    </div>
  );
}


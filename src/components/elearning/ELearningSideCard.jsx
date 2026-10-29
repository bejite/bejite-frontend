import React from "react";

/**
 * Reusable Right-Column Sidebar Card (supports white surface or soft sage note surface).
 */
export default function ELearningSideCard({
  overline = "",
  title = "",
  icon: Icon = null,
  headerBadge = null,
  headerDivider = false,
  tone = "white",
  children,
  footer = null,
  className = "",
}) {
  const surfaceClass =
    tone === "sage"
      ? "bg-[#EFF5EF] border-[#DCE8DC]"
      : "bg-white border-gray-200";

  return (
    <div
      className={`border rounded-2xl p-5 space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${surfaceClass} ${className}`}
    >
      {overline && (
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#16730F]">
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
            <span>{overline}</span>
          </span>
          {headerBadge}
        </div>
      )}

      {title && (
        <div
          className={`flex items-center justify-between gap-2 ${
            headerDivider ? "pb-3 border-b border-gray-100" : ""
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {!overline && Icon && (
              <Icon className="w-4 h-4 text-[#16730F] shrink-0" />
            )}
            <h3 className="text-sm font-extrabold text-gray-900 leading-snug">
              {title}
            </h3>
          </div>
          {!overline && headerBadge}
        </div>
      )}

      <div className="text-xs text-gray-600 leading-relaxed space-y-2.5">
        {children}
      </div>

      {footer && <div className="pt-1">{footer}</div>}
    </div>
  );
}


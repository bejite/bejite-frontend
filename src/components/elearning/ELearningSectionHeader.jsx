import React from "react";
import { BookOpen, ChevronRight } from "lucide-react";

/**
 * Reusable section heading with green overline, title, subtitle, and optional right CTA link.
 */
export default function ELearningSectionHeader({
  overline = "",
  overlineIcon: OverlineIcon = BookOpen,
  title,
  subtitle = "",
  actionLabel = "",
  onActionClick,
  showActionChevron = false,
  className = "",
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {overline && (
        <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#16730F]">
          {OverlineIcon && <OverlineIcon className="w-3.5 h-3.5 shrink-0" />}
          <span>{overline}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>

        {actionLabel && onActionClick && (
          <button
            type="button"
            onClick={onActionClick}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#16730F] hover:text-[#125E0C] hover:underline self-start sm:self-auto shrink-0 cursor-pointer"
          >
            <span>{actionLabel}</span>
            {showActionChevron && <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}


import React from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { formatDisplayText } from "../../utils/displayFormatUtils";

/**
 * Specification Detail Row
 * Sleek dossier field item with subtle left icon badge, crisp muted uppercase label,
 * and high-legibility value text or interactive link.
 */
const ProfileDetailRow = ({
  icon: Icon,
  label,
  value,
  href,
  preserveCase = false,
}) => {
  const displayValue = value
    ? preserveCase
      ? String(value).trim()
      : formatDisplayText(value)
    : "Not provided";
  const isLink = Boolean(href && value);

  return (
    <div className="group flex items-start gap-3.5 py-3.5 first:pt-0 last:pb-0 transition-all duration-150">
      {Icon && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-50 border border-slate-200/80 text-slate-400 group-hover:bg-emerald-50 group-hover:border-emerald-200 group-hover:text-[#16730F] transition-all duration-200 shadow-2xs mt-0.5">
          <Icon className="w-3.5 h-3.5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.16em] leading-none mb-1">
          {label}
        </p>
        {isLink ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={href}
            className="flex min-w-0 w-full items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#16730F] hover:text-[#145a0c] hover:underline"
          >
            <span className="min-w-0 flex-1 truncate">{displayValue}</span>
            <FaExternalLinkAlt className="w-2.5 h-2.5 shrink-0 opacity-50 group-hover/link:opacity-100 transition-opacity" />
          </a>
        ) : (
          <p className="text-xs sm:text-sm font-medium text-slate-800 truncate" title={displayValue}>
            {displayValue}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileDetailRow;

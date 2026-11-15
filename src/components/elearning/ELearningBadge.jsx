import React from "react";

const BADGE_VARIANTS = {
  level:
    "bg-[#EEF7EE] text-[#16730F] border border-[#D7ECD7] uppercase tracking-wider font-bold text-[10px]",
  solidGreen:
    "bg-[#16730F] text-white border border-[#16730F] font-semibold text-[11px]",
  darkForest:
    "bg-[#1A3E32] text-white border border-[#1A3E32] font-semibold text-[10px]",
  neutral:
    "bg-white/90 text-gray-700 border border-gray-200 font-medium text-[11px]",
  category:
    "bg-white/90 text-gray-800 border border-gray-200/80 uppercase tracking-wider font-bold text-[10px]",
  required:
    "bg-[#FFF4E5] text-[#C26A1B] border border-[#FDE2BA] font-semibold text-[10px]",
  statusSuccess:
    "bg-[#EEF7EE] text-[#16730F] border border-[#D4EAD4] font-semibold text-[11px]",
  statusMuted:
    "bg-[#F3F4F6] text-gray-500 border border-gray-200 font-medium text-[10px]",
};

/**
 * Reusable pill badge across E-Learning cards, syllabus headers, and requirement blocks.
 */
export default function ELearningBadge({
  children,
  variant = "level",
  icon: Icon = null,
  className = "",
}) {
  const style = BADGE_VARIANTS[variant] || BADGE_VARIANTS.level;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full leading-tight whitespace-nowrap shrink-0 ${style} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      {children}
    </span>
  );
}


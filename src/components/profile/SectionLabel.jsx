import React from "react";

/**
 * Executive Dossier Section Label
 * Colored dot with ambient glow, high-contrast uppercase tracked label, hairline divider.
 */
const SectionLabel = ({ children, tone = "#16730F", className = "" }) => (
  <div className={`flex items-center gap-3 mb-6 ${className}`}>
    <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
      <span
        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-35"
        style={{ backgroundColor: tone }}
      ></span>
      <span
        className="relative inline-flex rounded-full h-2 w-2 shadow-xs"
        style={{ backgroundColor: tone }}
      ></span>
    </span>
    <span className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500 select-none">
      {children}
    </span>
    <div className="flex-1 h-px bg-gradient-to-r from-slate-200 via-slate-100 to-transparent"></div>
  </div>
);

export default SectionLabel;

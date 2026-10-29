import React from "react";

/**
 * Reusable Welcome / Hero Banner for E-Learning hub screens.
 */
export default function ELearningWelcomeBanner({
  title,
  description,
  rightSlot = null,
  className = "",
}) {
  return (
    <div
      className={`bg-[#EFF5EF] border border-[#DCE8DC] rounded-2xl px-6 sm:px-7 py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${className}`}
    >
      <div className="min-w-0 max-w-3xl">
        <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#15372B] tracking-tight leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-[#4A6358] mt-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
    </div>
  );
}


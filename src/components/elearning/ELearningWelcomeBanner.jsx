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
      className={`bg-[#EFF5EF] border border-[#DCE8DC] rounded-2xl px-4 sm:px-7 py-4 sm:py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 ${className}`}
    >
      <div className="min-w-0 max-w-3xl">
        <h1 className="text-xl sm:text-2xl lg:text-[28px] font-extrabold text-[#15372B] tracking-tight leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-[#4A6358] mt-1.5 sm:mt-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
    </div>
  );
}


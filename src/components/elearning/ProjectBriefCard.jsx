import React from "react";

/**
 * Reusable Project Brief & Expected Deliverable Card for the Project Workspace.
 */
export default function ProjectBriefCard({
  briefText,
  expectedDeliverable,
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-[#112A20]">
        PROJECT BRIEF & INSTRUCTIONS
      </h2>

      {briefText && (
        <p className="text-xs sm:text-sm text-[#374151] leading-relaxed">
          {briefText}
        </p>
      )}

      {expectedDeliverable && (
        <div className="pt-1 space-y-1">
          <p className="text-xs sm:text-sm font-extrabold text-[#112A20]">
            Expected Deliverable:
          </p>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            {expectedDeliverable}
          </p>
        </div>
      )}
    </section>
  );
}


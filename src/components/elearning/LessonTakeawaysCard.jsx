import React from "react";

/**
 * Reusable Core Lesson Takeaways card inside the Lesson Player.
 */
export default function LessonTakeawaysCard({ takeaways = [] }) {
  if (!Array.isArray(takeaways) || takeaways.length === 0) return null;

  return (
    <div className="bg-[#F6FAF6] border border-[#DCE8DC] rounded-2xl p-5 sm:p-6">
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#112A20] mb-3">
        CORE LESSON TAKEAWAYS:
      </p>

      <ul className="space-y-2.5">
        {takeaways.map((point, index) => (
          <li
            key={index}
            className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700 leading-relaxed"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#16730F] shrink-0 mt-2" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}


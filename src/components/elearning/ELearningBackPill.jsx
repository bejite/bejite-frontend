import React from "react";
import { ChevronLeft } from "lucide-react";

/**
 * Reusable pill back button ("< My Learning" / "< Back to Courses").
 */
export default function ELearningBackPill({
  label = "My Learning",
  onClick,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#EBEEEC] hover:bg-[#DFE5E0] text-gray-800 text-xs font-semibold transition-colors cursor-pointer shrink-0 ${className}`}
    >
      <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
      <span>{label}</span>
    </button>
  );
}


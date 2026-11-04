import React from "react";
import { Check } from "lucide-react";

/**
 * Review Confirmation Modal.
 * Matches Figma Image 4 (media_1793754076777_fb1d1258.png).
 */
export default function CourseSubmitReviewModal({
  isOpen,
  courseTitle = "Digital Marketing Fundamentals",
  onClose,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-submit-review-modal-title"
    >
      <div
        className="w-full max-w-[540px] rounded-[32px] bg-white p-7 sm:p-10 shadow-[0_24px_60px_rgba(17,42,32,0.18)] border border-gray-100 text-center space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Checkmark Badge */}
        <div className="w-16 h-16 rounded-full bg-[#EAF5EC] flex items-center justify-center mx-auto shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-[#16730F] text-white flex items-center justify-center">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
        </div>

        {/* Title & Body */}
        <div className="space-y-3">
          <h2
            id="course-submit-review-modal-title"
            className="text-xl sm:text-2xl font-extrabold text-[#112A20] tracking-tight leading-snug"
          >
            Submit course for administrative review?
          </h2>

          <p className="text-xs sm:text-sm text-[#4E6357] leading-relaxed max-w-md mx-auto">
            You are submitting &ldquo;{courseTitle}&rdquo; to Bejite Academy administrators for publication review. Submission places the course into the review queue and does not immediately publish it to learners.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-full bg-[#EAF2EA] hover:bg-[#DCE8DC] text-[#153B2E] font-bold text-xs sm:text-sm px-8 py-3.5 transition-colors cursor-pointer"
          >
            Keep Editing
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-xs sm:text-sm px-8 py-3.5 transition-colors shadow-sm cursor-pointer"
          >
            Confirm Submission
          </button>
        </div>
      </div>
    </div>
  );
}


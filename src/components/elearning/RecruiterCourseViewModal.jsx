import React from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Edit3,
  Layers,
  Trash2,
  X,
} from "lucide-react";

/**
 * Clean Course Overview & Quick Management modal opened when clicking "View"
 * on a course row in Recruiter E-Learning Management.
 */
export default function RecruiterCourseViewModal({
  course,
  isOpen,
  onClose,
  onEdit,
  onStatusChange,
  onDelete,
}) {
  if (!isOpen || !course) return null;

  const moduleCount = (course.modules || []).length;
  const lessonCount = (course.modules || []).reduce(
    (sum, mod) => sum + ((mod.lessons || []).length || 0),
    0
  );
  const isPaid = Boolean(course.pricing?.isPaid);
  const priceLabel =
    isPaid && course.pricing?.amount
      ? `${course.pricing.currency || "NGN"} ${Number(
          course.pricing.amount
        ).toLocaleString()}`
      : isPaid
      ? "Paid Course"
      : "Free";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-[660px] max-h-[90vh] overflow-y-auto rounded-[28px] bg-white p-6 sm:p-8 shadow-[0_24px_60px_rgba(17,42,32,0.18)] border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#EFF5EF] text-[#16730F] text-[11px] font-bold px-3 py-1">
                {course.subjectArea || "Digital Marketing"}
              </span>
              <span className="rounded-full bg-[#F1F4F2] text-[#1F2937] text-[11px] font-semibold px-3 py-1">
                {course.levelShort || "Beginner"}
              </span>
              <span className="rounded-full bg-[#F8FAF8] border border-[#E2ECE3] text-[#183B2E] text-[11px] font-bold px-3 py-1">
                {priceLabel}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#153B2E]">
              {course.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-10 h-10 rounded-full bg-[#EFF5EF] hover:bg-[#E1ECE1] text-[#153B2E] flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-3 text-sm text-[#5B6D63] leading-relaxed">
          {course.summary || "No course description provided yet."}
        </p>

        {/* Stats Strip */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-[#F4F8F4] border border-[#DFEBDF] p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5B6D63]">
              <Layers className="w-4 h-4 text-[#16730F]" />
              Modules
            </div>
            <div className="mt-1 text-lg font-extrabold text-[#153B2E]">
              {moduleCount}
            </div>
          </div>
          <div className="rounded-2xl bg-[#F4F8F4] border border-[#DFEBDF] p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5B6D63]">
              <BookOpen className="w-4 h-4 text-[#16730F]" />
              Lessons
            </div>
            <div className="mt-1 text-lg font-extrabold text-[#153B2E]">
              {lessonCount}
            </div>
          </div>
          <div className="rounded-2xl bg-[#F4F8F4] border border-[#DFEBDF] p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5B6D63]">
              <Clock className="w-4 h-4 text-[#16730F]" />
              Status
            </div>
            <div className="mt-1 text-sm font-extrabold text-[#153B2E] capitalize">
              {String(course.status || "draft").replace("_", " ")}
            </div>
          </div>
        </div>

        {/* Curriculum Outline */}
        <div className="mt-6 space-y-2.5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#153B2E]">
            Curriculum Outline
          </h3>
          {(course.modules || []).length === 0 ? (
            <p className="text-xs text-gray-500">No modules configured yet.</p>
          ) : (
            <div className="space-y-2">
              {(course.modules || []).map((mod, idx) => (
                <div
                  key={mod.id || idx}
                  className="rounded-2xl border border-[#E5ECE7] bg-[#FBFDFB] px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-[#153B2E] truncate">
                      Module {idx + 1}: {mod.title}
                    </p>
                    {mod.description && (
                      <p className="text-xs text-[#6B7B73] truncate mt-0.5">
                        {mod.description}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-[#EFF5EF] text-[#16730F] text-[11px] font-bold px-2.5 py-1">
                    {(mod.lessons || []).length} lessons
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Quick Actions */}
        <div className="mt-6 pt-5 border-t border-[#EDF2EE] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {course.status !== "published" && (
              <button
                type="button"
                onClick={() => onStatusChange?.(course.id, "published")}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#E5F4E6] hover:bg-[#D5ECD7] text-[#16730F] font-bold text-xs px-4 py-2 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Publish Now
              </button>
            )}
            {course.status !== "in_review" && (
              <button
                type="button"
                onClick={() => onStatusChange?.(course.id, "in_review")}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF5E8] hover:bg-[#FDE9CE] text-[#D97706] font-bold text-xs px-4 py-2 transition-colors"
              >
                Move to Review
              </button>
            )}
            {course.status !== "draft" && (
              <button
                type="button"
                onClick={() => onStatusChange?.(course.id, "draft")}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#ECEFED] hover:bg-[#DFE4E1] text-[#374151] font-bold text-xs px-4 py-2 transition-colors"
              >
                Move to Draft
              </button>
            )}
            <button
              type="button"
              onClick={() => onDelete?.(course)}
              className="inline-flex items-center gap-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-4 py-2 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>

          <button
            type="button"
            onClick={() => onEdit?.(course)}
            className="inline-flex items-center gap-2 rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-xs sm:text-sm px-6 py-3 transition-colors shadow-xs"
          >
            <Edit3 className="w-4 h-4" />
            Edit Course
          </button>
        </div>
      </div>
    </div>
  );
}


import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

/**
 * Reusable modal for both Adding and Editing a Lesson.
 * Matches the Figma Image 3 pixel-for-pixel.
 */
export default function CourseLessonModal({
  isOpen,
  mode = "add",
  initialData = null,
  onClose,
  onSave,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || "");
      setDescription(initialData?.summary || initialData?.description || "");
      setError("");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isEdit = mode === "edit";

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Please enter a lesson title.");
      return;
    }
    onSave?.({
      ...(initialData || {}),
      title: trimmedTitle,
      summary: description.trim(),
      description: description.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-lesson-modal-title"
    >
      <div
        className="w-full max-w-[580px] rounded-[28px] bg-white p-6 sm:p-9 shadow-[0_24px_60px_rgba(17,42,32,0.16)] border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="course-lesson-modal-title"
              className="text-xl sm:text-2xl font-extrabold text-[#153B2E] tracking-tight"
            >
              {isEdit ? "Edit Lesson" : "Add Lesson"}
            </h2>
            <p className="mt-1 text-sm text-[#6B7B73]">
              Set up the lesson title and description.
            </p>
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

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label
              htmlFor="course-lesson-title"
              className="block text-sm font-bold text-[#1E293B] mb-2"
            >
              Lesson Title <span className="text-[#1E293B]">*</span>
            </label>
            <input
              id="course-lesson-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g What Digital marketing means"
              autoFocus
              className="w-full rounded-2xl border border-[#74B570] focus:border-[#16730F] focus:ring-2 focus:ring-[#16730F]/20 px-4 py-3.5 text-sm text-gray-900 placeholder:text-[#98A69E] outline-none transition"
            />
            {error && (
              <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="course-lesson-description"
              className="block text-sm font-bold text-[#1E293B] mb-2"
            >
              Module Description (Optional)
            </label>
            <textarea
              id="course-lesson-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly explain what learners will cover in this lesson"
              className="w-full rounded-2xl border border-[#2C4C3E] focus:border-[#16730F] focus:ring-2 focus:ring-[#16730F]/20 px-4 py-3.5 text-sm text-gray-900 placeholder:text-[#98A69E] outline-none transition resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[#EAF2EA] hover:bg-[#DCE8DC] text-[#153B2E] font-bold text-sm px-8 py-3.5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-sm px-10 py-3.5 transition-colors shadow-xs"
            >
              Save module
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

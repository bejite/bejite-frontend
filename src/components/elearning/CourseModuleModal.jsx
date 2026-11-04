import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

/**
 * Reusable modal for both Adding and Editing a Course Module.
 * Matches the Bejite Recruiter E-Learning Figma specification.
 */
export default function CourseModuleModal({
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
      setDescription(initialData?.description || "");
      setError("");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isEdit = mode === "edit";

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Please enter a module title.");
      return;
    }
    onSave?.({
      ...(initialData || {}),
      title: trimmedTitle,
      description: description.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-module-modal-title"
    >
      <div
        className="w-full max-w-[95vw] sm:max-w-[580px] rounded-2xl sm:rounded-[28px] bg-white p-4 sm:p-9 shadow-[0_24px_60px_rgba(17,42,32,0.16)] border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="course-module-modal-title"
              className="text-lg sm:text-2xl font-extrabold text-[#153B2E] tracking-tight"
            >
              {isEdit ? "Edit Module" : "Add Course Module"}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#6B7B73]">
              Group lessons into an instructional module.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EFF5EF] hover:bg-[#E1ECE1] text-[#153B2E] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label
              htmlFor="course-module-title"
              className="block text-sm font-bold text-[#1E293B] mb-2"
            >
              Module Title <span className="text-[#1E293B]">*</span>
            </label>
            <input
              id="course-module-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g Introduction of Digital marketing"
              autoFocus
              className="w-full rounded-2xl border border-[#74B570] focus:border-[#16730F] focus:ring-2 focus:ring-[#16730F]/20 px-4 py-3.5 text-sm text-gray-900 placeholder:text-[#98A69E] outline-none transition"
            />
            {error && (
              <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="course-module-description"
              className="block text-sm font-bold text-[#1E293B] mb-2"
            >
              Module Description (Optional)
            </label>
            <textarea
              id="course-module-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly explain what learners will cover in this module"
              className="w-full rounded-2xl border border-[#2C4C3E] focus:border-[#16730F] focus:ring-2 focus:ring-[#16730F]/20 px-4 py-3.5 text-sm text-gray-900 placeholder:text-[#98A69E] outline-none transition resize-none"
            />
          </div>

          <div className="pt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-full bg-[#EAF2EA] hover:bg-[#DCE8DC] text-[#153B2E] font-bold text-sm px-8 py-3.5 transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-sm px-10 py-3.5 transition-colors shadow-xs cursor-pointer text-center"
            >
              Save module
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


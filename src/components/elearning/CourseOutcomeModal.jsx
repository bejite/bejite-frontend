import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

/**
 * Reusable modal popup for Adding or Editing a Learning Outcome ("What will learners learn?").
 */
export default function CourseOutcomeModal({
  isOpen,
  mode = "add",
  initialValue = "",
  onClose,
  onSave,
}) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitle(initialValue || "");
      setError("");
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const isEdit = mode === "edit";

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Please enter an outcome title.");
      return;
    }
    onSave?.(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-outcome-modal-title"
    >
      <div
        className="w-full max-w-[95vw] sm:max-w-[560px] rounded-2xl sm:rounded-[28px] bg-white p-4 sm:p-9 shadow-[0_24px_60px_rgba(17,42,32,0.16)] border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="course-outcome-modal-title"
              className="text-lg sm:text-2xl font-extrabold text-[#153B2E] tracking-tight"
            >
              {isEdit ? "Edit Outcome" : "Add Outcome"}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#6B7B73]">
              Add a concrete skill or measurable competency learners will gain.
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

        <form onSubmit={handleSubmit} className="mt-7 space-y-6">
          <div>
            <label
              htmlFor="course-outcome-title"
              className="block text-sm font-bold text-[#1E293B] mb-2"
            >
              Outcome Title *
            </label>
            <input
              id="course-outcome-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Explain what digital marketing means."
              autoFocus
              className="w-full rounded-2xl border border-[#74B570] focus:border-[#16730F] focus:ring-2 focus:ring-[#16730F]/20 px-4 py-3.5 text-sm text-gray-900 placeholder:text-[#98A69E] outline-none transition"
            />
            {error && (
              <p className="mt-1.5 text-xs font-semibold text-red-600">
                {error}
              </p>
            )}
          </div>

          <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
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
              Save outcome
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


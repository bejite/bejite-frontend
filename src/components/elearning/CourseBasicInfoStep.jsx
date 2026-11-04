import React, { useRef } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  GripVertical,
  Plus,
  Upload,
} from "lucide-react";
import { toast } from "react-toastify";
import { COURSE_SUBJECT_AREAS } from "../../services/elearningService";

export const LEARNING_LEVELS = [
  {
    value: "Beginner",
    label: "Beginner",
    description: "For learners who are new to the subject.",
  },
  {
    value: "Intermediate",
    label: "Intermediate",
    description: "For learners who already understand the basics.",
  },
  {
    value: "Advanced",
    label: "Advanced",
    description: "For learners who want to build deeper capability.",
  },
];

/**
 * Step 1: Basic Information Step.
 */
export default function CourseBasicInfoStep({
  draft = {},
  updateField,
  onAddOutcome,
  onOutcomeChange,
  onMoveOutcome,
  onDeleteOutcome,
}) {
  const coverInputRef = useRef(null);

  const handleCoverUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Cover image must be 5MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateField("coverImage", String(reader.result || ""));
      updateField("coverImageName", file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCover = () => {
    updateField("coverImage", "");
    updateField("coverImageName", "");
  };

  return (
    <div className="space-y-5">
      {/* Sage Header Banner */}
      <div className="rounded-3xl bg-[#EFF5EF] border border-[#DCE8DC] p-6 sm:p-7">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#122B20]">
          Basic Information
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#5A6D62]">
          Set the essential details that learners and recruiters will see across Bejite Academy.
        </p>
      </div>

      {/* Course Title */}
      <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="cb-course-title"
            className="text-sm font-bold text-[#122B20]"
          >
            Course Title <span className="text-red-500">*</span>
          </label>
          <span className="text-[11px] font-medium text-gray-400">
            Required
          </span>
        </div>
        <p className="mt-1 text-xs text-[#6B7B73]">
          The primary name learners will see when browsing and discovering the course.
        </p>
        <input
          id="cb-course-title"
          type="text"
          value={draft.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="e.g. Digital Marketing Fundamentals"
          className="mt-3.5 w-full rounded-xl border border-[#E2EAE4] bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#16730F] focus:ring-2 focus:ring-[#16730F]/20 outline-none transition"
        />
      </div>

      {/* Course Description */}
      <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="cb-course-desc"
            className="text-sm font-bold text-[#122B20]"
          >
            Course Description <span className="text-red-500">*</span>
          </label>
          <span className="text-[11px] font-medium text-gray-400">
            Required
          </span>
        </div>
        <p className="mt-1 text-xs text-[#6B7B73]">
          Provide a clear summary explaining the topics covered and why this course matters.
        </p>
        <textarea
          id="cb-course-desc"
          rows={4}
          value={draft.summary || ""}
          onChange={(e) => updateField("summary", e.target.value)}
          placeholder="Explain what learners will learn in this course."
          className="mt-3.5 w-full rounded-xl border border-[#E2EAE4] bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#16730F] focus:ring-2 focus:ring-[#16730F]/20 outline-none transition resize-none"
        />
      </div>

      {/* Course Cover Image */}
      <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 shadow-2xs">
        <div className="text-sm font-bold text-[#122B20]">
          Course Cover Image
        </div>
        <p className="mt-1 text-xs text-[#6B7B73]">
          Upload an image card that represents this course in catalogues and previews.
        </p>

        <input
          ref={coverInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleCoverUpload}
          className="hidden"
        />

        {draft.coverImage ? (
          <div className="mt-3.5 rounded-2xl border border-[#D3DFD5] bg-[#FAFDFB] p-4 flex flex-col sm:flex-row items-center gap-4">
            <img
              src={draft.coverImage}
              alt="Course cover preview"
              className="w-full sm:w-48 h-28 object-cover rounded-xl border border-gray-200"
            />
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <p className="text-sm font-bold text-[#122B20] truncate">
                {draft.coverImageName || "Cover image uploaded"}
              </p>
              <p className="text-xs text-[#6B7B73] mt-0.5">
                Ready for Bejite Academy catalogue cards
              </p>
              <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="rounded-full bg-[#EFF5EF] hover:bg-[#DFEBDF] text-[#16730F] text-xs font-bold px-4 py-1.5 transition-colors cursor-pointer"
                >
                  Replace image
                </button>
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-4 py-1.5 transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="mt-3.5 w-full rounded-2xl border-2 border-dashed border-[#D5E1D7] hover:border-[#16730F]/60 bg-[#FCFDFC] py-10 px-4 flex flex-col items-center justify-center text-center transition-colors cursor-pointer"
          >
            <span className="w-11 h-11 rounded-full bg-[#E6F3E6] text-[#16730F] flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </span>
            <span className="mt-3 text-xs sm:text-sm font-bold text-[#122B20]">
              Click to upload cover image
            </span>
            <span className="mt-1 text-[11px] text-gray-400">
              PNG, JPG or WEBP up to 5MB (16:9 landscape aspect ratio recommended)
            </span>
          </button>
        )}
      </div>

      {/* Subject Area + Who is this course for? */}
      <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 shadow-2xs">
        <div>
          <label
            htmlFor="cb-subject-area"
            className="block text-sm font-bold text-[#122B20]"
          >
            Subject or Skill Area
          </label>
          <p className="mt-1 text-xs text-[#6B7B73]">
            Select the field or discipline this course sits in.
          </p>
          <div className="relative mt-3">
            <select
              id="cb-subject-area"
              value={draft.subjectArea || "Digital Marketing"}
              onChange={(e) => updateField("subjectArea", e.target.value)}
              className="w-full appearance-none rounded-xl border border-[#E2EAE4] bg-white pl-4 pr-10 py-3 text-sm text-gray-900 focus:border-[#16730F] focus:ring-2 focus:ring-[#16730F]/20 outline-none transition cursor-pointer"
            >
              {COURSE_SUBJECT_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label
            htmlFor="cb-target-audience"
            className="block text-sm font-bold text-[#122B20]"
          >
            Who is this course for?
          </label>
          <p className="mt-1 text-xs text-[#6B7B73]">
            Describe the profile or career stage of intended learners.
          </p>
          <input
            id="cb-target-audience"
            type="text"
            value={draft.targetAudience || ""}
            onChange={(e) => updateField("targetAudience", e.target.value)}
            placeholder="Describe the learners this course is intended for"
            className="mt-3 w-full rounded-xl border border-[#E2EAE4] bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#16730F] focus:ring-2 focus:ring-[#16730F]/20 outline-none transition"
          />
        </div>
      </div>

      {/* Learning Level */}
      <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 shadow-2xs">
        <div className="text-sm font-bold text-[#122B20]">
          Learning Level <span className="text-red-500">*</span>
        </div>
        <p className="mt-1 text-xs text-[#6B7B73]">
          Select an experience level for this course to aid learner discovery.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {LEARNING_LEVELS.map((lvl) => {
            const selected = (draft.levelShort || "Beginner") === lvl.value;
            return (
              <button
                key={lvl.value}
                type="button"
                onClick={() => updateField("levelShort", lvl.value)}
                className={`rounded-2xl p-4 text-left transition-all flex items-start justify-between gap-3 cursor-pointer ${
                  selected
                    ? "border-2 border-[#16730F] bg-[#EFF6EF]"
                    : "border border-[#E2EAE4] bg-white hover:border-[#9EC49B]"
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-[#122B20]">
                    {lvl.label}
                  </div>
                  <p className="mt-1 text-xs text-[#6B7B73]">
                    {lvl.description}
                  </p>
                </div>
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    selected
                      ? "bg-[#16730F] text-white"
                      : "border border-[#76B572] bg-white"
                  }`}
                >
                  {selected && <Check className="w-3 h-3 stroke-[3]" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* What will learners learn? */}
      <div className="rounded-3xl bg-[#EFF5EF] border border-[#DCE8DC] p-5 sm:p-7 shadow-2xs">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#122B20]">
              What will learners learn?
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#5A6D62]">
              Add concrete skills and measurable competencies learners will gain.
            </p>
          </div>
          <button
            type="button"
            onClick={onAddOutcome}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-xs px-5 py-2.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Outcome
          </button>
        </div>

        <div className="space-y-3">
          {(draft.learningOutcomes || []).map((outcome, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#E2EDE2] px-3.5 sm:px-4 py-3 flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3"
            >
              <GripVertical className="w-4 h-4 text-[#5F7467] shrink-0 hidden sm:block" />
              <span className="w-7 h-7 rounded-full bg-[#16730F] text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <input
                type="text"
                value={outcome}
                onChange={(e) => onOutcomeChange?.(idx, e.target.value)}
                placeholder="e.g"
                className="flex-1 min-w-[180px] rounded-xl bg-white border border-[#DCE7DC] px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#16730F] outline-none"
              />
              <div className="inline-flex items-center rounded-full bg-[#D2E2D2] border border-[#C1D5C1] overflow-hidden shrink-0">
                <button
                  type="button"
                  onClick={() => onMoveOutcome?.(idx, -1)}
                  disabled={idx === 0}
                  aria-label="Move outcome up"
                  className="px-2.5 py-1.5 text-[#183B2E] hover:bg-[#C3D7C3] disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <span className="w-[1px] h-4 bg-[#B8CEB8]" />
                <button
                  type="button"
                  onClick={() => onMoveOutcome?.(idx, 1)}
                  disabled={idx === (draft.learningOutcomes || []).length - 1}
                  aria-label="Move outcome down"
                  className="px-2.5 py-1.5 text-[#183B2E] hover:bg-[#C3D7C3] disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => onDeleteOutcome?.(idx)}
                className="rounded-full bg-[#FF3B30] hover:bg-[#E02D22] text-white font-bold text-xs px-4 py-1.5 transition-colors shrink-0 cursor-pointer"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


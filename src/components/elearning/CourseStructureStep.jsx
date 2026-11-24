import React, { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Layers,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

function stripModulePrefix(title = "") {
  return String(title).replace(/^module\s+\d+\s*:\s*/i, "").trim();
}

/**
 * Step 2: Course Structure Step.
 */
export default function CourseStructureStep({
  draft = {},
  updateField,
  onOpenAddModule,
  onOpenEditModule,
  onMoveModule,
  onDeleteModule,
  onOpenAddLesson,
  onOpenEditLesson,
  onMoveLesson,
  onDeleteLesson,
}) {
  const [collapsedModules, setCollapsedModules] = useState({});
  const isStandalone = draft.organisationType === "standalone";
  const modules = draft.modules || [];

  const toggleCollapse = (modId) => {
    setCollapsedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  return (
    <div className="space-y-5">
      {/* Sage Header Banner */}
      <div className="rounded-3xl bg-[#EFF5EF] border border-[#DCE8DC] p-6 sm:p-7">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#122B20]">
          Course Structure
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#5A6D62]">
          Decide how your curriculum is divided into modules and instructional units.
        </p>
      </div>

      {/* Organisation Type Selector */}
      <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-6 shadow-2xs">
        <div className="text-sm font-bold text-[#122B20]">
          How is your course organised?
        </div>
        <p className="mt-1 text-xs text-[#6B7B73]">
          Choose how learners will move through the content.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Standalone Course */}
          <button
            type="button"
            onClick={() => updateField("organisationType", "standalone")}
            className={`rounded-2xl p-5 text-left transition-all flex flex-col justify-between cursor-pointer ${
              isStandalone
                ? "border-2 border-[#16730F] bg-[#F7FBF7]"
                : "border border-[#E2EAE4] bg-white hover:border-[#9EC49B]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#122B20]">
                  <FileText className="w-4 h-4 text-[#16730F]" />
                  Standalone Course
                </div>
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    isStandalone
                      ? "bg-[#16730F] text-white"
                      : "border border-[#76B572] bg-white"
                  }`}
                >
                  {isStandalone && <Check className="w-3 h-3 stroke-[3]" />}
                </span>
              </div>
              <p className="mt-2.5 text-xs text-[#6B7B73] leading-relaxed">
                Use this option when the course does not need to be divided into multiple modules.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#EDF2EE] text-[11px] font-medium text-gray-400">
              Learning units are listed directly at course level
            </div>
          </button>

          {/* Course with Modules */}
          <button
            type="button"
            onClick={() => updateField("organisationType", "modules")}
            className={`rounded-2xl p-5 text-left transition-all flex flex-col justify-between cursor-pointer ${
              !isStandalone
                ? "border-2 border-[#16730F] bg-[#F7FBF7]"
                : "border border-[#E2EAE4] bg-white hover:border-[#9EC49B]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#122B20]">
                  <Layers className="w-4 h-4 text-[#16730F]" />
                  Course with Modules
                </div>
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    !isStandalone
                      ? "bg-[#16730F] text-white"
                      : "border border-[#76B572] bg-white"
                  }`}
                >
                  {!isStandalone && <Check className="w-3 h-3 stroke-[3]" />}
                </span>
              </div>
              <p className="mt-2.5 text-xs text-[#6B7B73] leading-relaxed">
                Organise your curriculum into modules, with lessons inside each module.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#EDF2EE] text-[11px] font-bold text-[#16730F]">
              Recommended for structured multi-lesson courses
            </div>
          </button>
        </div>
      </div>

      {/* Course Modules Header */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-[#122B20]">
            {isStandalone ? "Course Lessons" : "Course Modules"}
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-[#6B7B73]">
            {isStandalone
              ? "Add and order lessons directly inside this standalone course."
              : "Break your course into manageable sections and add lessons to each section."}
          </p>
        </div>

        {isStandalone ? (
          <button
            type="button"
            onClick={() => onOpenAddLesson?.(0)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-xs px-5 py-2.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Lesson
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenAddModule}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-xs px-5 py-2.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Module
          </button>
        )}
      </div>

      {/* Module Cards */}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#CEDCCE] bg-[#FAFDFB] p-10 text-center">
            <p className="text-sm font-bold text-[#153B2E]">
              No modules added yet
            </p>
            <p className="mt-1 text-xs text-[#6B7B73]">
              Click &ldquo;+ Add Module&rdquo; to create your first course module.
            </p>
          </div>
        ) : (
          modules.map((mod, mIdx) => {
            const isCollapsed = Boolean(collapsedModules[mod.id || mIdx]);
            const lessons = mod.lessons || [];
            const cleanTitle = stripModulePrefix(mod.title);
            return (
              <div
                key={mod.id || mIdx}
                className="rounded-3xl border border-[#DCE8DC] bg-white overflow-hidden shadow-2xs"
              >
                {/* Module Header */}
                {!isStandalone && (
                  <div className="bg-[#EFF5EF] px-5 py-4 border-b border-[#DCE8DC] flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleCollapse(mod.id || mIdx)}
                        aria-label="Toggle module lessons"
                        className="mt-0.5 text-[#5A6D62] hover:text-[#122B20] cursor-pointer"
                      >
                        {isCollapsed ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-extrabold text-[#122B20]">
                            Module {mIdx + 1}: {cleanTitle}
                          </h3>
                          <span className="rounded-md bg-white border border-[#DCE7DC] px-2 py-0.5 text-[11px] font-semibold text-[#5A6D62]">
                            {lessons.length}{" "}
                            {lessons.length === 1 ? "lesson" : "lessons"}
                          </span>
                        </div>
                        {mod.description && (
                          <p className="mt-1 text-xs text-[#6B7B73]">
                            {mod.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="inline-flex items-center rounded-full bg-[#DCE9DC] border border-[#C8DAC8] overflow-hidden">
                        <button
                          type="button"
                          onClick={() => onMoveModule?.(mIdx, -1)}
                          disabled={mIdx === 0}
                          aria-label="Move module up"
                          className="px-2.5 py-1.5 text-[#183B2E] hover:bg-[#CDE0CD] disabled:opacity-40 transition-colors cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-[1px] h-4 bg-[#BFD3BF]" />
                        <button
                          type="button"
                          onClick={() => onMoveModule?.(mIdx, 1)}
                          disabled={mIdx === modules.length - 1}
                          aria-label="Move module down"
                          className="px-2.5 py-1.5 text-[#183B2E] hover:bg-[#CDE0CD] disabled:opacity-40 transition-colors cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenEditModule?.(mIdx)}
                        className="rounded-full bg-[#183B2E] hover:bg-[#102920] text-white font-bold text-xs px-4 py-1.5 transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteModule?.(mIdx)}
                        className="rounded-full bg-[#FF3B30] hover:bg-[#E02D22] text-white font-bold text-xs px-4 py-1.5 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}

                {/* Lessons Body */}
                {!isCollapsed && (
                  <div className="p-5 space-y-3 bg-white">
                    {lessons.length === 0 ? (
                      <p className="text-xs text-gray-400 py-2">
                        No lessons in this module yet.
                      </p>
                    ) : (
                      lessons.map((lesson, lIdx) => (
                        <div
                          key={lesson.id || lIdx}
                          className="rounded-2xl border border-[#E6ECE8] px-4 py-3.5 flex items-center justify-between gap-3 hover:border-[#C9DCCB] transition-colors"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <span className="rounded-lg bg-[#F5F8F6] border border-[#E2EAE4] px-2.5 py-1.5 text-xs font-bold text-[#5F7166] shrink-0">
                              {mIdx + 1}.{lIdx + 1}
                            </span>
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-bold text-[#122B20] truncate">
                                {lesson.title}
                              </div>
                              <p className="mt-0.5 text-xs text-[#6B7B73] truncate">
                                {lesson.summary ||
                                  `${lesson.type || "Reading"} • ${
                                    lesson.durationMinutes || 15
                                  } mins`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 text-gray-400">
                            <button
                              type="button"
                              onClick={() => onMoveLesson?.(mIdx, lIdx, -1)}
                              disabled={lIdx === 0}
                              aria-label="Move lesson up"
                              className="p-1.5 hover:text-[#183B2E] disabled:opacity-30 cursor-pointer"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onMoveLesson?.(mIdx, lIdx, 1)}
                              disabled={lIdx === lessons.length - 1}
                              aria-label="Move lesson down"
                              className="p-1.5 hover:text-[#183B2E] disabled:opacity-30 cursor-pointer"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <span className="w-[1px] h-4 bg-gray-200 mx-0.5" />
                            <button
                              type="button"
                              onClick={() => onOpenEditLesson?.(mIdx, lIdx)}
                              aria-label="Edit lesson"
                              className="p-1.5 hover:text-[#16730F] transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteLesson?.(mIdx, lIdx)}
                              aria-label="Delete lesson"
                              className="p-1.5 hover:text-red-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}

                    {!isStandalone && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => onOpenAddLesson?.(mIdx)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-xs px-4 py-2 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add lesson to Module {mIdx + 1}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}


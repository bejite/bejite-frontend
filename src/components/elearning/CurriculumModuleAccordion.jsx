import React, { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  PlayCircle,
  BookOpen,
  Video,
  FileText,
  Check,
  Disc,
} from "lucide-react";
import ELearningBadge from "./ELearningBadge";
import ELearningButton from "./ELearningButton";

function getLessonTypeIcon(type) {
  const normalized = String(type || "").toLowerCase();
  if (normalized === "video") return Video;
  if (normalized === "exercise") return FileText;
  return BookOpen;
}

/**
 * Reusable Curriculum Module Accordion / Progress Group.
 * Supports three UI modes matching the mockups:
 * - "player"   (Course Lesson Player left curriculum rail)
 * - "syllabus" (Course Details expandable syllabus cards)
 * - "progress" (Track Progress & Criteria module breakdown)
 */
export default function CurriculumModuleAccordion({
  modules = [],
  completedLessonIds = [],
  activeLessonId = null,
  currentLessonId = null,
  variant = "syllabus",
  defaultExpandedFirstOnly = false,
  onSelectLesson,
}) {
  const completedSet = new Set(completedLessonIds);

  const [expandedIds, setExpandedIds] = useState(() => {
    if (!modules.length) return {};
    const initial = {};
    modules.forEach((mod, idx) => {
      initial[mod.id] = defaultExpandedFirstOnly ? idx === 0 : true;
    });
    return initial;
  });

  const toggleModule = (modId) => {
    setExpandedIds((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  if (variant === "player") {
    return (
      <div className="divide-y divide-gray-100">
        {modules.map((mod) => {
          const lessons = mod.lessons || [];
          const doneCount = lessons.filter((l) => completedSet.has(l.id)).length;
          const isOpen = expandedIds[mod.id] !== false;

          return (
            <div key={mod.id}>
              <button
                type="button"
                onClick={() => toggleModule(mod.id)}
                className="w-full px-4 py-3 bg-[#F5F7F5] hover:bg-[#EEF2EE] flex items-center justify-between gap-2 text-left transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-[#16730F]">
                    {mod.code}
                  </p>
                  <p className="text-xs font-bold text-gray-900 mt-0.5 leading-snug">
                    {mod.title}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {doneCount} of {lessons.length} completed
                  </p>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="divide-y divide-gray-100 bg-white">
                  {lessons.map((lesson) => {
                    const isCompleted = completedSet.has(lesson.id);
                    const isActive = activeLessonId === lesson.id;

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => onSelectLesson?.(lesson, mod)}
                        className={`w-full px-4 py-3 flex items-start gap-2.5 text-left transition-colors cursor-pointer border-l-[3px] ${
                          isActive
                            ? "border-l-[#16730F] bg-[#EFF6EF]"
                            : "border-l-transparent hover:bg-gray-50"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-[#16730F] shrink-0 mt-0.5" />
                        ) : (
                          <PlayCircle
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isActive ? "text-[#16730F]" : "text-gray-300"
                            }`}
                          />
                        )}
                        <div className="min-w-0">
                          <p
                            className={`text-xs leading-snug ${
                              isActive
                                ? "font-bold text-gray-900"
                                : "font-medium text-gray-700"
                            }`}
                          >
                            {lesson.title}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {lesson.type} • {lesson.durationMinutes}m
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === "progress") {
    return (
      <div className="space-y-4">
        {modules.map((mod) => {
          const lessons = mod.lessons || [];
          const doneCount = lessons.filter((l) => completedSet.has(l.id)).length;
          const allModuleDone =
            lessons.length > 0 && doneCount === lessons.length;

          return (
            <div
              key={mod.id}
              className="border border-gray-200 rounded-2xl overflow-hidden bg-white"
            >
              {/* Module Header */}
              <div className="px-4 py-3 bg-[#F6F8F6] border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    {mod.code}
                  </p>
                  <p className="text-xs font-extrabold text-gray-900 mt-0.5">
                    {mod.title}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-gray-500">
                    {doneCount}/{lessons.length}
                  </span>
                  {allModuleDone && (
                    <ELearningBadge variant="statusSuccess" icon={Check}>
                      Module Completed
                    </ELearningBadge>
                  )}
                </div>
              </div>

              {/* Lessons */}
              <div className="divide-y divide-gray-100">
                {lessons.map((lesson, idx) => {
                  const isCompleted = completedSet.has(lesson.id);
                  const isCurrent =
                    !isCompleted && currentLessonId === lesson.id;

                  return (
                    <div
                      key={lesson.id}
                      className={`px-4 py-3 flex items-center justify-between gap-3 ${
                        isCurrent ? "bg-[#EFF7EF]" : "bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {isCompleted ? (
                          <div className="w-5 h-5 rounded-full bg-[#16730F] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                        ) : isCurrent ? (
                          <Disc className="w-5 h-5 text-[#16730F] shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p
                            className={`text-xs font-bold truncate ${
                              isCurrent ? "text-[#16730F]" : "text-gray-900"
                            }`}
                          >
                            {lesson.title}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {lesson.type} • {lesson.durationMinutes} mins
                            {isCompleted && (
                              <span className="text-[#16A34A] font-semibold">
                                {" "}
                                • Completed
                              </span>
                            )}
                            {isCurrent && (
                              <span className="text-[#16730F] font-semibold">
                                {" "}
                                • Current Lesson
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <ELearningButton
                        variant={
                          isCurrent
                            ? "primary"
                            : isCompleted
                              ? "subtleGray"
                              : "outline"
                        }
                        size="xs"
                        className="rounded-lg px-3.5"
                        onClick={() => onSelectLesson?.(lesson, mod)}
                      >
                        {isCompleted ? "Review" : "Open"}
                      </ELearningButton>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Default: "syllabus" mode (Course Details & Syllabus screen)
  return (
    <div className="space-y-3">
      {modules.map((mod) => {
        const lessons = mod.lessons || [];
        const isOpen = Boolean(expandedIds[mod.id]);

        return (
          <div
            key={mod.id}
            className="border border-gray-200 rounded-2xl overflow-hidden bg-white"
          >
            <button
              type="button"
              onClick={() => toggleModule(mod.id)}
              className={`w-full px-5 py-4 flex items-start justify-between gap-3 text-left transition-colors cursor-pointer ${
                isOpen ? "bg-[#F5F8F5] border-b border-gray-100" : "bg-white hover:bg-gray-50/70"
              }`}
            >
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#16730F]">
                  {mod.code}
                </p>
                <p className="text-sm font-extrabold text-gray-900 mt-0.5">
                  {mod.title}
                </p>
                {mod.description && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {mod.description}
                  </p>
                )}
              </div>

              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 shrink-0 mt-0.5">
                <span>
                  {lessons.length}{" "}
                  {lessons.length === 1 ? "LESSON" : "LESSONS"}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                )}
              </div>
            </button>

            {isOpen && (
              <div className="p-4 space-y-2.5 bg-white">
                {lessons.map((lesson, idx) => {
                  const isCompleted = completedSet.has(lesson.id);
                  const TypeIcon = getLessonTypeIcon(lesson.type);

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => onSelectLesson?.(lesson, mod)}
                      role={onSelectLesson ? "button" : undefined}
                      tabIndex={onSelectLesson ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && onSelectLesson) {
                          onSelectLesson(lesson, mod);
                        }
                      }}
                      className={`p-3.5 rounded-xl border border-gray-100 flex items-start justify-between gap-3 transition-colors ${
                        onSelectLesson
                          ? "hover:border-[#16730F]/30 hover:bg-[#F9FCF9] cursor-pointer"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-[#EEF5EE] text-[#16730F] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900">
                            {lesson.title}
                          </p>
                          {lesson.summary && (
                            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                              {lesson.summary}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-2 text-[11px] text-gray-400 shrink-0 mt-0.5">
                        <span>{lesson.durationMinutes}m</span>
                        <TypeIcon className="w-3.5 h-3.5 text-gray-400" />
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-[#16730F]" />
                        ) : (
                          <PlayCircle className="w-4 h-4 text-gray-300" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


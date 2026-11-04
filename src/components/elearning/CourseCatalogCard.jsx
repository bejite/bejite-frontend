import React from "react";
import {
  Building2,
  Clock,
  CheckCircle2,
  ChevronRight,
  PlayCircle,
  Layers,
} from "lucide-react";
import ELearningBadge from "./ELearningBadge";
import ELearningButton from "./ELearningButton";

/**
 * Reusable Catalogue Course Card used in Partner Catalogue and Explore Courses.
 * Matches Figma Image 2 with dual-state rendering:
 * - Unenrolled: shows price badge ("Free" or e.g. "N50,000"), features, and "View Course >" button.
 * - Enrolled ("In Progress"): shows progress bar, % complete, and 3 actions ("Continue/Start Learning", "Progress", "Overview").
 */
export default function CourseCatalogCard({
  course,
  onViewCourse,
  onContinueCourse,
  onProgressCourse,
  ctaLabel = "View Course",
}) {
  if (!course) return null;

  const isEnrolled = Boolean(course.enrolled);
  const percent = course.overallPercent ?? 0;
  const isStarted = percent > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-[#16730F]/40 transition-all">
      <div>
        {course.coverImage && (
          <div className="h-36 w-full overflow-hidden border-b border-gray-100 bg-[#F2F6F2]">
            <img
              src={course.coverImage}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Tinted Header Band */}
        <div className="bg-[#F2F6F2] px-5 py-4 border-b border-gray-100 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="bg-[#E5EBE5] text-gray-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {course.categoryUpper || course.category}
            </span>

            {isEnrolled ? (
              <span className="bg-[#E5EBE5] text-gray-700 text-[10px] font-bold px-3 py-1 rounded-full">
                In Progress
              </span>
            ) : course.isPaid ? (
              <span className="bg-[#133023] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                {course.priceBadge || "Paid Course"}
              </span>
            ) : (
              <span className="bg-[#16730F] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                Free
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="font-bold text-gray-800">{course.level}</span>
            <span className="inline-flex items-center gap-1.5 text-gray-500 font-medium">
              <Layers className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              {course.totalModules || course.modules?.length || 2} modules • {course.totalLessons || 4} lessons
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-2.5">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#16730F]">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span>{course.partnerName}</span>
          </div>

          <h3 className="text-base font-extrabold text-gray-900 leading-snug">
            {course.title}
          </h3>

          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
            {course.summary}
          </p>

          {!isEnrolled ? (
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-gray-700 font-medium">
              {course.quiz && (
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#16730F]" />
                  Knowledge Quiz
                </span>
              )}
              {course.deliverable && (
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#16730F]" />
                  Practical Project
                </span>
              )}
            </div>
          ) : (
            <div className="pt-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Progress</span>
                <span className="font-bold text-[#16730F]">{percent}% Complete</span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#16730F] transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5">
                <span>
                  {course.completedLessonsCount ?? (isStarted ? 3 : 0)} of {course.totalLessons} lessons finished
                </span>
                <span>
                  {percent === 0
                    ? "Lesson pending"
                    : course.quizState?.passed
                      ? "Quiz passed"
                      : "Quiz pending"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-5 pb-5 pt-2">
        {!isEnrolled ? (
          <button
            type="button"
            onClick={() => onViewCourse?.(course)}
            className="w-full bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-xs sm:text-sm py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <span>{ctaLabel}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => onContinueCourse?.(course)}
              className="flex-1 min-w-[140px] bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              <PlayCircle className="w-4 h-4 shrink-0" />
              <span>{isStarted ? "Continue Learning" : "Start Learning"}</span>
            </button>

            <button
              type="button"
              onClick={() => onProgressCourse?.(course)}
              className="flex-1 sm:flex-initial border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs py-2.5 px-3.5 rounded-xl transition-colors cursor-pointer text-center"
            >
              Progress
            </button>

            <button
              type="button"
              onClick={() => onViewCourse?.(course)}
              className="flex-1 sm:flex-initial border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs py-2.5 px-3.5 rounded-xl transition-colors cursor-pointer text-center"
            >
              Overview
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


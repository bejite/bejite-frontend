import React from "react";
import { Building2, Box, PlayCircle } from "lucide-react";
import ELearningButton from "./ELearningButton";

function getPendingRequirementLabel(course) {
  if (course?.criteria?.allComplete) return "Completed";
  if ((course?.completedLessonsCount || 0) === 0) return "Lesson pending";
  if (course?.quiz && !course?.criteria?.quizSatisfied) return "Quiz pending";
  if (course?.deliverable && !course?.criteria?.deliverableSatisfied) {
    return "Project pending";
  }
  return "Lesson pending";
}

/**
 * Reusable My Learning Course Card (2-column grid card on the My Learning / View All Courses page).
 */
export default function MyLearningCourseCard({
  course,
  onPrimaryAction,
  onProgressClick,
  onOverviewClick,
}) {
  if (!course) return null;

  const isCompleted = Boolean(course.criteria?.allComplete);
  const completedLessons = course.completedLessonsCount || 0;
  const totalLessons = course.totalLessons || 0;
  const hasStarted = completedLessons > 0;
  const progressPercent = isCompleted ? 100 : course.lessonPercent || 0;

  const primaryLabel = isCompleted
    ? "Review Course"
    : hasStarted
      ? "Continue Learning"
      : "Start Learning";

  const statusBadgeText = isCompleted ? "Completed" : "In Progress";
  const pendingText = getPendingRequirementLabel(course);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-[#16730F]/35 transition-all">
      <div>
        {/* Soft Sage Header Band */}
        <div className="bg-[#F4F8F4] px-5 py-4 border-b border-gray-200/80 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E8EFE8] text-[#1D352B] text-[10px] font-extrabold uppercase tracking-wider">
              {course.categoryUpper || course.category}
            </span>

            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                isCompleted
                  ? "bg-[#DCFCE7] text-[#16730F]"
                  : "bg-[#D8E2DA] text-[#2F473C]"
              }`}
            >
              {statusBadgeText}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-extrabold text-[#112A20]">
              {course.level}
            </span>

            <span className="inline-flex items-center gap-1.5 text-[#5B7065] font-medium">
              <Box className="w-3.5 h-3.5 text-[#7A9185] shrink-0" />
              <span>
                {course.totalModules} modules • {totalLessons} lessons
              </span>
            </span>
          </div>
        </div>

        {/* Main Card Body */}
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16730F]">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>{course.partnerName}</span>
            </div>

            <h3 className="text-base sm:text-[17px] font-extrabold text-[#112A20] tracking-tight leading-snug">
              {course.title}
            </h3>

            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
              {course.summary}
            </p>
          </div>

          {/* Progress Block */}
          <div className="pt-0.5">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-gray-500 font-medium">Progress</span>
              <span className="font-extrabold text-[#16A34A]">
                {progressPercent}% Complete
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-[#EEF2EF] overflow-hidden mt-1.5">
              <div
                className="h-full rounded-full bg-[#19A34A] transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.max(0, progressPercent))}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-[11px] text-gray-400 mt-1.5">
              <span>
                {completedLessons} of {totalLessons} lessons finished
              </span>
              <span>{pendingText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Row */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 flex flex-wrap sm:flex-nowrap items-center gap-2">
        <ELearningButton
          variant="primary"
          size="md"
          leftIcon={PlayCircle}
          onClick={() => onPrimaryAction?.(course)}
          className="flex-1 min-w-[140px]"
        >
          {primaryLabel}
        </ELearningButton>

        <ELearningButton
          variant="outline"
          size="md"
          onClick={() => onProgressClick?.(course)}
          className="px-3.5 text-gray-700 font-medium flex-1 sm:flex-initial"
        >
          Progress
        </ELearningButton>

        <ELearningButton
          variant="outline"
          size="md"
          onClick={() => onOverviewClick?.(course)}
          className="px-3.5 text-gray-700 font-medium flex-1 sm:flex-initial"
        >
          Overview
        </ELearningButton>
      </div>
    </div>
  );
}


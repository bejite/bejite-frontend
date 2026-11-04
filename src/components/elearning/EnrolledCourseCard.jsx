import React from "react";
import { Building2, PlayCircle, CheckCircle2 } from "lucide-react";
import ELearningBadge from "./ELearningBadge";
import ELearningButton from "./ELearningButton";
import CourseProgressBar from "./CourseProgressBar";

/**
 * Reusable Enrolled Course Card used in Learning Dashboard and My Learning.
 */
export default function EnrolledCourseCard({
  course,
  onContinue,
  onViewDetails,
  onTrackProgress,
  progressMode = "lessons",
}) {
  if (!course) return null;

  const percent =
    progressMode === "overall" ? course.overallPercent : course.lessonPercent;
  const nextLessonTitle =
    course.nextLesson?.title || "Review Course Curriculum";

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left Info & Progress */}
        <div className="flex-1 min-w-0 md:pr-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <ELearningBadge variant="level">
              {course.levelUpper || course.level}
            </ELearningBadge>

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#16730F]">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>{course.partnerName}</span>
            </span>
          </div>

          <h3 className="text-lg sm:text-[19px] font-extrabold text-gray-900 mt-2.5 leading-snug">
            {course.title}
          </h3>

          <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
            {course.summary}
          </p>

          <CourseProgressBar
            className="mt-4 max-w-xl"
            label="Overall Course Progress"
            percent={percent}
            rightText={`${percent}% Complete`}
            footer={
              <>
                <span className="text-gray-400">Next Lesson: </span>
                <span className="font-bold text-gray-800">
                  {nextLessonTitle}
                </span>
              </>
            }
          />
        </div>

        {/* Right Action Stack */}
        <div className="w-full md:w-[212px] shrink-0 flex flex-col gap-2">
          <ELearningButton
            variant="primary"
            fullWidth
            leftIcon={PlayCircle}
            onClick={() => onContinue?.(course)}
          >
            Continue Learning
          </ELearningButton>

          <ELearningButton
            variant="outline"
            fullWidth
            onClick={() => onViewDetails?.(course)}
          >
            View Details & Syllabus
          </ELearningButton>

          <ELearningButton
            variant="soft"
            fullWidth
            leftIcon={CheckCircle2}
            onClick={() => onTrackProgress?.(course)}
          >
            Track Progress & Criteria
          </ELearningButton>
        </div>
      </div>
    </div>
  );
}


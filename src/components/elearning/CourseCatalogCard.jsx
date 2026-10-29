import React from "react";
import {
  Building2,
  Clock,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import ELearningBadge from "./ELearningBadge";
import ELearningButton from "./ELearningButton";

/**
 * Reusable Catalogue Course Card used in Partner Catalogue and Explore Courses.
 */
export default function CourseCatalogCard({
  course,
  onViewCourse,
  ctaLabel = "View Course",
}) {
  if (!course) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-[#16730F]/40 transition-all">
      <div>
        {/* Tinted Header Band */}
        <div className="bg-[#F2F6F2] px-5 py-4 border-b border-gray-100 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <ELearningBadge variant="category">
              {course.categoryUpper || course.category}
            </ELearningBadge>

            <ELearningBadge
              variant={course.isPaid ? "darkForest" : "solidGreen"}
            >
              {course.priceBadge || (course.isPaid ? "Paid Course" : "Free")}
            </ELearningBadge>
          </div>

          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="font-bold text-gray-800">{course.level}</span>
            <span className="inline-flex items-center gap-1 text-gray-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              {course.totalModules} Modules • {course.totalLessons} Lessons
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

          <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px] text-gray-600 font-medium">
            {course.quiz && (
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16730F]" />
                Knowledge Quiz
              </span>
            )}
            {course.deliverable && (
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16730F]" />
                Practical Project
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-5 pb-5">
        <ELearningButton
          variant="primary"
          fullWidth
          rightIcon={ChevronRight}
          onClick={() => onViewCourse?.(course)}
        >
          {ctaLabel}
        </ELearningButton>
      </div>
    </div>
  );
}


import React from "react";
import { Layers, BookOpen, Building2 } from "lucide-react";

/**
 * Reusable Course Order Summary Card for Course Checkout (matching Image 3 & Image 5).
 * Features a dark badge thumbnail with price on the left, and course metadata on the right.
 */
export default function CourseOrderSummaryCard({ course }) {
  if (!course) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
        COURSE ORDER SUMMARY
      </p>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        {/* Dark Thumbnail Block with Price (Image 3) */}
        <div className="bg-[#0B1510] text-white rounded-2xl p-4 flex flex-col justify-between w-full sm:w-44 h-28 shrink-0 shadow-sm">
          <div>
            <span className="bg-[#1C2C24] text-[#A6D5BC] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              COURSE ACCESS
            </span>
          </div>
          <div>
            <span className="text-2xl font-extrabold tracking-tight text-white">
              {course.priceBadge || "N50,000"}
            </span>
          </div>
        </div>

        {/* Course Details Info */}
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="bg-[#EFF5EF] text-gray-700 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
              {course.category}
            </span>
            <span className="bg-[#EFF5EF] text-gray-700 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
              Access: Paid Course
            </span>
          </div>

          <h3 className="text-base font-extrabold text-[#112A20] leading-snug">
            {course.title}
          </h3>

          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {course.summary}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 pt-0.5">
            <span className="inline-flex items-center gap-1 font-medium">
              <Layers className="w-3 h-3 text-[#16730F]" />
              {course.totalModules || course.modules?.length || 2} Modules
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 font-medium">
              <BookOpen className="w-3 h-3 text-[#16730F]" />
              {course.totalLessons || 4} Lessons
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 font-medium">
              <Building2 className="w-3 h-3 text-[#16730F]" />
              Partner: {course.partnerName || "Digital Growth Academy"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatCourseRelativeTime } from "../../services/elearningService";

function renderStatusBadge(status) {
  const normalized = String(status || "draft").toLowerCase();
  if (normalized === "published") {
    return (
      <span className="inline-flex items-center justify-center rounded-full bg-[#E5F4E6] text-[#16730F] font-bold text-xs px-4 py-1.5 min-w-[92px]">
        Published
      </span>
    );
  }
  if (normalized === "in_review") {
    return (
      <span className="inline-flex items-center justify-center rounded-full bg-[#FFF5E8] text-[#D97706] font-bold text-xs px-4 py-1.5 min-w-[92px]">
        In review
      </span>
    );
  }
  if (normalized === "archived") {
    return (
      <span className="inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-500 font-bold text-xs px-4 py-1.5 min-w-[92px]">
        Archived
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center rounded-full bg-[#ECEFED] text-[#374151] font-bold text-xs px-4 py-1.5 min-w-[92px]">
      Draft
    </span>
  );
}

/**
 * Reusable Recruiter "My Courses" table card matching Figma Image 2.
 */
export default function RecruiterCoursesTable({
  courses = [],
  totalCount = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onViewCourse,
  onEditCourse,
}) {
  return (
    <div className="rounded-2xl sm:rounded-3xl bg-white border border-[#E5ECE7] p-4 sm:p-7 shadow-xs">
      {/* Header Row */}
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#112A20]">
            My Courses
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#6B7B73]">
            View and manage the courses you have created.
          </p>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full border border-[#E5ECE7] bg-white px-4 py-1.5 text-xs font-medium text-[#374151]">
          Showing{" "}
          <strong className="font-extrabold text-[#16730F]">{totalCount}</strong>{" "}
          {totalCount === 1 ? "Course" : "Courses"}
        </span>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-[#EDF2EE]">
        <table className="w-full min-w-[780px] border-collapse text-left">
          <thead>
            <tr className="bg-[#183B2E] text-white text-[11px] font-bold uppercase tracking-wider">
              <th className="py-4 pl-6 pr-4 rounded-tl-2xl">Courses</th>
              <th className="py-4 px-4 text-center">Learning Level</th>
              <th className="py-4 px-4">Access</th>
              <th className="py-4 px-4">Last Updated</th>
              <th className="py-4 px-4 text-center">Status</th>
              <th className="py-4 pl-4 pr-6 text-right rounded-tr-2xl">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#EEF3EF] text-sm">
            {courses.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-14 px-6 text-center text-sm text-gray-500"
                >
                  No courses match your current filters. Click{" "}
                  <span className="font-bold text-[#16730F]">+ Create Course</span>{" "}
                  above to author a new course.
                </td>
              </tr>
            ) : (
              courses.map((course) => {
                const isPaid = Boolean(course.pricing?.isPaid);
                return (
                  <tr
                    key={course.id}
                    className="hover:bg-[#F9FCFA] transition-colors"
                  >
                    <td className="py-5 pl-6 pr-4 max-w-[300px]">
                      <button
                        type="button"
                        onClick={() =>
                          onViewCourse ? onViewCourse(course) : onEditCourse?.(course)
                        }
                        className="text-left group focus:outline-none"
                      >
                        <div className="font-bold text-xs sm:text-sm text-[#16730F] group-hover:underline">
                          {course.title || "Untitled Course"}
                        </div>
                        <p className="mt-1 text-xs text-[#6B7B73] line-clamp-1">
                          {course.summary || "No course description added yet."}
                        </p>
                      </button>
                    </td>

                    <td className="py-5 px-4 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-[#F1F4F2] text-[#1F2937] font-semibold text-xs px-4 py-1.5 min-w-[96px]">
                        {course.levelShort || "Beginner"}
                      </span>
                    </td>

                    <td className="py-5 px-4 font-bold text-xs sm:text-sm text-[#374151]">
                      {isPaid ? "Paid" : "Free"}
                    </td>

                    <td className="py-5 px-4 text-xs sm:text-sm text-[#4B5563]">
                      {formatCourseRelativeTime(course.updatedAt, "10 mins ago")}
                    </td>

                    <td className="py-5 px-4 text-center">
                      {renderStatusBadge(course.status)}
                    </td>

                    <td className="py-5 pl-4 pr-6 text-right">
                      <button
                        type="button"
                        onClick={() => onViewCourse?.(course)}
                        className="inline-flex items-center justify-center rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-xs px-6 py-2.5 transition-colors shadow-xs"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="mt-5 pt-3 border-t border-[#F0F4F1] flex flex-wrap items-center justify-between gap-4 text-xs text-[#6B7B73]">
        <div>
          Showing{" "}
          <strong className="font-bold text-[#112A20]">
            {totalPages > 0 ? currentPage : 0}
          </strong>{" "}
          to{" "}
          <strong className="font-bold text-[#112A20]">
            {Math.max(1, totalPages)}
          </strong>{" "}
          exercises
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange?.(currentPage - 1)}
            aria-label="Previous page"
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: Math.max(1, totalPages) }, (_, idx) => idx + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange?.(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                  pageNum === currentPage
                    ? "bg-[#183B2E] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {pageNum}
              </button>
            )
          )}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange?.(currentPage + 1)}
            aria-label="Next page"
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}


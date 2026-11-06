import React from "react";

/**
 * Reusable Top Banner for the Practical Project Deliverable Workspace.
 */
export default function ProjectWorkspaceBanner({
  title,
  courseTitle,
  status = "Not Yet Started",
  isSubmitted = false,
  onCourseClick,
}) {
  return (
    <div className="bg-[#EFF5EF] border border-[#DCE8DC] rounded-2xl px-6 py-6 sm:px-7 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#112A20] tracking-tight">
          {title}
        </h1>

        {courseTitle && (
          <p className="text-xs sm:text-sm text-[#4A6358] mt-1">
            <span>Course: </span>
            {onCourseClick ? (
              <button
                type="button"
                onClick={onCourseClick}
                className="font-medium hover:text-[#16730F] hover:underline cursor-pointer"
              >
                {courseTitle}
              </button>
            ) : (
              <span>{courseTitle}</span>
            )}
          </p>
        )}
      </div>

      <span
        className={`inline-flex items-center self-start sm:self-center px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 ${
          isSubmitted
            ? "bg-[#DCFCE7] text-[#16730F] border border-[#BBF7D0]"
            : "bg-[#DFE6DF] text-[#4A5D52]"
        }`}
      >
        {status}
      </span>
    </div>
  );
}


import React, { useRef, useState } from "react";
import { Calendar, ChevronDown, Search, X } from "lucide-react";

const formatChipDate = (isoDay) => {
  if (!isoDay) return "";
  const date = new Date(`${isoDay}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDay;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const buildDateRangeLabel = (dateFrom, dateTo) => {
  if (dateFrom && dateTo) {
    const start = new Date(`${dateFrom}T00:00:00`);
    const end = new Date(`${dateTo}T00:00:00`);
    if (
      !Number.isNaN(start.getTime()) &&
      !Number.isNaN(end.getTime()) &&
      start.getFullYear() === end.getFullYear()
    ) {
      const startPart = start.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      return `${startPart} - ${formatChipDate(dateTo)}`;
    }
    return `${formatChipDate(dateFrom)} - ${formatChipDate(dateTo)}`;
  }
  if (dateFrom) return `From ${formatChipDate(dateFrom)}`;
  if (dateTo) return `Until ${formatChipDate(dateTo)}`;
  return "Select dates";
};

/**
 * Reusable pill-styled filter bar for Recruiter E-Learning Management.
 */
export default function ELearningManagementFilterBar({
  searchQuery = "",
  onSearchChange,
  courseFilter = "all",
  onCourseFilterChange,
  statusFilter = "all",
  onStatusFilterChange,
  dateFrom = "",
  dateTo = "",
  onDateFromChange,
  onDateToChange,
  onClearDate,
  onApply,
  onReset,
}) {
  const [dateOpen, setDateOpen] = useState(false);
  const popoverRef = useRef(null);
  const hasDateRange = Boolean(dateFrom || dateTo);

  return (
    <div className="rounded-3xl bg-[#EFF5EF] border border-[#D8E6D8] p-3.5 sm:p-4 flex flex-col xl:flex-row items-stretch xl:items-center gap-2.5 sm:gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-0">
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search courses by name..."
          className="w-full rounded-full bg-white border border-[#E2ECE3] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#16730F]/30"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {/* All Courses Filter */}
        <div className="relative">
          <select
            value={courseFilter}
            onChange={(e) => onCourseFilterChange?.(e.target.value)}
            aria-label="Filter courses"
            className="appearance-none rounded-full bg-white border border-[#CEDBCE] pl-4 pr-9 py-2.5 text-xs font-semibold text-[#183B2E] focus:outline-none focus:ring-2 focus:ring-[#16730F]/30 cursor-pointer"
          >
            <option value="all">All Courses</option>
            <option value="free">Free Courses</option>
            <option value="paid">Paid Courses</option>
            <option value="Beginner">Beginner Level</option>
            <option value="Intermediate">Intermediate Level</option>
            <option value="Advanced">Advanced Level</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#183B2E] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* All Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange?.(e.target.value)}
            aria-label="Filter by status"
            className="appearance-none rounded-full bg-white border border-[#CEDBCE] pl-4 pr-9 py-2.5 text-xs font-semibold text-[#183B2E] focus:outline-none focus:ring-2 focus:ring-[#16730F]/30 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="in_review">In review</option>
            <option value="archived">Archived</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#183B2E] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Date Range Chip */}
        <div className="relative" ref={popoverRef}>
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#CEDBCE] px-4 py-2.5 text-xs font-semibold text-[#183B2E]">
            <button
              type="button"
              onClick={() => setDateOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 focus:outline-none"
            >
              <Calendar className="w-3.5 h-3.5 text-[#183B2E]" />
              <span className="whitespace-nowrap">
                {buildDateRangeLabel(dateFrom, dateTo)}
              </span>
            </button>
            {hasDateRange && (
              <button
                type="button"
                onClick={() => {
                  onClearDate?.();
                  setDateOpen(false);
                }}
                aria-label="Clear date range"
                className="text-gray-500 hover:text-gray-800 focus:outline-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {dateOpen && (
            <div className="absolute right-0 mt-2 w-68 rounded-2xl bg-white border border-gray-200 shadow-xl p-4 z-30 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Course Date Range
              </p>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-gray-600">From</span>
                <input
                  type="date"
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={(e) => onDateFromChange?.(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#16730F]/30"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-gray-600">To</span>
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => onDateToChange?.(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#16730F]/30"
                />
              </label>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onClearDate?.()}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800 px-2 py-1"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setDateOpen(false)}
                  className="rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white text-xs font-bold px-4 py-1.5"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Apply & Reset */}
        <button
          type="button"
          onClick={onApply}
          className="rounded-full bg-[#BDD6BF] hover:bg-[#ADCAAD] text-[#183B2E] font-bold text-xs px-5 py-2.5 transition-colors whitespace-nowrap"
        >
          Apply Filter
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full bg-[#DDE8DD] hover:bg-[#CFDDCF] text-[#183B2E] font-semibold text-xs px-5 py-2.5 transition-colors whitespace-nowrap"
        >
          Reset
        </button>
      </div>
    </div>
  );
}


import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function BirthdayPagination({
  currentPage,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <span className="text-xs sm:text-sm text-gray-600 font-medium">
        Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)} to{" "}
        {Math.min(currentPage * pageSize, totalCount)} of {totalCount} birthdays
      </span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="px-3 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 font-medium flex items-center gap-1"
        >
          <FaChevronLeft className="text-[10px]" />
          <span>Prev</span>
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
          const isActive = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`w-9 h-9 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                isActive
                  ? "bg-[#16730F] text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="px-3 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 font-medium flex items-center gap-1"
        >
          <span>Next</span>
          <FaChevronRight className="text-[10px]" />
        </button>
      </div>
    </div>
  );
}

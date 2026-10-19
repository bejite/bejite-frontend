import { useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import RecruiterSelect from "../RecruiterSelect";

const NotificationPagination = ({
  currentPage = 1,
  pageSize = 6,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 6, 10, 15, 20],
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with smart ellipsis
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      const left = Math.max(2, currentPage - 1);
      const right = Math.min(totalPages - 1, currentPage + 1);

      if (left > 2) {
        pages.push("ellipsis-left");
      }

      for (let i = left; i <= right; i++) {
        pages.push(i);
      }

      if (right < totalPages - 1) {
        pages.push("ellipsis-right");
      }

      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  const selectOptions = pageSizeOptions.map((size) => ({
    value: size,
    label: `${size} / page`,
  }));

  if (totalItems === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
      {/* Left side: Results counter & Page Size Selector */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium w-full sm:w-auto justify-between sm:justify-start">
        <span>
          Showing <strong className="text-gray-900 font-bold">{startIndex}</strong> to{" "}
          <strong className="text-gray-900 font-bold">{endIndex}</strong> of{" "}
          <strong className="text-gray-900 font-bold">{totalItems}</strong> alerts
        </span>

        {/* Page size dropdown using app's RecruiterSelect */}
        <div className="w-[110px]">
          <RecruiterSelect
            id="pagination-page-size"
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange && onPageSizeChange(Number(e.target.value));
            }}
            options={selectOptions}
            placeholder="Per page"
            closeBtn={false}
          />
        </div>
      </div>

      {/* Right side: Advanced Pagination Controls */}
      <div className="flex items-center gap-1.5">
        {/* First Page Button */}
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-xl border text-xs font-medium transition-all ${
            currentPage === 1
              ? "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50/50"
              : "border-gray-200 text-gray-600 hover:text-[#16730F] hover:bg-[#16730F]/5 hover:border-[#16730F]/30 active:scale-95 cursor-pointer shadow-2xs"
          }`}
          title="First page"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* Previous Page Button */}
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
            currentPage === 1
              ? "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50/50"
              : "border-gray-200 text-gray-700 hover:text-[#16730F] hover:bg-[#16730F]/5 hover:border-[#16730F]/30 active:scale-95 cursor-pointer shadow-2xs"
          }`}
          title="Previous page"
        >
          <ChevronLeft size={15} />
          <span className="hidden md:inline">Prev</span>
        </button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, idx) => {
            if (page === "ellipsis-left" || page === "ellipsis-right") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-gray-400 font-bold text-xs"
                >
                  •••
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                type="button"
                key={page}
                onClick={() => onPageChange && onPageChange(page)}
                className={`h-8 min-w-8 px-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-br from-[#16730F] to-[#0e4d0a] text-white shadow-sm scale-105"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Page Button */}
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
            currentPage === totalPages
              ? "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50/50"
              : "border-gray-200 text-gray-700 hover:text-[#16730F] hover:bg-[#16730F]/5 hover:border-[#16730F]/30 active:scale-95 cursor-pointer shadow-2xs"
          }`}
          title="Next page"
        >
          <span className="hidden md:inline">Next</span>
          <ChevronRight size={15} />
        </button>

        {/* Last Page Button */}
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-xl border text-xs font-medium transition-all ${
            currentPage === totalPages
              ? "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50/50"
              : "border-gray-200 text-gray-600 hover:text-[#16730F] hover:bg-[#16730F]/5 hover:border-[#16730F]/30 active:scale-95 cursor-pointer shadow-2xs"
          }`}
          title="Last page"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default NotificationPagination;

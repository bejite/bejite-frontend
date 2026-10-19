import { motion } from "framer-motion";
import { Bell, AlertCircle } from "lucide-react";

const NotificationEmptyState = ({
  isFiltered = false,
  isError = false,
  onRetry,
  onResetFilters,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs"
    >
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          isError ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-400"
        }`}
      >
        {isError ? <AlertCircle size={28} /> : <Bell size={28} />}
      </div>
      <h3 className="text-base font-bold text-gray-800">
        {isError
          ? "Could not load notifications"
          : isFiltered
            ? "No notifications match your filters"
            : "You're all caught up"}
      </h3>
      <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
        {isError
          ? "Check your connection and try again. Pending reviews will appear here once loaded."
          : isFiltered
            ? "Try clearing your search query or changing your category and status filters."
            : "There are no pending recruiter verification requests or AdPro campaigns to review."}
      </p>
      {isError && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#16730F] text-white text-xs font-bold rounded-xl hover:bg-[#125a0c] shadow-xs transition-all cursor-pointer"
        >
          Retry
        </button>
      )}
      {!isError && isFiltered && onResetFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#16730F] text-white text-xs font-bold rounded-xl hover:bg-[#125a0c] shadow-xs transition-all cursor-pointer"
        >
          Reset all filters
        </button>
      )}
    </motion.div>
  );
};

export default NotificationEmptyState;

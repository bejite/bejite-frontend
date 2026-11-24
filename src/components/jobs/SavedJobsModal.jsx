import { useRef, useEffect } from "react";
import { FaTimes, FaRegBookmark, FaCheckCircle } from "react-icons/fa";
import { formatSalary } from "../../utils/checksFormat";
import {
  hasServerAppliedFlag,
  resolveAppliedJobsUserScope,
  useAppliedJobsStore,
} from "../../store/useAppliedJobsStore";

export const SavedJobsModal = ({
  savedJobs,
  jobs,
  onClose,
  onJobClick,
  onUnsave,
}) => {
  const modalRef = useRef(null);
  const scope = resolveAppliedJobsUserScope();
  const appliedMap = useAppliedJobsStore(
    (state) => state.appliedByScope[scope] || {},
  );

  const savedJobDetails = savedJobs
    .map((saved) => jobs.find((job) => job.id === saved.jobId))
    .filter((job) => job !== undefined);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex justify-between items-center">
          <h2 className="text-xl font-bold">Saved Jobs</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes />
          </button>
        </div>
        <div className="p-5">
          {savedJobDetails.length === 0 ? (
            <div className="text-center py-12">
              <FaRegBookmark className="mx-auto text-gray-300 text-5xl mb-4" />
              <p className="text-gray-500">No saved jobs yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Save jobs you're interested in to review later
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedJobDetails.map((job) => (
                <div
                  key={job.id}
                  className="border rounded-xl p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => onJobClick(job)}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-gray-900 hover:text-[#16730F] transition-colors">
                          {job.title}
                        </h3>
                        {(Boolean(appliedMap[String(job.id)]) ||
                          hasServerAppliedFlag(job)) && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-[#16730F] border border-[#16730F]/25 text-xs font-semibold px-2 py-0.5 rounded-full">
                            <FaCheckCircle className="text-[10px]" />
                            Applied
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {job.company} • {job.location}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatSalary(job)}
                      </p>
                    </div>
                    <button
                      onClick={() => onUnsave(job.id)}
                      className="text-red-500 text-sm hover:underline ml-4"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

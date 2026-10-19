import React, { useEffect, useRef, useState } from "react";
import { FaCheckCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function CandidateListTable({
  candidates = [],
  onViewCandidateProfile,
  onFeedback,
  onMoveStage,
  onBulkMove,
  onBulkFeedback,
  selectionResetKey = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const selectAllRef = useRef(null);

  useEffect(() => {
    setSelectedIds([]);
  }, [selectionResetKey]);

  useEffect(() => {
    const visible = new Set(candidates.map((c) => c.id));
    setSelectedIds((prev) => {
      const next = prev.filter((id) => visible.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [candidates]);

  const allSelected =
    candidates.length > 0 && selectedIds.length === candidates.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(candidates.map((c) => c.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const selectedCandidates = candidates.filter((c) =>
    selectedIds.includes(c.id),
  );

  const getOutcomeBadge = (outcome) => {
    const formatted = (outcome || "").toLowerCase();
    if (
      formatted === "passed" ||
      formatted === "hired" ||
      formatted === "accepted"
    ) {
      return (
        <span className="inline-block bg-[#E6F4EA] text-[#16730F] text-xs font-semibold px-3 py-1 rounded-full text-center">
          {outcome}
        </span>
      );
    }
    if (
      formatted === "failed" ||
      formatted === "declined" ||
      formatted === "rejected"
    ) {
      return (
        <span className="inline-block bg-[#FDF2F2] text-[#D93838] text-xs font-semibold px-3 py-1 rounded-full text-center">
          {outcome}
        </span>
      );
    }
    return (
      <span className="inline-block bg-[#FEF3C7] text-[#D97706] text-xs font-semibold px-3 py-1 rounded-full text-center">
        Pending
      </span>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
      {selectedIds.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-[#EFF5F2] border-b border-[#D5E5DD]">
          <div className="text-sm font-bold text-[#1A3E32]">
            {selectedIds.length} candidate
            {selectedIds.length === 1 ? "" : "s"} selected
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onBulkMove && onBulkMove(selectedCandidates)}
              className="bg-white border border-gray-400 hover:bg-gray-100 text-gray-800 text-xs px-3.5 py-1.5 rounded-full font-bold transition-all shadow-xs active:scale-95"
            >
              Move
            </button>
            <button
              type="button"
              onClick={() => onBulkFeedback && onBulkFeedback(selectedCandidates)}
              className="bg-[#B45309] hover:bg-[#92400E] text-white text-xs px-3.5 py-1.5 rounded-full font-bold transition-all shadow-xs active:scale-95"
            >
              Send Feedback
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs font-bold text-gray-600 hover:text-[#1A3E32] px-2 py-1.5"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="w-full overflow-x-auto nfl-scroll">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-[#1A3E32] text-white text-[11px] font-bold uppercase tracking-wider">
              <th className="py-3.5 px-4 w-12 text-center rounded-tl-xl sm:rounded-none">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  aria-label="Select all candidates"
                  className="rounded text-[#16730F] focus:ring-[#16730F] h-4 w-4 accent-[#16730F] cursor-pointer"
                />
              </th>
              <th className="py-3.5 px-4">Candidate</th>
              <th className="py-3.5 px-4 text-center">Current Stage</th>
              <th className="py-3.5 px-4 text-center">Outcome</th>
              <th className="py-3.5 px-4 text-right rounded-tr-xl sm:rounded-none">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {candidates.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-gray-400 font-medium text-sm"
                >
                  No candidates found matching your filter criteria.
                </td>
              </tr>
            ) : (
              candidates.map((candidate) => (
                <tr
                  key={candidate.id}
                  className="hover:bg-emerald-50/30 transition-colors duration-150"
                >
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(candidate.id)}
                      onChange={() => toggleSelect(candidate.id)}
                      aria-label={`Select ${candidate.name}`}
                      className="rounded text-[#16730F] focus:ring-[#16730F] h-4 w-4 accent-[#16730F] cursor-pointer"
                    />
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          candidate.avatar ||
                          "/assets/images/photo_placeholder.png"
                        }
                        alt={candidate.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                        onError={(e) => {
                          e.currentTarget.src =
                            "/assets/images/photo_placeholder.png";
                        }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-[#1A3E32] truncate">
                          <span>{candidate.name}</span>
                          <FaCheckCircle className="text-[#16730F] text-xs shrink-0" />
                        </div>
                        <div className="text-xs text-gray-500 truncate font-normal">
                          {candidate.email}
                        </div>
                        {candidate.phone && (
                          <div className="text-xs text-gray-400 truncate font-normal">
                            {candidate.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <span className="inline-block bg-[#EAEAEA] text-[#374151] text-xs font-semibold px-3.5 py-1 rounded-full border border-gray-200">
                      {candidate.currentStage || "Invited"}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-center">
                    {getOutcomeBadge(candidate.outcome)}
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onFeedback && onFeedback(candidate)}
                        className="bg-[#B45309] hover:bg-[#92400E] text-white text-xs px-3.5 py-1.5 rounded-full font-bold transition-all shadow-xs active:scale-95"
                      >
                        Feedback
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveStage && onMoveStage(candidate)}
                        className="bg-white border border-gray-400 hover:bg-gray-100 text-gray-800 text-xs px-3.5 py-1.5 rounded-full font-bold transition-all shadow-xs active:scale-95"
                      >
                        Move
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onViewCandidateProfile &&
                          onViewCandidateProfile(candidate)
                        }
                        className="bg-[#16730F] hover:bg-[#125B0C] text-white text-xs px-3.5 py-1.5 rounded-full font-bold transition-all shadow-xs active:scale-95"
                      >
                        View Profile
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 bg-white">
        <div className="text-xs text-gray-500 font-medium">
          Showing <strong>1</strong> to <strong>{candidates.length}</strong>{" "}
          candidates
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            className="w-8 h-8 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <FaChevronLeft className="w-3 h-3" />
          </button>
          <span className="w-8 h-8 rounded-full bg-[#1A3E32] text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {currentPage}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            className="w-8 h-8 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <FaChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

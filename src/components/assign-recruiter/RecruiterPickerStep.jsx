import React from "react";
import { Check, RefreshCw, Search, X } from "lucide-react";
import DisplayNameWithBadge from "../DisplayNameWithBadge";
import RecruiterAvatar from "./RecruiterAvatar";
import Loader from "../ui/Loader";

/**
 * Step 1: Recruiter Picker Component.
 */
export default function RecruiterPickerStep({
  selectedRecruiter,
  isPickerOpen,
  editingDelegationId,
  onOpenPicker,
  onClosePicker,
  searchQuery,
  onSearchChange,
  recruiters = [],
  recruitersLoading = false,
  recruitersError = "",
  onRetry,
  onSelectRecruiter,
  assignedByRecruiterId = new Map(),
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-full bg-[#1A3E32] text-white text-xs font-bold flex items-center justify-center">
            1
          </span>
          <h3 className="text-sm font-bold text-gray-900">
            Select Recruiter
          </h3>
        </div>

        {selectedRecruiter && !isPickerOpen && !editingDelegationId && (
          <button
            type="button"
            onClick={onOpenPicker}
            className="text-xs font-semibold text-[#16730F] hover:underline cursor-pointer"
          >
            Change recruiter
          </button>
        )}
      </div>

      {/* Selected Recruiter Card */}
      {selectedRecruiter && !isPickerOpen ? (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border-2 border-[#16730F] bg-[#EAF5E9]/40">
          <div className="flex items-center gap-3 min-w-0">
            <RecruiterAvatar recruiter={selectedRecruiter} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <DisplayNameWithBadge
                  user={selectedRecruiter}
                  fallback={selectedRecruiter.name}
                  badgeSize="xs"
                  className="font-bold text-sm text-gray-900"
                />
                {selectedRecruiter.isCorporate && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    Corporate
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 truncate mt-0.5">
                {[
                  selectedRecruiter.jobTitle,
                  selectedRecruiter.companyName &&
                  selectedRecruiter.companyName !== selectedRecruiter.jobTitle
                    ? selectedRecruiter.companyName
                    : null,
                  selectedRecruiter.email,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#16730F] text-white text-xs font-semibold shrink-0">
            <Check className="w-3.5 h-3.5" />
            Selected
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search by recruiter name, email, role, or company..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1A3E32] focus:ring-2 focus:ring-[#1A3E32]/15 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange?.("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Directory Results */}
          <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50/40">
            {recruitersLoading ? (
              <div className="py-8">
                <Loader
                  fullscreen={false}
                  size="sm"
                  description="Loading recruiters..."
                />
              </div>
            ) : recruitersError ? (
              <div className="p-6 text-center space-y-2.5">
                <p className="text-sm font-medium text-red-600">
                  {recruitersError}
                </p>
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1A3E32] text-white text-xs font-semibold hover:bg-[#153329] transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try Again
                </button>
              </div>
            ) : recruiters.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm font-semibold text-gray-700">
                  No matching recruiters found
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {searchQuery.trim()
                    ? `No recruiter matched "${searchQuery}". Try another search term.`
                    : "No discoverable recruiters are available right now."}
                </p>
              </div>
            ) : (
              <>
                <div className="px-3.5 py-2 bg-white border-b border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <span>
                    {recruiters.length}{" "}
                    {recruiters.length === 1 ? "recruiter" : "recruiters"}{" "}
                    available
                  </span>
                  {selectedRecruiter && (
                    <button
                      type="button"
                      onClick={onClosePicker}
                      className="font-semibold text-[#16730F] hover:underline cursor-pointer"
                    >
                      Keep {selectedRecruiter.name}
                    </button>
                  )}
                </div>

                <div className="max-h-68 overflow-y-auto divide-y divide-gray-100 bg-white">
                  {recruiters.map((recruiter) => {
                    const recKey = String(recruiter.id || "")
                      .trim()
                      .toLowerCase();
                    const existing = recKey
                      ? assignedByRecruiterId.get(recKey)
                      : null;

                    return (
                      <div
                        key={recruiter.id}
                        onClick={() => onSelectRecruiter?.(recruiter)}
                        className="flex items-center justify-between gap-3 px-3.5 py-3 hover:bg-[#EAF5E9]/40 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <RecruiterAvatar
                            recruiter={recruiter}
                            sizeClass="w-10 h-10"
                            textClass="text-xs"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <DisplayNameWithBadge
                                user={recruiter}
                                fallback={recruiter.name}
                                badgeSize="xs"
                                className="font-semibold text-sm text-gray-900"
                              />
                              {recruiter.isCorporate && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                  Corporate
                                </span>
                              )}
                              {existing && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Assigned
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {[
                                recruiter.jobTitle,
                                recruiter.companyName &&
                                recruiter.companyName !== recruiter.jobTitle
                                  ? recruiter.companyName
                                  : null,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRecruiter?.(recruiter);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-[#1A3E32] hover:text-white text-gray-700 text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                        >
                          {existing ? "Edit Access" : "Select"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


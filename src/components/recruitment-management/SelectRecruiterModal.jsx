import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  FaTimes,
  FaSearch,
  FaUserCheck,
  FaSpinner,
  FaCheck,
  FaExclamationCircle,
  FaRedo,
  FaBuilding,
  FaEnvelope,
} from "react-icons/fa";
import { fetchRecruiters } from "../../services/recruitersApi";
import { profilePhotoUrl } from "../../utils/profilePhotoUrl";
import DisplayNameWithBadge from "../DisplayNameWithBadge";
import Loader from "../ui/Loader";

/**
 * Reusable modal component to browse, search, and select a recruiter
 * to assign as an interviewer for pipeline stages.
 * Strictly calls real API endpoints with no dummy data or fallbacks.
 */
export default function SelectRecruiterModal({
  isOpen,
  onClose,
  onSelect,
  currentValue = "",
  title = "Assign Interviewer",
  subtitle = "Search and assign a recruiter to conduct this interview stage.",
}) {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const searchInputRef = useRef(null);

  // Fetch recruiters on modal open
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      return;
    }

    let isCancelled = false;

    const loadRecruiters = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchRecruiters();
        if (!isCancelled) {
          setRecruiters(Array.isArray(data) ? data : []);

          // Preselect current recruiter if match found
          const trimmedCurrent = String(currentValue || "").trim().toLowerCase();
          if (trimmedCurrent) {
            const matched = (data || []).find(
              (r) =>
                r.name?.toLowerCase() === trimmedCurrent ||
                r.email?.toLowerCase() === trimmedCurrent
            );
            if (matched) {
              setSelectedRecruiter(matched);
            } else {
              setSelectedRecruiter(null);
            }
          } else {
            setSelectedRecruiter(null);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Failed to load recruiters:", err);
          setError(
            err.message || "Unable to retrieve recruiters from the directory. Please try again."
          );
          setRecruiters([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadRecruiters();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, currentValue]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filter recruiters based on search query
  const filteredRecruiters = useMemo(() => {
    if (!searchQuery.trim()) return recruiters;
    const q = searchQuery.trim().toLowerCase();
    return recruiters.filter((r) => {
      const name = (r.name || "").toLowerCase();
      const email = (r.email || "").toLowerCase();
      const jobTitle = (r.jobTitle || "").toLowerCase();
      const company = (r.companyName || "").toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        jobTitle.includes(q) ||
        company.includes(q)
      );
    });
  }, [recruiters, searchQuery]);

  if (!isOpen) return null;

  const handleCardClick = (recruiter) => {
    setSelectedRecruiter(recruiter);
  };

  const handleConfirm = () => {
    if (selectedRecruiter) {
      onSelect?.(selectedRecruiter.name, selectedRecruiter);
    }
    onClose?.();
  };

  const handleClearSelection = () => {
    setSelectedRecruiter(null);
    onSelect?.("", null);
    onClose?.();
  };

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecruiters({ query: searchQuery });
      setRecruiters(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.message || "Failed to connect to recruiters endpoint. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden p-5 sm:p-7 shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="select-recruiter-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors focus:outline-none z-10 cursor-pointer"
          aria-label="Close modal"
        >
          <FaTimes className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-4 shrink-0 pr-8">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#E6F4EA] text-[#16730F] flex items-center justify-center text-lg sm:text-xl shrink-0">
            <FaUserCheck />
          </div>
          <div className="min-w-0">
            <h3
              id="select-recruiter-title"
              className="text-lg sm:text-xl font-bold text-[#1A3E32] tracking-tight truncate"
            >
              {title}
            </h3>
            <p className="text-xs text-gray-500 font-normal mt-0.5 leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-3 shrink-0">
          <div className="relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by recruiter name, role, or company..."
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs sm:text-sm pl-10 pr-9 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16730F]/40 focus:border-[#16730F] font-medium transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
                aria-label="Clear search"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1.5 px-1">
            <span>
              {loading
                ? "Loading recruiters..."
                : `${filteredRecruiters.length} recruiter${
                    filteredRecruiters.length === 1 ? "" : "s"
                  } available`}
            </span>
            {selectedRecruiter && (
              <span className="text-[#16730F] font-semibold truncate max-w-[200px]">
                Selected: {selectedRecruiter.name}
              </span>
            )}
          </div>
        </div>

        {/* Recruiter List Body */}
        <div className="flex-1 min-h-[220px] max-h-[360px] overflow-y-auto nfl-scroll px-1 py-1 space-y-2 border border-gray-100 rounded-2xl bg-gray-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-center p-4">
              <Loader
                fullscreen={false}
                size="sm"
                description="Loading recruiters..."
              />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-48 text-center p-4">
              <FaExclamationCircle className="w-7 h-7 text-red-500 mb-2" />
              <p className="text-xs sm:text-sm font-semibold text-gray-800">
                Could not load recruiters
              </p>
              <p className="text-[11px] text-gray-500 mt-1 max-w-xs">{error}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#16730F] text-white hover:bg-[#125B0C] transition-colors cursor-pointer"
              >
                <FaRedo className="w-3 h-3" /> Retry
              </button>
            </div>
          ) : filteredRecruiters.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center p-4">
              <div className="w-10 h-10 rounded-full bg-gray-200/70 flex items-center justify-center text-gray-400 mb-2">
                <FaSearch className="w-4 h-4" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-700">
                No recruiters found
              </p>
              <p className="text-[11px] text-gray-400 mt-1 max-w-xs">
                {searchQuery
                  ? `No recruiters match "${searchQuery}". Try a different keyword.`
                  : "No recruiters are currently available in the directory."}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-2.5 text-xs font-semibold text-[#16730F] hover:underline cursor-pointer"
                >
                  Clear search filter
                </button>
              )}
            </div>
          ) : (
            filteredRecruiters.map((recruiter) => {
              const isSelected =
                selectedRecruiter?.id === recruiter.id ||
                (!selectedRecruiter &&
                  String(currentValue || "").trim().toLowerCase() ===
                    recruiter.name?.toLowerCase());

              const photoSrc = profilePhotoUrl(recruiter.profilePhoto);
              const initials =
                `${recruiter.firstName?.[0] || recruiter.name?.[0] || ""}${
                  recruiter.lastName?.[0] || ""
                }`.toUpperCase() || "R";

              return (
                <div
                  key={recruiter.id}
                  onClick={() => handleCardClick(recruiter)}
                  className={`group relative p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-[#E6F4EA] border-[#16730F] shadow-xs ring-1 ring-[#16730F]"
                      : "bg-white hover:bg-emerald-50/40 border-gray-200 hover:border-[#16730F]/40"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {photoSrc ? (
                        <img
                          src={photoSrc}
                          alt={recruiter.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove(
                              "hidden"
                            );
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-10 h-10 rounded-full bg-[#1A3E32] text-white flex items-center justify-center font-bold text-xs ${
                          photoSrc ? "hidden" : ""
                        }`}
                      >
                        {initials}
                      </div>
                    </div>

                    {/* Recruiter Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-[#1A3E32] truncate">
                          <DisplayNameWithBadge
                            user={recruiter}
                            fallback={recruiter.name}
                          />
                        </span>
                        {recruiter.isCorporate && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            Corporate
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5 truncate">
                        {recruiter.jobTitle && (
                          <span className="truncate">{recruiter.jobTitle}</span>
                        )}
                        {recruiter.companyName && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="inline-flex items-center gap-1 truncate text-gray-600">
                              <FaBuilding className="w-2.5 h-2.5 text-gray-400" />
                              {recruiter.companyName}
                            </span>
                          </>
                        )}
                      </div>

                      {recruiter.email && (
                        <p className="text-[10px] text-gray-400 truncate mt-0.5 flex items-center gap-1">
                          <FaEnvelope className="w-2.5 h-2.5 text-gray-300" />
                          {recruiter.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right side selection indicator */}
                  <div className="shrink-0">
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#16730F] text-white shadow-xs">
                        <FaCheck className="w-3 h-3" />
                        Selected
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(recruiter);
                        }}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 hover:bg-[#16730F] text-gray-700 hover:text-white transition-all cursor-pointer"
                      >
                        Select
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 pt-4 border-t border-gray-100 mt-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto bg-[#E5E7EB] hover:bg-gray-300 text-gray-800 font-bold px-5 py-2.5 rounded-full text-xs sm:text-sm transition-colors cursor-pointer active:scale-95"
            >
              Cancel
            </button>
            {currentValue && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="w-1/2 sm:w-auto text-gray-500 hover:text-red-600 font-semibold px-3 py-2.5 text-xs transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <button
            type="button"
            disabled={!selectedRecruiter}
            onClick={handleConfirm}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
              selectedRecruiter
                ? "bg-[#16730F] hover:bg-[#125B0C] text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
            }`}
          >
            Assign Recruiter
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState, useRef, useCallback } from "react";
import { API_URL } from "../../config";
import { pickAuthorProfilePhoto } from "../../utils/profileImageUtils";
import { profilePhotoUrl } from "../../utils/profilePhotoUrl";
import InterviewInviteModal from "./InterviewInviteModal";
import { useNavigate } from "react-router-dom";
import { formatDisplayPersonName, formatDisplayRole } from "../../utils/personDisplayName";
import DisplayNameWithBadge from "../DisplayNameWithBadge";
import { formatDisplayText } from "../../utils/displayFormatUtils";
import { filterAdminUsersFromSearch } from "../../utils/filterAdminUsers";
import AvailabilityStatusDot from "./AvailabilityStatusDot";
import { buildCandidateSearchParams } from "./buildCandidateSearchParams";

const CandidateSearchResults = ({
  onViewProfile,
  searchCriteria = {},
  compact = false,
  enabled = true,
}) => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [loadMoreError, setLoadMoreError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [accessBlock, setAccessBlock] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Refs to track and cancel duplicate requests (handles React StrictMode)
  const abortControllerRef = useRef(null);
  const requestIdRef = useRef(0);

  const formatCandidates = useCallback((candidatesData) => {
    const filtered = filterAdminUsersFromSearch(candidatesData);
    if (!Array.isArray(filtered)) {
      throw new Error("Invalid data format received from API");
    }

    return filtered.map((candidate) => {
      const bioRow = Array.isArray(candidate.user_bio)
        ? candidate.user_bio[0]
        : candidate.user_bio;
      const photoPath = pickAuthorProfilePhoto({
        profile_photo: candidate.profile_photo,
        profilePhoto: candidate.profilePhoto,
        image: bioRow?.profile_photo,
      });

      return {
        id: candidate.id,
        user_id: candidate.user_id ?? candidate.userId ?? null,
        name: formatDisplayPersonName(candidate, "Unknown User"),
        type: formatDisplayRole(candidate.role || "jobseeker"),
        role: candidate.role || "jobseeker",
        jobTitle: formatDisplayText(candidate.title) || "N/A",
        location:
          formatDisplayText(candidate.location || candidate.preferred_country) ||
          "Unknown",
        skills: candidate.skills || [],
        availability: candidate.availability || "Unknown",
        experienceYears: candidate.experience_years || 0,
        initials: `${candidate.first_name?.[0] || ""}${candidate.last_name?.[0] || ""}`,
        image: profilePhotoUrl(photoPath) ?? null,
        hasVerifiedBadge: Boolean(candidate.hasVerifiedBadge),
        first_name: candidate.first_name,
        last_name: candidate.last_name,
      };
    });
  }, []);

  const fetchCandidates = useCallback(
    async (pageNum, { append = false } = {}) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const currentRequestId = ++requestIdRef.current;

      try {
        if (append) {
          setLoadingMore(true);
          setLoadMoreError(null);
        } else {
          setLoading(true);
          setError(null);
          setAccessBlock(null);
          setLoadMoreError(null);
        }

        const queryParams = buildCandidateSearchParams(searchCriteria, pageNum, 10);
        const token =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("authToken") ||
          localStorage.getItem("token");
        const url = `${API_URL}/api/cv/employee/search?${queryParams.toString()}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          credentials: "include",
          signal: abortControllerRef.current.signal,
        });

        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          if (currentRequestId !== requestIdRef.current) {
            return;
          }

          console.error("API Error Response:", errorData);

          const errorCode = errorData.code;
          const errorMessage =
            errorData.message ||
            errorData.error ||
            "Something went wrong. Please try again.";

          if (response.status === 403 && errorCode === "PAYMENT_REQUIRED") {
            if (append) {
              setLoadMoreError(
                errorMessage ||
                  "You've used your free ASE quota for this month. Wait until next month or subscribe to continue.",
              );
            } else {
              setAccessBlock("free_quota");
              setError(errorMessage);
            }
            return;
          }

          if (
            response.status === 403 &&
            errorCode === "MONTHLY_FREE_QUOTA_EXHAUSTED"
          ) {
            if (append) {
              setLoadMoreError(
                errorMessage ||
                  "You've used your free ASE quota for this month. Wait until next month or subscribe to continue.",
              );
            } else {
              setAccessBlock("free_quota");
              setError(errorMessage);
            }
            return;
          }

          if (response.status === 403 && errorCode === "SEARCH_LIMIT_REACHED") {
            if (append) {
              setLoadMoreError(
                "You've used all searches included in your plan this billing period.",
              );
            } else {
              setAccessBlock("search_limit");
              setError(errorMessage);
            }
            return;
          }

          throw new Error(errorMessage);
        }

        const data = await response.json();

        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        const candidatesData = data.data || data.candidates || [];
        const formatted = formatCandidates(candidatesData);
        const nextPagination = data.pagination || null;

        setPagination(nextPagination);
        setCurrentPage(pageNum);

        if (append) {
          setCandidates((prev) => {
            const existingIds = new Set(prev.map((candidate) => candidate.id));
            const newCandidates = formatted.filter(
              (candidate) => !existingIds.has(candidate.id),
            );
            return [...prev, ...newCandidates];
          });
        } else {
          setCandidates(formatted);
        }
      } catch (fetchError) {
        if (fetchError.name === "AbortError") {
          return;
        }

        console.error("Error fetching candidates:", fetchError);

        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        if (append) {
          setLoadMoreError(fetchError.message);
        } else {
          setError(fetchError.message);
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          if (append) {
            setLoadingMore(false);
          } else {
            setLoading(false);
          }
        }
      }
    },
    [formatCandidates, searchCriteria],
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setLoadingMore(false);
      setCandidates([]);
      setError(null);
      setLoadMoreError(null);
      setAccessBlock(null);
      setPagination(null);
      setCurrentPage(1);
      return;
    }

    const hasCriteria = Object.values(searchCriteria).some(
      (value) => String(value ?? "").trim() !== "",
    );
    if (!hasCriteria) {
      setLoading(false);
      setCandidates([]);
      setPagination(null);
      setCurrentPage(1);
      return;
    }

    setCurrentPage(1);
    fetchCandidates(1);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchCriteria, enabled, fetchCandidates]);

  const handleLoadMore = () => {
    if (loadingMore || !pagination?.hasNext) {
      return;
    }
    fetchCandidates(currentPage + 1, { append: true });
  };

  if (loading) {
    return (
      <div className={`bg-[#1A3E32] w-full ${compact ? "px-4 py-6 rounded-none min-h-[50vh] flex items-center" : "px-4 sm:px-6 py-8 rounded-2xl shadow-lg"}`}>
        <div className="text-center w-full">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="text-white mt-4">Loading candidates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <SearchResultsMessage
        compact={compact}
        accessBlock={accessBlock}
        message={error}
        onUpgrade={() => navigate("/subscription-pricing")}
        onManageSubscription={() => navigate("/subscription-dashboard")}
        onPostJob={() => navigate("/employer/create-job")}
      />
    );
  }

  const handleInviteClick = (candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCandidate(null);
  };

  const handleInviteSuccess = () => {
    setInviteSuccess(true);
    setTimeout(() => setInviteSuccess(false), 3000);
  };

  return (
    <div className={`bg-[#1A3E32] w-full ${compact ? "px-3 py-3 rounded-none min-h-full" : "px-4 sm:px-6 py-4 rounded-2xl shadow-lg"}`}>
      {inviteSuccess && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-400 text-sm text-center">
          Interview invitation sent successfully!
        </div>
      )}
      <SearchResultsHeader
        count={candidates.length}
        total={pagination?.total}
        compact={compact}
      />
      <div>
        {candidates.length > 0 ? (
          candidates.map((candidate) => (
            <React.Fragment key={candidate.id}>
              <CandidateProfile 
                candidate={candidate} 
                onViewProfile={onViewProfile}
                onInvite={handleInviteClick}
                compact={compact}
              />
              <Divider compact={compact} />
            </React.Fragment>
          ))
        ) : (
          <NoCandidatesFound navigate={navigate} compact={compact} />
        )}
      </div>
      {candidates.length > 0 && pagination?.hasNext && (
        <LoadMoreSection
          compact={compact}
          loading={loadingMore}
          error={loadMoreError}
          onLoadMore={handleLoadMore}
          onUpgrade={() => navigate("/subscription-pricing")}
        />
      )}
      <InterviewInviteModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        candidate={selectedCandidate}
        onSuccess={handleInviteSuccess}
      />
    </div>
  );
};

const SearchResultsMessage = ({
  compact,
  accessBlock,
  message,
  onUpgrade,
  onManageSubscription,
  onPostJob,
}) => (
  <div
    className={`bg-[#1A3E32] w-full ${
      compact
        ? "px-4 py-6 rounded-none min-h-[50vh] flex items-center"
        : "px-4 sm:px-6 py-8 rounded-2xl shadow-lg"
    }`}
  >
    <div className="text-center w-full max-w-md mx-auto">
      {accessBlock === "free_quota" && (
        <>
          <MessageIcon type="info" />
          <p className="text-white text-lg font-semibold mt-4">
            Monthly free quota used
          </p>
          <p className="text-white/85 mt-2 text-sm leading-relaxed">
            {message ||
              "You've used your free ASE quota for this month. Wait until next month or subscribe to continue enjoying ASE searches."}
          </p>
          <ActionButton label="View plans" onClick={onUpgrade} primary />
        </>
      )}

      {accessBlock === "free_trial" && (
        <>
          <MessageIcon type="info" />
          <p className="text-white text-lg font-semibold mt-4">
            Monthly free quota used
          </p>
          <p className="text-white/85 mt-2 text-sm leading-relaxed">
            {message ||
              "You've used your free ASE quota for this month. Wait until next month or subscribe to continue enjoying ASE searches."}
          </p>
          <ActionButton label="View plans" onClick={onUpgrade} primary />
        </>
      )}

      {accessBlock === "search_limit" && (
        <>
          <MessageIcon type="limit" />
          <p className="text-white text-lg font-semibold mt-4">
            Monthly search limit reached
          </p>
          <p className="text-white/85 mt-2 text-sm leading-relaxed">
            You've used all searches included in your plan this billing period.
            Buy an extra search, upgrade your plan, wait until your plan renews,
            or post your job so candidates can discover it and apply.
          </p>
          <div
            className={`mt-5 flex w-full ${
              compact ? "flex-col gap-2" : "flex-col gap-2 sm:gap-3"
            }`}
          >
            <ActionButton label="Buy extra search" onClick={onUpgrade} primary />
            <ActionButton label="Post a job" onClick={onPostJob} />
            <ActionButton
              label="Manage subscription"
              onClick={onManageSubscription}
            />
          </div>
        </>
      )}

      {!accessBlock && (
        <>
          <MessageIcon type="error" />
          <p className="text-white text-lg font-semibold mt-4">
            Couldn't load candidates
          </p>
          <p className="text-white/85 mt-2 text-sm leading-relaxed">{message}</p>
        </>
      )}
    </div>
  </div>
);

const MessageIcon = ({ type }) => {
  if (type === "limit") {
    return (
      <svg
        className="w-16 h-16 mx-auto text-[#6B8E23]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M21 21l-5.197-5.197M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
        />
      </svg>
    );
  }

  if (type === "info") {
    return (
      <svg
        className="w-16 h-16 mx-auto text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  }

  return (
    <svg
      className="w-16 h-16 mx-auto text-white/90"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    </svg>
  );
};

const ActionButton = ({ label, onClick, primary = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full sm:w-auto px-6 py-2.5 rounded-full font-medium transition-colors ${
      primary
        ? "bg-[#6B8E23] hover:bg-[#556B1F] text-white"
        : "border border-white/40 text-white hover:bg-white/10"
    }`}
  >
    {label}
  </button>
);

const SearchResultsHeader = ({ count, total, compact }) => (
  <div className={compact ? "px-2 py-3 border-b border-[#556B1F]/50" : "text-center p-5"}>
    <p className={`text-white font-semibold ${compact ? "text-base" : "text-[20px]"}`}>Search Results</p>
    <p className={`text-white/90 ${compact ? "text-xs mt-0.5" : ""}`}>
      {typeof total === "number" && total > count
        ? `Showing ${count} of ${total} candidates`
        : `${count} candidate${count === 1 ? "" : "s"} found`}
    </p>
  </div>
);

const LoadMoreSection = ({ compact, loading, error, onLoadMore, onUpgrade }) => (
  <div className={`${compact ? "px-2 py-4" : "px-2 py-5"} text-center`}>
    {error && (
      <div className="mb-3 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-red-200 text-xs leading-relaxed">
        <p>{error}</p>
        {(error.includes("limit") || error.includes("Subscribe") || error.includes("free ASE")) && (
          <button
            type="button"
            onClick={onUpgrade}
            className="mt-2 text-[#6B8E23] hover:text-white font-medium underline"
          >
            View plans
          </button>
        )}
      </div>
    )}
    <button
      type="button"
      onClick={onLoadMore}
      disabled={loading}
      className={`rounded-3xl bg-[#6B8E23] hover:bg-[#556B1F] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-colors ${
        compact ? "w-full px-4 py-2.5 text-xs" : "px-6 py-2.5 text-sm"
      }`}
    >
      {loading ? "Loading more candidates..." : "Load more candidates"}
    </button>
    <p className={`text-white/70 mt-2 ${compact ? "text-[10px]" : "text-xs"}`}>
      Uses 1 search credit
    </p>
  </div>
);

const NoCandidatesFound = ({ navigate, compact }) => (
  <div className={`text-center w-full min-w-0 ${compact ? "px-3 py-6" : "p-6"}`}>
    <p className={`text-white font-semibold ${compact ? "text-base" : "text-[20px]"}`}>
      No candidates found
    </p>
    <p
      className={`text-white/85 mt-3 mx-auto leading-relaxed ${
        compact ? "text-xs max-w-sm" : "text-sm max-w-lg"
      }`}
    >
      Try adjusting your search filters, or post a job so candidates can discover your
      opening and apply.
    </p>
    <div
      className={`mt-5 flex w-full max-w-md mx-auto flex-col gap-3 ${
        compact ? "text-xs" : "text-sm"
      }`}
    >
      <button
        type="button"
        onClick={() => navigate("/employer/create-job")}
        className="w-full rounded-3xl bg-[#6B8E23] hover:bg-[#556B1F] text-white font-medium px-4 py-2.5 transition-colors cursor-pointer"
      >
        Post a job
      </button>
      <button
        type="button"
        onClick={() => navigate("/activity-logs")}
        className="w-full rounded-3xl border border-white/40 text-white hover:bg-white/10 font-medium px-4 py-2.5 transition-colors cursor-pointer whitespace-normal leading-snug"
      >
        View applications in Activity Log
      </button>
    </div>
  </div>
);

const CandidateProfile = ({ candidate, onViewProfile, onInvite, compact }) => (
  <div className={compact ? "px-2 py-3" : "mt-4 px-2 py-2 sm:px-3"}>
    <div className={`flex ${compact ? "flex-row items-start gap-3" : "flex-col md:flex-row items-start gap-4 md:gap-5"}`}>
      <ProfileImage
        initials={candidate.initials}
        name={candidate.name}
        availability={candidate.availability}
        image={candidate.image}
        compact={compact}
      />
      <ProfileDetails
        user={candidate}
        name={candidate.name}
        type={candidate.type}
        jobTitle={candidate.jobTitle}
        location={candidate.location}
        skills={candidate.skills}
        experienceYears={candidate.experienceYears}
        onViewProfile={() =>
          onViewProfile(candidate.id, candidate.user_id ?? candidate.userId)
        }
        onInvite={() => onInvite(candidate)}
        compact={compact}
      />
    </div>
  </div>
);

const ProfileImage = ({ initials, name, availability, image, compact }) => (
  <div className="relative shrink-0">
    <div className={`rounded-full overflow-hidden bg-[#6B8E23] flex items-center justify-center ${
      compact ? "w-14 h-14" : "w-[88px] h-[88px] sm:w-[96px] sm:h-[96px]"
    }`}>

      {image ? (
        <img src={image} alt={`${name} profile`} className="w-full h-full object-cover" />
      ) : (
        <span className="text-white text-2xl font-bold">{initials}</span>
      )}

    </div>

    <AvailabilityStatusDot
      availability={availability}
      compact={compact}
      className={compact ? "bottom-0 right-0" : "bottom-2 right-2"}
    />
  </div>
);


const ProfileDetails = ({ user, name, type, jobTitle, location, skills, experienceYears, onViewProfile, onInvite, compact }) => (
  <div className="w-full flex-1 min-w-0 space-y-1">
    <div>
      <p className={`text-white font-medium truncate ${compact ? "text-sm" : "text-[15px] sm:text-[16px]"}`}>
        {compact ? (
          <DisplayNameWithBadge user={user} fallback={name} badgeSize="xs" />
        ) : (
          <>
            <strong>Name:</strong>{" "}
            <DisplayNameWithBadge user={user} fallback={name} badgeSize="xs" />
          </>
        )}
      </p>
      <p className={`text-white/80 ${compact ? "text-[11px]" : "text-[12px]"}`}>
        {compact ? `${type} · ${jobTitle}` : <><strong>Type:</strong> {type}</>}
      </p>
    </div>
    <div>
      {!compact && (
        <p className="text-white text-[13px] sm:text-[14px] font-medium"><strong>Job Title:</strong> {jobTitle}</p>
      )}
      <p className={`text-white/90 ${compact ? "text-[11px]" : "text-[12px]"}`}>
        {compact ? location : <><strong>Location:</strong> {location}</>}
        {compact && experienceYears > 0 ? ` · ${experienceYears} yr${experienceYears === 1 ? "" : "s"}` : null}
      </p>

      {!compact && experienceYears > 0 && (
        <p className="text-white text-[12px]"><strong>Experience:</strong> {experienceYears} years</p>
      )}

      {skills.length > 0 && (
        <div className={compact ? "mt-1" : "mt-1"}>
          {!compact && (
            <p className="text-white text-[12px] font-medium"><strong>Skills:</strong></p>
          )}
          <div className="flex flex-wrap gap-1 mt-1">
            {skills.slice(0, compact ? 2 : 3).map((skill, index) => (
              <span key={index} className={`bg-[#556B1F] text-white px-2 py-0.5 rounded ${compact ? "text-[9px]" : "text-[10px]"}`}>
                {formatDisplayText(skill) ?? skill}
              </span>
            ))}
            {skills.length > (compact ? 2 : 3) && (
              <span className={`text-white ${compact ? "text-[9px]" : "text-[10px]"}`}>
                +{skills.length - (compact ? 2 : 3)} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
    <ProfileActions onViewProfile={onViewProfile} onInvite={onInvite} compact={compact} />
  </div>
);

const ProfileActions = ({ onViewProfile, onInvite, compact }) => (
  <div className={`flex gap-2 ${compact ? "mt-2 flex-col sm:flex-row" : "mt-2 flex-wrap"}`}>
    <button
      onClick={onViewProfile}
      className={`rounded-3xl bg-[#556B1F] hover:bg-[#6B8E23] text-white font-medium transition-colors ${
        compact ? "w-full sm:flex-1 px-3 py-2 text-[11px]" : "px-3 py-1.5 min-w-[120px] text-[12px]"
      }`}
    >
      View Profile
    </button>
    <button
      onClick={onInvite}
      className={`rounded-3xl bg-[#6B8E23] hover:bg-[#556B1F] text-white font-medium transition-colors ${
        compact ? "w-full sm:flex-1 px-3 py-2 text-[11px]" : "px-3 py-1.5 min-w-[120px] text-[12px]"
      }`}
    >
      Invite for interview
    </button>
  </div>
);

const Divider = ({ compact }) => (
  <div className={`bg-[#556B1F]/60 ${compact ? "h-px mx-2" : "h-1 mt-4"}`} />
);

export default CandidateSearchResults;

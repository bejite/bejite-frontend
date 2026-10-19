import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaSlidersH, FaTimes, FaArrowLeft, FaBriefcase } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import SearchCriteria from "../../components/candidate-search-page/SearchCriteria";
import CandidateSearchResults from "../../components/candidate-search-page/CandidateSearchResults";
import NewsFeedHeader from "../../components/NewsFeedHeader";
import UserProfilePanel from "../../components/candidate-search-page/UserProfilePanel";
import JobSearchFormGreen from "../../components/candidate-search-page/JobSearchFormGreen";
import UserMainProfileCard from "../../components/candidate-search-page/UserMainProfileCard";
import NewsFeedLayout from "../../components/layout/NewsFeedLayout";
import AseSearchCreditNotice from "../../components/candidate-search-page/AseSearchCreditNotice";

const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(DESKTOP_MEDIA_QUERY).matches
      : false,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const handleChange = (event) => setIsDesktop(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isDesktop;
}

const CandidateSearchPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    jobInput: "",
    industryInput: "",
    countryInput: "",
    stateInput: "",
    workTypeInput: "",
    salaryInput: "",
    currencyInput: "",
    remoteInput: "",
    availabilityInput: "",
    educationInput: "",
    skillInput: "",
    tribeInput: "",
    ageInput: "",
    genderInput: "",
    maritalInput: "",
  });

  const [showResults, setShowResults] = useState(false);
  const [appliedSearchCriteria, setAppliedSearchCriteria] = useState(null);
  const [viewProfile, setViewProfile] = useState(false);
  const [showMainProfile, setShowMainProfile] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const mainScrollRef = useRef(null);
  const resultsScrollRef = useRef(null);
  const isDesktop = useIsDesktop();

  const hasAtLeastOneField = Object.values(formData).some((val) => val.trim() !== "");
  const activeSearchCriteria = appliedSearchCriteria ?? formData;

  const scrollSearchViewToTop = useCallback(() => {
    window.scrollTo({ top: 0, left: 0 });
    mainScrollRef.current?.scrollTo({ top: 0, left: 0 });
    resultsScrollRef.current?.scrollTo({ top: 0, left: 0 });
  }, []);

  const handleViewProfile = useCallback((candidateId, userId = null) => {
    setSelectedCandidateId(candidateId);
    setSelectedUserId(userId != null && userId !== '' ? String(userId) : null);
    setViewProfile(true);
    setShowMainProfile(false);
    setRightPanelOpen(false);
  }, []);

  const handleSearch = () => {
    setAppliedSearchCriteria({ ...formData });
    setShowResults(true);
    setViewProfile(false);
    setShowMainProfile(false);
    setRightPanelOpen(false);
  };

  const handleBackToSearchForm = () => {
    setShowResults(false);
    setAppliedSearchCriteria(null);
    setViewProfile(false);
    setShowMainProfile(false);
    setRightPanelOpen(false);
  };

  useEffect(() => {
    if (!showResults) return;
    scrollSearchViewToTop();
  }, [showResults, scrollSearchViewToTop]);

  const handleBackToSearch = () => {
    setViewProfile(false);
    setShowMainProfile(false);
    setRightPanelOpen(false);
  };

  const handleBackToResults = () => {
    setShowMainProfile(false);
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setRightPanelOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const renderMainContent = () => {
    if (!viewProfile) {
      if (showResults) {
        return (
          <>
            {!isDesktop && showResults && !viewProfile && (
              <CandidateSearchResults
                searchCriteria={activeSearchCriteria}
                enabled={Boolean(appliedSearchCriteria)}
                onViewProfile={handleViewProfile}
                compact
              />
            )}
            {isDesktop && (
              <SearchCriteria
                formData={formData}
                setFormData={setFormData}
                isFormComplete={hasAtLeastOneField}
                onSearch={handleSearch}
              />
            )}
          </>
        );
      }
      return (
        <SearchCriteria
          formData={formData}
          setFormData={setFormData}
          isFormComplete={hasAtLeastOneField}
          onSearch={handleSearch}
        />
      );
    }
    if (!showMainProfile) {
      return (
        <UserProfilePanel
          candidateId={selectedCandidateId}
          connectUserId={selectedUserId}
          onViewMainProfile={() => setShowMainProfile(true)}
        />
      );
    }
    return (
      <UserMainProfileCard
        candidateId={selectedCandidateId}
        connectUserId={selectedUserId}
      />
    );
  };

  const showMobileToolbar = showResults || viewProfile;

  return (
    <NewsFeedLayout scrollable={false} classes={false} showSidebars={false}>
      <div className="flex flex-col h-[calc(100vh-72px)] min-h-0 w-full max-w-[1440px] mx-auto bg-[#FFFFFF]">
        {/* Top Header Bar */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200">
          <span className="text-sm font-bold text-[#1A3E32] hidden sm:inline">
            Candidate Search
          </span>
          <button
            type="button"
            onClick={() => navigate("/employer/recruitment-management")}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-full bg-[#16730F] hover:bg-[#125B0C] text-white shadow-xs transition-all duration-200 active:scale-95 cursor-pointer ml-auto"
          >
            <FaBriefcase className="w-3.5 h-3.5" />
            Recruitment Management
          </button>
        </div>

        {showMobileToolbar && (
          <div className="lg:hidden shrink-0 flex flex-wrap items-center gap-2 px-3 py-2 bg-white border-b border-gray-200">
            {showResults && !viewProfile && (
              <button
                type="button"
                onClick={handleBackToSearchForm}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-[#16730F] text-[#16730F]"
              >
                <FaArrowLeft className="w-3 h-3" />
                Edit search
              </button>
            )}
            {viewProfile && (
              <>
                <button
                  type="button"
                  onClick={handleBackToSearch}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-[#16730F] text-[#16730F]"
                >
                  <FaArrowLeft className="w-3 h-3" />
                  {showResults ? "Results" : "Search"}
                </button>
                {showMainProfile && (
                  <button
                    type="button"
                    onClick={handleBackToResults}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-[#6B8E23] text-[#6B8E23]"
                  >
                    <FaArrowLeft className="w-3 h-3" />
                    Profile
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setRightPanelOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full bg-[#6B8E23] text-white"
                >
                  <FaSlidersH className="w-3.5 h-3.5" />
                  Filters
                </button>
              </>
            )}
          </div>
        )}

        <div className="relative flex-1 min-h-0">
          {(rightPanelOpen) && (
            <button
              type="button"
              aria-label="Close panel"
              className="lg:hidden absolute inset-0 z-30 bg-black/40"
              onClick={() => {
                setRightPanelOpen(false);
              }}
            />
          )}

          <div className="h-full flex min-h-0">
            {/* Left sidebar — search results (desktop only) */}
            {showResults && isDesktop && (
              <aside
                className="hidden lg:flex shrink-0 flex-col bg-[#F5F5F5] border-r border-gray-200 lg:w-[min(360px,28vw)] lg:max-w-[400px] overflow-hidden"
              >
                <div
                  ref={resultsScrollRef}
                  className="flex-1 overflow-y-auto nfl-scroll scroll-smooth p-3 sm:p-4 min-h-0"
                >
                  <CandidateSearchResults
                    searchCriteria={activeSearchCriteria}
                    enabled={Boolean(appliedSearchCriteria)}
                    onViewProfile={handleViewProfile}
                  />
                </div>
              </aside>
            )}

            {/* Main content */}
            <main
              ref={mainScrollRef}
              className={`flex-1 min-w-0 overflow-y-auto overflow-x-hidden nfl-scroll scroll-smooth bg-[#F5F5F5] ${
                showResults && !viewProfile ? "p-0 lg:p-3 lg:sm:p-4 lg:md:p-6" : "p-3 sm:p-4 md:p-6"
              }`}
            >
              {!showResults && !viewProfile && <AseSearchCreditNotice />}
              {renderMainContent()}
            </main>

            {/* Right sidebar — refine search */}
            <aside
              className={`
              shrink-0 flex flex-col bg-[#F5F5F5] border-l border-gray-200
              w-full sm:w-[min(92vw,420px)]
              lg:w-[min(400px,30vw)] lg:max-w-[440px]
              overflow-hidden
              absolute lg:static inset-y-0 right-0 z-40 lg:z-auto
              transition-transform duration-300 ease-in-out
              ${viewProfile ? "" : "hidden"}
              ${rightPanelOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
            `}
            >
              <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-[#1A3E32] shrink-0">
                <span className="text-sm font-semibold text-white">Refine search</span>
                <button
                  type="button"
                  onClick={() => setRightPanelOpen(false)}
                  className="p-1.5 rounded-full text-white hover:bg-white/10"
                  aria-label="Close filters"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto nfl-scroll scroll-smooth p-3 sm:p-4 min-h-0">
                <JobSearchFormGreen
                  formData={formData}
                  setFormData={setFormData}
                  onSearch={() => {
                    handleSearch();
                    setRightPanelOpen(false);
                  }}
                />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </NewsFeedLayout>
  );
};

export default CandidateSearchPage;

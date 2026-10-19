import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Header from "../../../components/Header";
import StepTabs from "../../../components/StepTabs";
import ProgressBar from "../../../components/ProgressBar";
import { useOutletContext, useNavigate, useLocation } from "react-router-dom";
import NavigationButtons from "../../../components/NavigationButtons";
import useAuth from "../../../hooks/useAuth";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import {
  saveWorkHistory,
  deleteWorkHistory,
  addEntry,
  removeEntryByIndex,
  loadExistingEntries,
} from "../../../features/workHistory/workHistorySlice";
import { FaPlus, FaChevronDown, FaTrash, FaCheck, FaBriefcase, FaBuilding, FaCalendarAlt } from "react-icons/fa";
import Loader from "../../../components/ui/Loader";
import OnboardingLayout from "../../../components/layout/onboardingLayout";
import { InputWithIcon } from "../../../components/forms/InputIcon";
import FormLabel from "../../../components/forms/FormLabel";
import { JOB_TITLES } from "../../../data/teamData";
import { formatDateRange } from "../../../utils/checksFormat";
import axiosInstance from "../../../utils/axiosInstance";
import ResponsibilitiesList from "../../../components/ResponsibilitiesList";
import {
  getPortaledMenuStyle,
  usePortaledMenu,
} from "../../../hooks/usePortaledMenu";

const buildWorkHistoryApiPayload = (entry) => ({
  userId: entry.userId,
  jobTitle: entry.jobTitle,
  companyName: entry.companyName,
  responsibilities: entry.responsibilities,
  startDate: entry.startDate,
  endDate: entry.isCurrentJob || !entry.endDate ? null : entry.endDate,
});

// Dummy job titles for autocomplete


// Autocomplete Input Component for Job Titles
const AutocompleteJobInput = ({ value, onChange, placeholder, suggestions, onAddNew }) => {
  const [inputValue, setInputValue] = useState(value);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);
  const { triggerRef, menuRef, menuPos } = usePortaledMenu({
    isOpen: showSuggestions,
    onClose: () => setShowSuggestions(false),
    maxHeight: 240,
    extraContainRefs: [wrapperRef],
  });

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(e);
    
    if (newValue.trim()) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(newValue.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 10));
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setInputValue(suggestion);
    onChange({ target: { value: suggestion } });
    setShowSuggestions(false);
  };

  const handleAddNew = () => {
    if (inputValue.trim()) {
      handleSelectSuggestion(inputValue.trim());
      if (onAddNew) onAddNew(inputValue.trim());
      toast.success(`Added new job title: ${inputValue}`);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full" style={{ position: "relative", zIndex: 20 }}>
      <input
        ref={triggerRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => {
          if (inputValue.trim()) {
            const filtered = JOB_TITLES.filter(suggestion =>
              suggestion.toLowerCase().includes(inputValue.toLowerCase())
            );
            setFilteredSuggestions(filtered.slice(0, 10));
            setShowSuggestions(true);
          } else {
            setFilteredSuggestions(JOB_TITLES.slice(0, 10));
            setShowSuggestions(true);
          }
        }}
        placeholder={placeholder}
        className="w-full h-12 border-2 rounded-[10px] px-4 pr-10 focus:outline-1 focus:outline-[#16730F] transition-all bg-white"
      />
      {inputValue && (
        <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-[#16730F] text-lg pointer-events-none" />
      )}
      
      {showSuggestions &&
        menuPos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto nfl-scroll"
            style={{
              ...getPortaledMenuStyle(menuPos),
              maxHeight: menuPos.maxHeight,
            }}
          >
            {filteredSuggestions.length > 0 ? (
              <>
                {filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 transition-colors"
                  >
                    {suggestion}
                  </div>
                ))}
                {inputValue.trim() && !filteredSuggestions.includes(inputValue.trim()) && (
                  <div
                    onClick={handleAddNew}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-[#16730F] font-medium transition-colors flex items-center gap-2 border-t border-gray-100"
                  >
                    <FaPlus className="text-xs" />
                    Add "{inputValue}"
                  </div>
                )}
              </>
            ) : (
              inputValue.trim() && (
                <div
                  onClick={handleAddNew}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-[#16730F] font-medium transition-colors flex items-center gap-2"
                >
                  <FaPlus className="text-xs" />
                  Add "{inputValue}"
                </div>
              )
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

function WorkHistory() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentStep, isEditMode, cvData, getPath } = useOutletContext();

  // Redux state
  const { entries: allWorkHistory, loading: isLoading, dataLoaded } = useSelector(
    (state) => state.workHistory
  );

  const handleStepClick = (path) => {
    navigate(path);
  };
  const steps = [
    "Bio",
    "Education",
    "Skills",
    "Work history",
    "Certificate",
    "Links",
    "Job Type",
  ];

  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrentJob, setIsCurrentJob] = useState(false);
  const [allFilled, setAllFilled] = useState(false);
  const { user } = useAuth();
  const [jobTitlesList, setJobTitlesList] = useState(JOB_TITLES);
  const [isSavingEntry, setIsSavingEntry] = useState(false);

  // Load existing work history data when in edit mode
  useEffect(() => {
    if (
      isEditMode &&
      cvData?.workHistory &&
      cvData.workHistory.length > 0 &&
      !dataLoaded
    ) {
      const existingWork = cvData.workHistory.map((work) => ({
        id: work.id,
        userId: user?.id,
        jobTitle: work.job_title || work.jobTitle,
        companyName: work.company_name || work.companyName,
        responsibilities: work.responsibilities,
        startDate: work.start_date || work.startDate,
        endDate: work.end_date || work.endDate || null,
        isCurrentJob: !(work.end_date || work.endDate),
      }));
      dispatch(loadExistingEntries(existingWork));
    }
  }, [isEditMode, cvData, user?.id, dataLoaded, dispatch]);

  // Update allFilled whenever form fields change
  useEffect(() => {
    const isEndDateValid = isCurrentJob ? true : endDate && endDate.trim() !== "";
    const filled =
      jobTitle.trim() !== "" &&
      companyName.trim() !== "" &&
      responsibilities.trim() !== "" &&
      startDate.trim() !== "" &&
      isEndDateValid;

    setAllFilled(filled);
  }, [jobTitle, companyName, responsibilities, startDate, endDate, isCurrentJob]);

  const clearForm = () => {
    setJobTitle("");
    setCompanyName("");
    setResponsibilities("");
    setStartDate("");
    setEndDate("");
    setIsCurrentJob(false);
  };

  const addMore = () => {
    if (!allFilled) {
      toast.error("Please complete all fields");
      return;
    }

    const newEntry = {
      userId: user?.id,
      jobTitle,
      companyName,
      responsibilities,
      startDate,
      endDate: isCurrentJob ? null : endDate,
      isCurrentJob,
    };

    // Check for duplicates
    const isDuplicate = allWorkHistory.some(
      (item) =>
        item.jobTitle === newEntry.jobTitle &&
        item.companyName === newEntry.companyName &&
        item.startDate === newEntry.startDate &&
        (isCurrentJob ? !item.endDate : item.endDate === newEntry.endDate),
    );

    if (isDuplicate) {
      toast.warning("This work history entry already exists");
      return;
    }

    if (!jobTitlesList.includes(jobTitle)) {
      setJobTitlesList((prev) => [...prev, jobTitle]);
    }

    setIsSavingEntry(true);
    axiosInstance
      .post("/api/cv-builder/work-history", buildWorkHistoryApiPayload(newEntry))
      .then(({ data }) => {
        const savedId = data?.data?.id;
        dispatch(addEntry({ ...newEntry, id: savedId }));
        clearForm();
        toast.success("Work history saved!");
      })
      .catch((err) => {
        console.error("Error saving work history:", err);
        toast.error("Failed to save work history. Try again.");
      })
      .finally(() => setIsSavingEntry(false));
  };

  const location = useLocation();
  const { email, firstName, lastName, role, mode, followings } =
    location.state || {};

  return (
    <OnboardingLayout
      steps={steps}
      currentStep={currentStep}
      handleStepClick={handleStepClick}
      getPath={getPath}
      isEditMode={isEditMode}
    >
      <div className="pb-20">
        <div className="max-w-3xl mx-auto mt-6 text-[#16730F] text-2xl font-semibold">
          Work history
        </div>
        <p className="max-w-3xl mx-auto text-[#333] text-sm mb-6">
          Your professional experience shows your expertise.
        </p>

        <div className="max-w-4xl mx-auto border-2 border-[#E0E0E0] p-4 rounded-lg overflow-visible">
          <div className="bg-[#F5F5F5] p-3 rounded-2xl space-y-4 overflow-visible">
            <div className="bg-[#fff] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 overflow-visible">
              <div className="flex-1 overflow-visible">
                <FormLabel
                  required
                  label="JOB TITLE"
                  tooltip="Your official role or job designation at the company (e.g. Software Engineer, Marketing Lead)"
                />
                <AutocompleteJobInput
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Enter or select job title"
                  suggestions={jobTitlesList}
                />
              </div>
              <div className="flex-1">
                <FormLabel
                  required
                  label="COMPANY NAME"
                  tooltip="The name of the organization or company where you worked"
                />
                <InputWithIcon
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name"
                />
              </div>
            </div>

            <div className="bg-[#fff] rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <FormLabel
                  required
                  label="KEY RESPONSIBILITIES"
                  tooltip="A summary of your key duties, achievements, and impact"
                />
                <textarea
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  placeholder="Tip: Do NOT use bullet points or numbered lists. Use plain text and hit enter to add a new line."
                  className="w-full bg-[#F5F5F5] rounded-[6px] p-3 h-40 text-[10px] focus:outline-1 focus:outline-[#16730F]"
                />
              </div>

              <div className="w-full sm:w-66 p-2 rounded-lg">
                <FormLabel
                  required
                  label="START DATE"
                  tooltip="The date you started working in this position"
                />
                <InputWithIcon
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <br />
                
                <div className="flex items-center justify-between mb-2 mt-2">
                  <FormLabel
                    required={!isCurrentJob}
                    label="END DATE"
                    tooltip="The date your employment concluded (leave blank if currently working here)"
                  />
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isCurrentJob}
                      onChange={(e) => {
                        setIsCurrentJob(e.target.checked);
                        if (e.target.checked) {
                          setEndDate("");
                        }
                      }}
                      className="w-4 h-4 text-[#16730F] rounded border-gray-300 focus:ring-[#16730F] cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-[#16730F] transition-colors">
                      Currently working here
                    </span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isCurrentJob}
                    className={`w-full h-12 border-2 rounded-[10px] px-4 pr-10 focus:outline-1 focus:outline-[#16730F] transition-all bg-white ${
                      isCurrentJob 
                        ? "bg-gray-100 cursor-not-allowed opacity-60" 
                        : "hover:border-gray-400"
                    } ${endDate ? "border-[#828282]" : "border-[#F5F5F5]"}`}
                  />
                  {endDate && !isCurrentJob && (
                    <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-[#16730F] text-lg pointer-events-none" />
                  )}
                  {isCurrentJob && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                      Current
                    </div>
                  )}
                </div>
                {isCurrentJob && (
                  <p className="text-xs text-[#16730F] mt-1 flex items-center gap-1">
                    <FaCheck className="text-xs" /> You are currently employed here
                  </p>
                )}
              </div>
            </div>

            <div className="max-w-2xs bg-[#00000040] mt-3 ml-auto rounded-2xl flex">
              <button
                onClick={addMore}
                disabled={!allFilled}
                className={`flex-1 h-16 flex items-center justify-center gap-2 text-white border-2 rounded-lg text-sm transition-all ${
                  allFilled
                    ? "bg-[#16730F] border-[#16730F] cursor-pointer hover:bg-[#145a0c] transform hover:scale-105"
                    : "bg-transparent border-[#F5F5F5] cursor-not-allowed opacity-50"
                }`}
              >
                ADD MORE <FaPlus />
              </button>
            </div>
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto mt-6 space-y-4 px-1">
          {allWorkHistory.length > 0 &&
            allWorkHistory.map((item, idx) => (
              <div
                key={item.id ?? idx}
                className="w-full bg-white border border-gray-200 hover:border-[#16730F]/40 shadow-sm hover:shadow-md transition-all rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#16730F] rounded-l-xl"></div>
                <div className="flex items-start gap-4 flex-1 min-w-0 pl-1">
                  <div className="w-11 h-11 rounded-xl bg-[#16730F]/10 text-[#16730F] flex items-center justify-center shrink-0 group-hover:bg-[#16730F] group-hover:text-white transition-colors duration-200">
                    <FaBriefcase className="text-lg" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h4 className="font-bold text-base sm:text-lg text-[#1A3E32] tracking-tight truncate">
                        {item.jobTitle}
                      </h4>
                      {item.isCurrentJob && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#16730F]/10 text-[#16730F] border border-[#16730F]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#16730F] animate-pulse"></span>
                          Currently Working Here
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-gray-700 mt-1">
                      <span className="flex items-center gap-1 text.16730F font-semibold text-[#16730F]">
                        <FaBuilding className="text-xs opacity-75" />
                        {item.companyName}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="flex items-center gap-1 text-xs text-gray-500 font-normal">
                        <FaCalendarAlt className="text-xs text-gray-400" />
                        {formatDateRange(item.startDate, item.endDate, item.isCurrentJob)}
                      </span>
                    </div>

                    {item.responsibilities && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                          Key Responsibilities
                        </p>
                        <ResponsibilitiesList
                          text={item.responsibilities}
                          className="space-y-1.5 list-disc list-outside pl-4 text-xs text-gray-700 break-words"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 shrink-0">
                  <button
                    type="button"
                    title="Delete work history entry"
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 hover:border-red-200 transition-all cursor-pointer"
                    onClick={async () => {
                      if (item.id) {
                        const result = await dispatch(
                          deleteWorkHistory({ userId: user?.id, entryId: item.id })
                        );
                        if (deleteWorkHistory.fulfilled.match(result)) {
                          toast.success("Work history deleted successfully!");
                        } else {
                          toast.error("Failed to delete work history");
                          return;
                        }
                      } else {
                        dispatch(removeEntryByIndex(idx));
                      }
                    }}
                  >
                    <FaTrash className="text-sm" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
        </div>

        <NavigationButtons
          isFormComplete={true}
          onBack={() => {
            if (isEditMode) {
              navigate(getPath(currentStep - 1));
            } else {
              navigate(-1);
            }
          }}
          onNext={async () => {
            let historyToSave = [...allWorkHistory];

            if (allFilled) {
              const currentEntry = {
                userId: user?.id,
                jobTitle,
                companyName,
                responsibilities,
                startDate,
                endDate: isCurrentJob ? null : endDate,
                isCurrentJob,
              };

              const exists = historyToSave.some(
                (item) =>
                  item.jobTitle === currentEntry.jobTitle &&
                  item.companyName === currentEntry.companyName &&
                  item.startDate === currentEntry.startDate &&
                  (isCurrentJob ? !item.endDate : item.endDate === currentEntry.endDate),
              );

              if (!exists) {
                historyToSave.push(currentEntry);
              }
            }

            const result = await dispatch(saveWorkHistory(historyToSave));
            if (saveWorkHistory.fulfilled.match(result)) {
              toast.success("Work history saved successfully!");
              if (isEditMode) {
                navigate(getPath(currentStep + 1));
              } else {
                navigate("/certificate", {
                  state: { email, firstName, lastName, role, mode, followings },
                });
              }
            } else {
              toast.error("Failed to save work history. Try again.");
            }
          }}
          showSkip={true}
          onSkip={() => {
            if (isEditMode) {
              navigate(getPath(currentStep + 1));
            } else {
              navigate("/certificate", {
                state: { email, firstName, lastName, role, mode, followings },
              });
            }
          }}
        />

        <Loader show={isLoading || isSavingEntry} />
      </div>
    </OnboardingLayout>
  );
}

export default WorkHistory;

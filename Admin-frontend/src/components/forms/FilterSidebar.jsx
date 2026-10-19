import { useState } from "react";
import { FaFilter, FaTimes } from "react-icons/fa";

function FilterPanelContent({
  industries,
  workModes,
  jobTypes,
  experienceLevels,
  selectedIndustry,
  selectedWorkMode,
  selectedJobType,
  selectedExperienceLevel,
  salaryRange,
  onIndustryChange,
  onWorkModeChange,
  onJobTypeChange,
  onExperienceLevelChange,
  onSalaryRangeChange,
  onClearFilters,
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <button
          onClick={onClearFilters}
          className="text-sm text-[#16730F] hover:underline"
        >
          Clear all
        </button>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Industry</h4>
        <div className="space-y-2">
          {industries.map((industry) => (
            <label
              key={industry}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="industry"
                checked={selectedIndustry === industry}
                onChange={() => onIndustryChange(industry)}
                className="w-4 h-4 text-[#16730F]"
              />
              <span className="text-sm text-gray-600">{industry}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Work Mode</h4>
        <div className="space-y-2">
          {workModes.map((mode) => (
            <label
              key={mode}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedWorkMode === mode}
                onChange={() =>
                  onWorkModeChange(selectedWorkMode === mode ? "" : mode)
                }
                className="w-4 h-4 text-[#16730F] rounded"
              />
              <span className="text-sm text-gray-600">{mode}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Job Type</h4>
        <div className="space-y-2">
          {jobTypes.map((type) => (
            <label
              key={type}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedJobType === type}
                onChange={() =>
                  onJobTypeChange(selectedJobType === type ? "" : type)
                }
                className="w-4 h-4 text-[#16730F] rounded"
              />
              <span className="text-sm text-gray-600">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Experience Level
        </h4>
        <div className="space-y-2">
          {experienceLevels.map((level) => (
            <label
              key={level}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedExperienceLevel === level}
                onChange={() =>
                  onExperienceLevelChange(
                    selectedExperienceLevel === level ? "" : level,
                  )
                }
                className="w-4 h-4 text-[#16730F] rounded"
              />
              <span className="text-sm text-gray-600">{level}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Salary Range (NGN)
        </h4>
        <div className="space-y-3">
          <input
            type="range"
            min={0}
            max={1000000}
            step={500}
            value={salaryRange[1]}
            onChange={(e) =>
              onSalaryRangeChange([salaryRange[0], parseInt(e.target.value)])
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#16730F]"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>₦{salaryRange[0].toLocaleString()}</span>
            <span>₦{salaryRange[1].toLocaleString()}+</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const FilterSidebar = ({
  industries,
  workModes,
  jobTypes,
  experienceLevels,
  selectedIndustry,
  selectedWorkMode,
  selectedJobType,
  selectedExperienceLevel,
  salaryRange,
  onIndustryChange,
  onWorkModeChange,
  onJobTypeChange,
  onExperienceLevelChange,
  onSalaryRangeChange,
  onClearFilters,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const filterProps = {
    industries,
    workModes,
    jobTypes,
    experienceLevels,
    selectedIndustry,
    selectedWorkMode,
    selectedJobType,
    selectedExperienceLevel,
    salaryRange,
    onIndustryChange,
    onWorkModeChange,
    onJobTypeChange,
    onExperienceLevelChange,
    onSalaryRangeChange,
    onClearFilters,
  };

  return (
    <>
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center gap-2 bg-white border rounded-xl px-4 py-2 text-sm"
        >
          <FaFilter /> Filters
          {(selectedIndustry ||
            selectedWorkMode ||
            selectedJobType ||
            selectedExperienceLevel) && (
            <span className="bg-[#16730F] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {
                [
                  selectedIndustry,
                  selectedWorkMode,
                  selectedJobType,
                  selectedExperienceLevel,
                ].filter(Boolean).length
              }
            </span>
          )}
        </button>
      </div>

      <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 p-5 sticky top-24 h-fit">
        <FilterPanelContent {...filterProps} />
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl p-5 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Filters</h2>
              <button onClick={() => setIsMobileOpen(false)} className="p-2">
                <FaTimes />
              </button>
            </div>
            <FilterPanelContent {...filterProps} />
            <button
              onClick={() => setIsMobileOpen(false)}
              className="w-full mt-6 bg-[#16730F] text-white py-3 rounded-xl font-semibold"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </>
  );
};

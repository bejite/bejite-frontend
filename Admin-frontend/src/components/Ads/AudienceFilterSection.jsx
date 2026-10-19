// AudienceFilterSection.js
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import GeographicTargetingSection from "./GeographicTargetingSection";
import ProfessionalTargetingSection from "./ProfessionalTargetingSection";
import RecruiterSelect from "../admin/RecruiterSelect";

const filterOptions = {
  // Demographic
  gender: [
    { value: "any", label: "Any" },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ],
  ageRange: [
    { value: "18-24", label: "18-24 years" },
    { value: "25-34", label: "25-34 years" },
    { value: "35-44", label: "35-44 years" },
    { value: "45-54", label: "45-54 years" },
    { value: "55+", label: "55+ years" },
  ],
  maritalStatus: [
    { value: "any", label: "Any" },
    { value: "single", label: "Single" },
    { value: "married", label: "Married" },
    { value: "divorced", label: "Divorced" },
  ],
  // Professional
  yearsExperience: [
    { value: "0-2", label: "0-2 years" },
    { value: "3-5", label: "3-5 years" },
    { value: "6-10", label: "6-10 years" },
    { value: "10+", label: "10+ years" },
  ],
  companySize: [
    { value: "1-10", label: "1-10 employees" },
    { value: "11-50", label: "11-50 employees" },
    { value: "51-200", label: "51-200 employees" },
    { value: "201-500", label: "201-500 employees" },
    { value: "500+", label: "500+ employees" },
  ],
  // Educational
  qualifications: [
    { value: "diploma", label: "Diploma" },
    { value: "bachelors", label: "Bachelor's Degree" },
    { value: "masters", label: "Master's Degree" },
    { value: "phd", label: "PhD" },
    { value: "professional", label: "Professional Certification" },
  ],
  // Behavioral
  activity: [
    { value: "7days", label: "Active last 7 days" },
    { value: "30days", label: "Active last 30 days" },
    { value: "90days", label: "Active last 90 days" },
  ],
  jobSeekingStatus: [
    { value: "active", label: "Actively Seeking" },
    { value: "open", label: "Open to Opportunities" },
    { value: "not", label: "Not Seeking" },
  ],
};

export default function AudienceFilterSection({
  title,
  icon: Icon,
  audience,
  onUpdate,
}) {
  const [expanded, setExpanded] = useState(true);

  const renderFilter = (filterKey, label, isMulti = true) => {
    const options = filterOptions[filterKey];
    if (!options) return null;

    const value = audience[filterKey] || (isMulti ? [] : "any");

    if (isMulti && Array.isArray(value)) {
      return (
        <div key={filterKey} className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  const newValue = value.includes(option.value)
                    ? value.filter((v) => v !== option.value)
                    : [...value, option.value];
                  onUpdate(filterKey, newValue);
                }}
                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm transition-all ${
                  value.includes(option.value)
                    ? "bg-[#1A3E32] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div key={filterKey} className="mb-5">
        <RecruiterSelect
          label={label}
          name={filterKey}
          value={value}
          onChange={(e) => onUpdate(filterKey, e.target.value)}
          options={options}
        />
      </div>
    );
  };

  const renderContent = () => {
    switch (title) {
      case "Geographic Targeting":
        return (
          <GeographicTargetingSection audience={audience} onUpdate={onUpdate} />
        );
      case "Demographic Targeting":
        return (
          <>
            {renderFilter("gender", "Gender", false)}
            {renderFilter("ageRange", "Age Range", true)}
            {renderFilter("maritalStatus", "Marital Status", false)}
          </>
        );
      case "Professional Targeting":
        return (
          <>
            <ProfessionalTargetingSection
              audience={audience}
              onUpdate={onUpdate}
            />
            {renderFilter("yearsExperience", "Years of Experience", true)}
            {renderFilter("companySize", "Company Size", true)}
          </>
        );
      case "Educational Targeting":
        return <>{renderFilter("qualifications", "Qualifications", true)}</>;
      case "Behavioral Targeting":
        return (
          <>
            {renderFilter("activity", "User Activity", true)}
            {renderFilter("jobSeekingStatus", "Job Seeking Status", true)}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-visible">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-[#1A3E32]" />
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {expanded && (
        <div className="p-4 space-y-4 overflow-visible">{renderContent()}</div>
      )}
    </div>
  );
}

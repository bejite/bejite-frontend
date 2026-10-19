import React, { memo, useState, useMemo } from "react";
import { FaCheck, FaSearch, FaTimes, FaPlus } from "react-icons/fa";
import useCountryStateOptions from "../../hooks/useCountryStateOptions";

// Move components outside to prevent recreation on every render
const SearchInput = memo(({ id, label, options, placeholder, value, onChange, disabled }) => (
  <div className="w-full p-3 sm:p-4 rounded-lg">
    <label htmlFor={id} className="text-[#16730F] text-sm sm:text-[12px] font-medium block mb-1">
      {label}
    </label>
    <div className="relative">
      <input
        list={`${id}List`}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full rounded-xl px-4 py-2 sm:py-3 pr-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16730F] bg-white text-gray-800 text-sm sm:text-base ${
          disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : ""
        }`}
        placeholder={placeholder}
      />
      {value && !disabled && (
        <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-lg" />
      )}
      <datalist id={`${id}List`}>
        {options.map(option => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </div>
  </div>
));

const TextInput = memo(({ id, label, placeholder, value, onChange }) => (
  <div className="w-full p-3 sm:p-4 rounded-lg">
    <label htmlFor={id} className="text-[#16730F] text-sm sm:text-[12px] font-medium block mb-1">
      {label}
    </label>
    <div className="relative">
      <input
        type="text"
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl px-4 py-2 sm:py-3 pr-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16730F] bg-white text-gray-800 text-sm sm:text-base"
        placeholder={placeholder}
      />
      {value && (
        <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-lg" />
      )}
    </div>
  </div>
));

// Interactive Multi-Select Skills Input
const SkillsMultiInput = memo(({ id = "skillInput", label = "SKILL", options = [], value = "", onChange }) => {
  const [inputValue, setInputValue] = useState("");

  const selectedSkills = useMemo(() => {
    if (!value) return [];
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [value]);

  const addSkill = (skill) => {
    const trimmed = (skill || "").trim().replace(/^,+|,+$/g, "");
    if (!trimmed) return;

    // Check if skill already exists (case-insensitive)
    const exists = selectedSkills.some(
      (s) => s.toLowerCase() === trimmed.toLowerCase()
    );
    if (!exists) {
      const nextSkills = [...selectedSkills, trimmed];
      onChange({ target: { name: id, value: nextSkills.join(", ") } });
    }
    setInputValue("");
  };

  const removeSkill = (skillToRemove) => {
    const nextSkills = selectedSkills.filter(
      (s) => s.toLowerCase() !== skillToRemove.toLowerCase()
    );
    onChange({ target: { name: id, value: nextSkills.join(", ") } });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(inputValue);
    } else if (e.key === "Backspace" && !inputValue && selectedSkills.length > 0) {
      removeSkill(selectedSkills[selectedSkills.length - 1]);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val.includes(",")) {
      const parts = val.split(",");
      parts.forEach((p) => addSkill(p));
    } else if (options.some((opt) => opt.toLowerCase() === val.trim().toLowerCase())) {
      // If user selected or typed an exact option from datalist
      addSkill(val);
    } else {
      setInputValue(val);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addSkill(inputValue);
    }
  };

  // Filter out options that are already selected
  const availableOptions = options.filter(
    (opt) => !selectedSkills.some((s) => s.toLowerCase() === opt.toLowerCase())
  );

  return (
    <div className="w-full p-3 sm:p-4 rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={id} className="text-[#16730F] text-sm sm:text-[12px] font-medium block">
          {label}
        </label>
        {selectedSkills.length > 0 && (
          <span className="text-xs text-[#16730F] font-semibold">
            {selectedSkills.length} selected
          </span>
        )}
      </div>

      <div className="relative">
        <input
          list={`${id}List`}
          id={id}
          name={id}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="w-full rounded-xl px-4 py-2 sm:py-3 pr-16 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16730F] bg-white text-gray-800 text-sm sm:text-base"
          placeholder={
            selectedSkills.length > 0
              ? "Add another skill and press Enter..."
              : "Type a skill and press Enter or select..."
          }
        />
        <button
          type="button"
          onClick={() => addSkill(inputValue)}
          disabled={!inputValue.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#16730F] text-white text-xs font-semibold rounded-lg hover:bg-[#125a0c] disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          Add
        </button>

        <datalist id={`${id}List`}>
          {availableOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </div>

      {/* Selected Skills Chips Container */}
      {selectedSkills.length > 0 && (
        <div className="mt-3 p-3 bg-gray-50/90 border border-gray-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
              Selected Skills ({selectedSkills.length})
            </span>
            <button
              type="button"
              onClick={() => onChange({ target: { name: id, value: "" } })}
              className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors cursor-pointer"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {selectedSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-[#16730F] border border-[#16730F]/30 rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-all hover:bg-green-100/80"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeSkill(skill);
                  }}
                  className="p-0.5 rounded-full hover:bg-[#16730F]/20 text-gray-500 hover:text-[#16730F] transition-colors focus:outline-none cursor-pointer"
                  title={`Remove ${skill}`}
                >
                  <FaTimes className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Popular Suggestions quick add */}
      {availableOptions.length > 0 && selectedSkills.length < 5 && (
        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-gray-500 font-medium">Suggestions:</span>
          {availableOptions.slice(0, 5).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => addSkill(opt)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-green-50 hover:text-[#16730F] hover:border-green-300 border border-gray-200 text-gray-600 rounded-md text-xs font-medium transition-all cursor-pointer"
            >
              <FaPlus className="h-2.5 w-2.5" />
              <span>{opt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

const GroupedInputs = ({ children }) => (
  <div className="flex flex-col sm:flex-row gap-4">
    {children}
  </div>
);

const Divider = () => (
  <div className="max-w-3xl mx-auto my-4 border-t-2 border-[#16730F]" />
);

const SearchCriteria = ({ formData, setFormData, onSearch }) => {
  const { countries, states } = useCountryStateOptions(formData.countryInput);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === "countryInput" && value !== prev.countryInput) {
        updated.stateInput = "";
      }
      return updated;
    });
  };

  // Check if at least one field has a value
  const hasAtLeastOneField = Object.values(formData).some(val => val.trim() !== "");

  return (
    <div>
      <div className="w-full max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="max-w-3xl mx-auto rounded-2xl p-4 sm:p-6 bg-white shadow-sm">
          <p className="text-xl sm:text-2xl font-medium text-[#16730F] text-center">
            Advanced Search Engine
          </p>
        </div>

        <Divider />

        <div className="max-w-3xl mx-auto rounded-2xl p-4 sm:p-6 bg-white shadow-sm space-y-4">

          <SearchInput id="jobInput" label="JOB TITLE" options={["Software Engineer", "Product Designer", "Data Analyst", "Project Manager", "Marketing Specialist"]} placeholder="Enter your job or select from list" value={formData.jobInput} onChange={handleChange} />
          <SearchInput id="industryInput" label="INDUSTRY" options={["Technology", "Healthcare", "Finance", "Education", "Retail"]} placeholder="Enter sector" value={formData.industryInput} onChange={handleChange} />
          <SearchInput id="countryInput" label="PREFERRED COUNTRY" options={countries} placeholder="Enter or select" value={formData.countryInput} onChange={handleChange} />
          {formData.countryInput && states.length > 0 ? (
            <SearchInput 
              id="stateInput" 
              label="PREFERRED STATE" 
              options={states} 
              placeholder="Select a state" 
              value={formData.stateInput} 
              onChange={handleChange} 
            />
          ) : formData.countryInput && states.length === 0 ? (
            <div className="w-full p-3 sm:p-4 rounded-lg">
              <p className="text-[#16730F] text-sm font-medium">PREFERRED STATE</p>
              <p className="text-gray-500 text-sm mt-2">No states available for this country</p>
            </div>
          ) : (
            <SearchInput 
              id="stateInput" 
              label="PREFERRED STATE" 
              options={[]} 
              placeholder="Select a country first" 
              value={formData.stateInput} 
              onChange={handleChange} 
              disabled={true}
            />
          )}
          <SearchInput id="workTypeInput" label="WORK TYPE" options={["Full-time", "Part-time", "Contract", "Freelance", "Remote"]} placeholder="Enter or select" value={formData.workTypeInput} onChange={handleChange} />

          <GroupedInputs>
            <TextInput id="salaryInput" label="SALARY" placeholder="Enter" value={formData.salaryInput} onChange={handleChange} />
            <SearchInput id="currencyInput" label="CURRENCY" options={["USD", "EUR", "GBP", "JPY", "CAD"]} placeholder="Enter or select" value={formData.currencyInput} onChange={handleChange} />
          </GroupedInputs>

          <GroupedInputs>
            <TextInput id="remoteInput" label="REMOTE REFERENCE" placeholder="Enter" value={formData.remoteInput} onChange={handleChange} />
            <SearchInput id="availabilityInput" label="AVAILABILITY" options={["Immediately", "1-2 weeks", "1 month", "2 months", "3+ months"]} placeholder="Enter or select" value={formData.availabilityInput} onChange={handleChange} />
          </GroupedInputs>

          <SearchInput
            id="rateInput"
            label="RATE"
            options={["Hourly rate", "Monthly Salary"]}
            placeholder="Enter or select"
            value={formData.rateInput}
            onChange={handleChange}
          />

          <SearchInput id="educationInput" label="EDUCATION" options={["High School", "Secondary", "Associate Degree", "Bachelor's Degree", "Master's Degree", "PhD"]} placeholder="Enter or select" value={formData.educationInput} onChange={handleChange} />
          
          <SkillsMultiInput
            id="skillInput"
            label="SKILL"
            options={["JavaScript", "React", "Node.js", "Python", "SQL", "Backend Development", "TypeScript", "UI/UX Design", "Figma", "AWS", "Product Management"]}
            value={formData.skillInput}
            onChange={handleChange}
          />

          <GroupedInputs>
            <TextInput id="tribeInput" label="TRIBE" placeholder="Enter" value={formData.tribeInput} onChange={handleChange} />
            <SearchInput id="ageInput" label="AGE" options={["18-24", "25-34", "35-44", "45-54", "55+"]} placeholder="Enter or select" value={formData.ageInput} onChange={handleChange} />
          </GroupedInputs>

          <GroupedInputs>
            <TextInput id="genderInput" label="GENDER" placeholder="Enter" value={formData.genderInput} onChange={handleChange} />
            <SearchInput id="maritalInput" label="MARITAL" options={["Single", "Married", "Divorced", "Widowed", "Separated"]} placeholder="Enter or select" value={formData.maritalInput} onChange={handleChange} />
          </GroupedInputs>


          <div className="mt-6 sm:mt-10">
            <button
              onClick={onSearch}
              disabled={!hasAtLeastOneField}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 sm:py-3 rounded-2xl mx-auto font-medium transition-colors cursor-pointer
                ${hasAtLeastOneField ? 'bg-[#16730F] text-white hover:bg-[#125a0c]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
              `}
            >
              Search <FaSearch className="h-5 w-5" />
            </button>
            <p className="text-center text-xs text-gray-500 mt-3 px-2 leading-relaxed">
              Each search uses 1 ASE credit. Add skills, location, and other filters
              to narrow results before searching.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchCriteria;

import React, { useState, useMemo } from "react";
import { FaCheck, FaTimes, FaPlus } from "react-icons/fa";
import useCountryStateOptions from "../../hooks/useCountryStateOptions";

const JobSearchFormGreen = ({ formData, setFormData, onSearch }) => {
  const { countries, states } = useCountryStateOptions(formData.countryInput);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "countryInput" && value !== prev.countryInput) {
        next.stateInput = "";
      }
      return next;
    });
  };

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 bg-[#1A3E32] rounded-2xl">
      <FormHeader />
      <Divider />

      <div className="max-w-3xl mx-auto rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <SearchInput
          id="jobInput"
          label="JOB TITLE"
          value={formData.jobInput}
          onChange={handleChange}
          placeholder="Enter your job or select from list"
          options={[
            "Software Engineer",
            "Product Designer",
            "Data Analyst",
            "Project Manager",
            "Marketing Specialist",
          ]}
        />
        <Divider small />

        <SearchInput
          id="industryInput"
          label="INDUSTRY"
          value={formData.industryInput}
          onChange={handleChange}
          placeholder="Enter sector"
          options={[
            "Technology",
            "Healthcare",
            "Finance",
            "Education",
            "Retail",
          ]}
        />
        <Divider small />

        <SearchInput
          id="countryInput"
          label="PREFERRED COUNTRY"
          value={formData.countryInput}
          onChange={handleChange}
          placeholder="Enter or select"
          options={countries}
        />
        <Divider small />

        {formData.countryInput && states.length > 0 ? (
          <SearchInput
            id="stateInput"
            label="PREFERRED STATE"
            value={formData.stateInput}
            onChange={handleChange}
            placeholder="Select a state"
            options={states}
          />
        ) : formData.countryInput && states.length === 0 ? (
          <div className="w-full p-3 sm:p-4 rounded-lg">
            <p className="text-[#ffffff] text-sm font-medium">PREFERRED STATE</p>
            <p className="text-white/70 text-sm mt-2">
              No states listed for this country — leave blank or type in the main search.
            </p>
          </div>
        ) : (
          <SearchInput
            id="stateInput"
            label="PREFERRED STATE"
            value={formData.stateInput}
            onChange={handleChange}
            placeholder="Select a country first"
            options={[]}
            disabled
          />
        )}
        <Divider small />

        <SearchInput
          id="workTypeInput"
          label="WORK TYPE"
          value={formData.workTypeInput}
          onChange={handleChange}
          placeholder="Enter or select"
          options={[
            "Full-time",
            "Part-time",
            "Contract",
            "Freelance",
            "Remote",
          ]}
        />
        <Divider small />

        <div className="space-y-4">
          <SearchInput
            id="salaryInput"
            label="SALARY"
            value={formData.salaryInput}
            onChange={handleChange}
            placeholder="Enter"
            type="text"
          />
          <Divider small />

          <SearchInput
            id="currencyInput"
            label="CURRENCY"
            value={formData.currencyInput}
            onChange={handleChange}
            placeholder="Enter or select"
            options={["USD", "EUR", "GBP", "JPY", "CAD"]}
          />
        </div>
        <Divider small />

        <div className="space-y-4">
          <SearchInput
            id="remoteInput"
            label="REMOTE REFERENCE"
            value={formData.remoteInput}
            onChange={handleChange}
            placeholder="Enter"
            type="text"
          />
          <Divider small />

          <SearchInput
            id="availabilityInput"
            label="AVAILABILITY"
            value={formData.availabilityInput}
            onChange={handleChange}
            placeholder="Enter or select"
            options={[
              "Immediately",
              "1-2 weeks",
              "1 month",
              "2 months",
              "3+ months",
            ]}
          />
        </div>
        <Divider small />

        <SearchInput
          id="educationInput"
          label="EDUCATION"
          value={formData.educationInput}
          onChange={handleChange}
          placeholder="Enter or select"
          options={[
            "High School",
            "Associate Degree",
            "Bachelor's Degree",
            "Master's Degree",
            "PhD",
          ]}
        />
        <Divider small />

        <SkillsMultiInputDark
          id="skillInput"
          label="SKILL"
          value={formData.skillInput}
          onChange={handleChange}
          options={["JavaScript", "React", "Node.js", "Python", "SQL", "Backend Development", "TypeScript", "UI/UX Design", "Figma", "AWS", "Product Management"]}
        />
        <Divider small />

        <div className="space-y-4">
          <SearchInput
            id="tribeInput"
            label="TRIBE"
            value={formData.tribeInput}
            onChange={handleChange}
            placeholder="Enter"
            type="text"
          />
          <Divider small />

          <SearchInput
            id="ageInput"
            label="AGE"
            value={formData.ageInput}
            onChange={handleChange}
            placeholder="Enter or select"
            options={["18-24", "25-34", "35-44", "45-54", "55+"]}
          />
        </div>
        <Divider small />

        <div className="space-y-4">
          <SearchInput
            id="genderInput"
            label="GENDER"
            value={formData.genderInput}
            onChange={handleChange}
            placeholder="Enter"
            type="text"
          />
          <Divider small />

          <SearchInput
            id="maritalInput"
            label="MARITAL"
            value={formData.maritalInput}
            onChange={handleChange}
            placeholder="Enter or select"
            options={["Single", "Married", "Divorced", "Widowed", "Separated"]}
          />
        </div>
        <Divider small />

        <SearchButton
          onSearch={onSearch}
          disabled={!Object.values(formData).some((val) => val.trim() !== "")}
        />
      </div>
    </div>
  );
};

const FormHeader = () => {
  return (
    <div className="max-w-3xl mx-auto rounded-2xl p-4 sm:p-6 bg-[#1A3E32] shadow-sm">
      <p className="text-xl sm:text-2xl font-medium text-[#ffffff] text-center">
        Search Criteria
      </p>
    </div>
  );
};

const Divider = ({ small = false }) => {
  return (
    <div
      className={`max-w-[150px] mx-auto border-t-2 ${small ? "border-[#E0E0E0]" : "border-[#16730F]"
        }`}
    />
  );
};

const SearchInput = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  options = [],
  type = "datalist",
  disabled = false,
}) => {
  return (
    <div className="w-full p-3 sm:p-4 rounded-lg">
      <label
        htmlFor={id}
        className="text-[#ffffff] text-sm sm:text-[12px] font-medium block mb-1"
      >
        {label}
      </label>
      <div className="relative">
        <input
          list={type === "datalist" && !disabled ? `${id}List` : undefined}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full rounded-xl px-4 py-2 sm:py-3 pr-10 border border-[#556B1F] focus:outline-none focus:ring-2 focus:ring-[#16730F] text-[#ffffff] text-sm sm:text-base ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          placeholder={placeholder}
        />
        {value && !disabled && (
          <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-lg" />
        )}
        {type === "datalist" && options.length > 0 && (
          <datalist id={`${id}List`}>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </datalist>
        )}
      </div>
    </div>
  );
};

const SkillsMultiInputDark = ({ id = "skillInput", label = "SKILL", options = [], value = "", onChange }) => {
  const [inputValue, setInputValue] = useState("");

  const selectedSkills = useMemo(() => {
    if (!value) return [];
    return value.split(",").map((s) => s.trim()).filter(Boolean);
  }, [value]);

  const addSkill = (skill) => {
    const trimmed = (skill || "").trim().replace(/^,+|,+$/g, "");
    if (!trimmed) return;
    const exists = selectedSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      const nextSkills = [...selectedSkills, trimmed];
      onChange({ target: { name: id, value: nextSkills.join(", ") } });
    }
    setInputValue("");
  };

  const removeSkill = (skillToRemove) => {
    const nextSkills = selectedSkills.filter((s) => s.toLowerCase() !== skillToRemove.toLowerCase());
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
      val.split(",").forEach((p) => addSkill(p));
    } else if (options.some((opt) => opt.toLowerCase() === val.trim().toLowerCase())) {
      addSkill(val);
    } else {
      setInputValue(val);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) addSkill(inputValue);
  };

  const availableOptions = options.filter(
    (opt) => !selectedSkills.some((s) => s.toLowerCase() === opt.toLowerCase())
  );

  return (
    <div className="w-full p-3 sm:p-4 rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={id} className="text-[#ffffff] text-sm sm:text-[12px] font-medium block">
          {label}
        </label>
        {selectedSkills.length > 0 && (
          <span className="text-xs text-green-300 font-semibold">
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
          className="w-full rounded-xl px-4 py-2 sm:py-3 pr-16 border border-[#556B1F] focus:outline-none focus:ring-2 focus:ring-[#16730F] text-[#ffffff] text-sm sm:text-base"
          placeholder={selectedSkills.length > 0 ? "Add another skill..." : "Type a skill and press Enter..."}
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

      {selectedSkills.length > 0 && (
        <div className="mt-3 p-3 bg-white/10 border border-white/20 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
              Selected Skills ({selectedSkills.length})
            </span>
            <button
              type="button"
              onClick={() => onChange({ target: { name: id, value: "" } })}
              className="text-xs text-red-300 hover:text-red-400 font-medium transition-colors cursor-pointer"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {selectedSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-900/40 text-green-200 border border-green-500/30 rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-all hover:bg-green-800/50"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeSkill(skill); }}
                  className="p-0.5 rounded-full hover:bg-white/20 text-white/60 hover:text-white transition-colors focus:outline-none cursor-pointer"
                  title={`Remove ${skill}`}
                >
                  <FaTimes className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {availableOptions.length > 0 && selectedSkills.length < 5 && (
        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-white/50 font-medium">Suggestions:</span>
          {availableOptions.slice(0, 5).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => addSkill(opt)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-green-900/40 hover:text-green-200 hover:border-green-500/30 border border-white/20 text-white/70 rounded-md text-xs font-medium transition-all cursor-pointer"
            >
              <FaPlus className="h-2.5 w-2.5" />
              <span>{opt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const SearchButton = ({ onSearch, disabled }) => {
  return (
    <div className="mt-6 sm:mt-10">
      <button
        onClick={onSearch}
        disabled={disabled}
        className={`w-full flex items-center justify-center gap-2 px-6 py-2 sm:py-3 rounded-2xl mx-auto text-white font-medium transition-colors ${disabled ? "bg-gray-500 cursor-not-allowed" : "bg-[#16730F] hover:bg-[#125a0c]"
          }`}
      >
        Search
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <p className="text-center text-xs text-white/70 mt-3 px-2 leading-relaxed">
        Each search uses 1 ASE credit. Narrow your filters to get better matches.
      </p>
    </div>
  );
};

export default JobSearchFormGreen;

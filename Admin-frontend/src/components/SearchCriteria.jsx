import { FaCheck, FaSearch } from "react-icons/fa";

function CriteriaDivider() {
  return <div className="max-w-3xl mx-auto my-4 border-t-2 border-[#16730F]" />;
}

function CriteriaGroupedInputs({ children }) {
  return <div className="flex flex-col sm:flex-row gap-4">{children}</div>;
}

function CriteriaSearchInput({
  id,
  label,
  options,
  placeholder,
  formData,
  onChange,
}) {
  return (
    <div className="w-full p-3 sm:p-4 rounded-lg">
      <label
        htmlFor={id}
        className="text-[#16730F] text-sm sm:text-[12px] font-medium block mb-1"
      >
        {label}
      </label>
      <div className="relative">
        <input
          list={`${id}List`}
          id={id}
          name={id}
          value={formData[id]}
          onChange={onChange}
          className="w-full rounded-xl px-4 py-2 sm:py-3 pr-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16730F] bg-white text-gray-800 text-sm sm:text-base"
          placeholder={placeholder}
        />
        {formData[id] ? (
          <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-lg" />
        ) : null}
        <datalist id={`${id}List`}>
          {options.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </div>
    </div>
  );
}

function CriteriaTextInput({ id, label, placeholder, formData, onChange }) {
  return (
    <div className="w-full p-3 sm:p-4 rounded-lg">
      <label
        htmlFor={id}
        className="text-[#16730F] text-sm sm:text-[12px] font-medium block mb-1"
      >
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          id={id}
          name={id}
          value={formData[id]}
          onChange={onChange}
          className="w-full rounded-xl px-4 py-2 sm:py-3 pr-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16730F] bg-white text-gray-800 text-sm sm:text-base"
          placeholder={placeholder}
        />
        {formData[id] ? (
          <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-lg" />
        ) : null}
      </div>
    </div>
  );
}

const SearchCriteria = ({
  formData,
  setFormData,
  isFormComplete,
  onSearch,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fieldProps = { formData, onChange: handleChange };

  return (
    <div>
      <div className="max-w-3xl m-auto px-6 py-6 mt-2">
        <div className="max-w-3xl mx-auto rounded-2xl p-4 sm:p-6 bg-white shadow-sm">
          <p className="text-xl sm:text-2xl font-medium text-[#16730F] text-center">
            Search Criteria
          </p>
        </div>

        <CriteriaDivider />

        <div className="max-w-3xl mx-auto rounded-2xl p-4 sm:p-6 bg-white shadow-sm space-y-4">
          <CriteriaSearchInput
            id="jobInput"
            label="JOB TITLE"
            options={[
              "Software Engineer",
              "Product Designer",
              "Data Analyst",
              "Project Manager",
              "Marketing Specialist",
            ]}
            placeholder="Enter your job or select from list"
            {...fieldProps}
          />
          <CriteriaSearchInput
            id="industryInput"
            label="INDUSTRY"
            options={[
              "Technology",
              "Healthcare",
              "Finance",
              "Education",
              "Retail",
            ]}
            placeholder="Enter sector"
            {...fieldProps}
          />
          <CriteriaSearchInput
            id="countryInput"
            label="PREFERRED COUNTRY"
            options={[
              "United States",
              "United Kingdom",
              "Canada",
              "Germany",
              "Australia",
            ]}
            placeholder="Enter or select"
            {...fieldProps}
          />
          <CriteriaSearchInput
            id="stateInput"
            label="PREFERRED STATE"
            options={["California", "Texas", "New York", "Florida", "Illinois"]}
            placeholder="Enter or select"
            {...fieldProps}
          />
          <CriteriaSearchInput
            id="workTypeInput"
            label="WORK TYPE"
            options={[
              "Full-time",
              "Part-time",
              "Contract",
              "Freelance",
              "Remote",
            ]}
            placeholder="Enter or select"
            {...fieldProps}
          />

          <CriteriaGroupedInputs>
            <CriteriaTextInput
              id="salaryInput"
              label="SALARY"
              placeholder="Enter"
              {...fieldProps}
            />
            <CriteriaSearchInput
              id="currencyInput"
              label="CURRENCY"
              options={["USD", "EUR", "GBP", "JPY", "CAD"]}
              placeholder="Enter or select"
              {...fieldProps}
            />
          </CriteriaGroupedInputs>

          <CriteriaGroupedInputs>
            <CriteriaTextInput
              id="remoteInput"
              label="REMOTE REFERENCE"
              placeholder="Enter"
              {...fieldProps}
            />
            <CriteriaSearchInput
              id="availabilityInput"
              label="AVAILABILITY"
              options={[
                "Immediately",
                "1-2 weeks",
                "1 month",
                "2 months",
                "3+ months",
              ]}
              placeholder="Enter or select"
              {...fieldProps}
            />
          </CriteriaGroupedInputs>

          <CriteriaSearchInput
            id="educationInput"
            label="EDUCATION"
            options={[
              "High School",
              "Associate Degree",
              "Bachelor's Degree",
              "Master's Degree",
              "PhD",
            ]}
            placeholder="Enter or select"
            {...fieldProps}
          />
          <CriteriaSearchInput
            id="skillInput"
            label="SKILL"
            options={["JavaScript", "React", "Node.js", "Python", "SQL"]}
            placeholder="Enter or select"
            {...fieldProps}
          />

          <CriteriaGroupedInputs>
            <CriteriaTextInput
              id="tribeInput"
              label="TRIBE"
              placeholder="Enter"
              {...fieldProps}
            />
            <CriteriaSearchInput
              id="ageInput"
              label="AGE"
              options={["18-24", "25-34", "35-44", "45-54", "55+"]}
              placeholder="Enter or select"
              {...fieldProps}
            />
          </CriteriaGroupedInputs>

          <CriteriaGroupedInputs>
            <CriteriaTextInput
              id="genderInput"
              label="GENDER"
              placeholder="Enter"
              {...fieldProps}
            />
            <CriteriaSearchInput
              id="maritalInput"
              label="MARITAL"
              options={[
                "Single",
                "Married",
                "Divorced",
                "Widowed",
                "Separated",
              ]}
              placeholder="Enter or select"
              {...fieldProps}
            />
          </CriteriaGroupedInputs>

          <div className="mt-6 sm:mt-10">
            <button
              type="button"
              onClick={onSearch}
              disabled={!isFormComplete}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 sm:py-3 rounded-2xl mx-auto font-medium transition-colors ${
                isFormComplete
                  ? "bg-[#16730F] text-white hover:bg-[#125a0c]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Search <FaSearch className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchCriteria;

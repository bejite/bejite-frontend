// JobSearchForm.jsx
import { useState } from "react";
import { FaCheck } from "react-icons/fa";

const JobSearchFormGreen = () => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="max-w-[400px] m-auto px-6 py-6 bg-[#1A3E32] rounded-2xl mt-2">
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
          options={[
            "United States",
            "United Kingdom",
            "Canada",
            "Germany",
            "Australia",
          ]}
        />
        <Divider small />

        <SearchInput
          id="stateInput"
          label="PREFERRED STATE"
          value={formData.stateInput}
          onChange={handleChange}
          placeholder="Enter or select"
          options={["California", "Texas", "New York", "Florida", "Illinois"]}
        />
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

        <SearchInput
          id="skillInput"
          label="SKILL"
          value={formData.skillInput}
          onChange={handleChange}
          placeholder="Enter or select"
          options={["JavaScript", "React", "Node.js", "Python", "SQL"]}
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

        <SearchButton />
      </div>
    </div>
  );
};

const FormHeader = () => {
  return (
    <div className="max-w-3xl mx-auto rounded-2xl p-4 sm:p-6 bg-[#1A3E32] shadow-sm">
      <p className="text-xl sm:text-2xl font-medium text-[#16730F] text-center">
        Search Criteria
      </p>
    </div>
  );
};

const Divider = ({ small = false }) => {
  return (
    <div
      className={`max-w-[150px] mx-auto border-t-2 ${
        small ? "border-[#E0E0E0]" : "border-[#16730F]"
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
}) => {
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
          list={type === "datalist" ? `${id}List` : undefined}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          className="w-full rounded-xl px-4 py-2 sm:py-3 pr-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16730F] text-[#6B8E23] text-sm sm:text-base"
          placeholder={placeholder}
        />
        {value && (
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

const SearchButton = () => {
  return (
    <div className="mt-6 sm:mt-10">
      <button className="w-full flex items-center justify-center gap-2 bg-[#16730F] px-6 py-2 sm:py-3 rounded-2xl mx-auto text-white font-medium hover:bg-[#125a0c] transition-colors">
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
    </div>
  );
};

export default JobSearchFormGreen;

import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import StepTabs from "../components/StepTabs";
import ProgressBar from "../components/ProgressBar";
import { useOutletContext, useNavigate } from "react-router-dom";
import NavigationButtons from "../components/NavigationButtons";
import {
  FaPlus,
  FaCheckCircle,
  // FaChevronDown,
  FaTrash,
  FaBriefcase,
} from "react-icons/fa";
// import { FaDeleteLeft } from "react-icons/fa6";
import { RecruiterSelect } from "../components/recruiter/recruiterOnboardingUi";

const optionsJob = [
  // Tech & IT
  "Software Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "UI/UX Designer",
  "Data Analyst",
  "Data Scientist",
  "DevOps Engineer",
  "Product Manager",
  "QA Tester",
  "Cybersecurity Analyst",

  // Business & Admin
  "Administrative Assistant",
  "Project Manager",
  "Operations Manager",
  "Business Analyst",
  "Customer Support Representative",
  "Sales Executive",
  "Human Resources Manager",

  // Marketing & Content
  "Digital Marketer",
  "SEO Specialist",
  "Content Writer",
  "Social Media Manager",
  "Copywriter",
  "Brand Manager",

  // Finance
  "Accountant",
  "Financial Analyst",
  "Auditor",
  "Bank Teller",

  // Education
  "Teacher",
  "Lecturer",
  "Academic Advisor",
  "School Administrator",

  // Health & Medicine
  "Nurse",
  "Medical Doctor",
  "Pharmacist",
  "Laboratory Technician",

  // Skilled Trades & Others
  "Electrician",
  "Plumber",
  "Driver",
  "Chef",
  "Security Guard",
];

const SelectWithIcon = ({ name, value, onChange, options, placeholder }) => (
  <RecruiterSelect
    name={name}
    value={value}
    onChange={onChange}
    options={options || []}
    placeholder={placeholder || "Select option"}
  />
);

const InputWithIcon = ({ value, onChange, placeholder, type = "text" }) => (
  <div className="relative w-full">
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full h-12 border-2 rounded-[10px] text-sm p-2 pr-10 ${
        value ? "border-[#828282]" : "border-[#F5F5F5]"
      } ${type === "date" && value ? "hide-calendar-icon" : ""}`}
    />
    {value && (
      <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-[#16730F] text-lg" />
    )}
  </div>
);

function WorkHistory() {
  const navigate = useNavigate();
  const { currentStep } = useOutletContext();
  const steps = [
    "Bio",
    "Education",
    "Skills",
    "Work history",
    "Certificate",
    "Links",
  ];

  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [allFilled, setAllFilled] = useState(false);

  useEffect(() => {
    setAllFilled(
      jobTitle && companyName && responsibilities && startDate && endDate,
    );
  }, [jobTitle, companyName, responsibilities, startDate, endDate]);

  const clearForm = () => {
    setJobTitle("");
    setCompanyName("");
    setResponsibilities("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="min-h-screen py-4 px-2 sm:px-4">
      <Header />
      <StepTabs steps={steps} currentStep={currentStep} />
      <ProgressBar currentStep={currentStep} totalSteps={steps.length} />

      <div className="max-w-3xl mx-auto mt-6 text-[#E63357] text-2xl font-semibold">
        Work history
      </div>
      <p className="max-w-3xl mx-auto text-[#333] text-sm mb-6">
        Your professional experience shows your expertise.
      </p>

      <div className="max-w-full md:max-w-4xl mx-auto border-2 border-[#E0E0E0] p-4 rounded-lg">
        <div className="bg-[#F5F5F5] p-3 rounded-2xl space-y-4">
          {/* Job Title and Company */}
          <div className="bg-[#82828280] rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <p className="font-semibold text-xs mb-1">JOB TITLE</p>
              <SelectWithIcon
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                options={optionsJob}
                placeholder="Select "
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-xs mb-1">COMPANY NAME</p>
              <InputWithIcon
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
              />
            </div>
          </div>

          {/* Responsibilities & Dates */}
          <div className="bg-[#82828280] rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <p className="font-semibold text-xs mb-1">KEY RESPONSIBILITIES</p>
              <textarea
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                placeholder="Tip: Use bullet points to highlight what you did and how it helped the company."
                className="w-full bg-[#F5F5F5] rounded-[6px] p-3 h-40 text-[10px]"
              >
                {" "}
              </textarea>
            </div>

            <div className="w-full sm:w-56 p-2 rounded-lg">
              <p className="font-semibold text-xs mb-1">START DATE</p>
              <InputWithIcon
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />{" "}
              <br />
              <p className="font-semibold text-xs mb-1 mt-2">END DATE</p>
              <InputWithIcon
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Add More Button */}
          <div className="max-w-2xs mx-auto bg-[#00000040] mt-3 rounded-2xl flex">
            <button
              onClick={clearForm}
              className={`flex-1 h-16 flex items-center justify-center gap-2 text-white border-2 rounded-lg text-sm ${
                allFilled
                  ? "bg-black border-black"
                  : "bg-transparent border-[#F5F5F5]"
              }`}
            >
              ADD MORE <FaPlus />
            </button>
          </div>
        </div>
      </div>

      {allFilled && (
        <div className="w-full max-w-4xl mx-auto mt-6 px-1">
          <div className="w-full bg-white border border-gray-200 hover:border-[#16730F]/40 shadow-sm hover:shadow-md transition-all rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#16730F] rounded-l-xl"></div>
            <div className="flex items-start gap-4 flex-1 min-w-0 pl-1">
              <div className="w-11 h-11 rounded-xl bg-[#16730F]/10 text-[#16730F] flex items-center justify-center shrink-0">
                <FaBriefcase className="text-lg" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-base sm:text-lg text-[#1A3E32] tracking-tight truncate">
                  {jobTitle}
                </h4>
                <p className="text-sm font-semibold text-[#16730F] mt-0.5">
                  @ {companyName}
                </p>
                {(startDate || endDate) && (
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    {startDate} — {endDate || "Present"}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={clearForm}
              title="Delete entry"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 hover:border-red-200 transition-all cursor-pointer"
            >
              <FaTrash className="text-sm" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      <NavigationButtons
        isFormComplete={allFilled}
        onBack={() => navigate(-1)}
        onNext={() => allFilled && navigate("/certificate")}
      />
    </div>
  );
}

export default WorkHistory;

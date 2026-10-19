import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import StepTabs from "../components/StepTabs";
import ProgressBar from "../components/ProgressBar";
import { useOutletContext, useNavigate } from "react-router-dom";
import NavigationButtons from "../components/NavigationButtons";
import { FaPlus, FaCheckCircle, FaChevronDown, FaTrash } from "react-icons/fa";
import { FaDeleteLeft } from "react-icons/fa6";
import { RecruiterSelect } from "../components/recruiter/recruiterOnboardingUi";
const optionsEdu = [
  "No Formal Education",
  "Primary",
  "Secondary",
  "Vocational/Technical Training",
  "Tertiary Institution",
  "Postgraduate (Masters/PhD)",
  "Professional Certification",
];

const optionsInst = [
  
  "University of Ibadan",
  "Covenant University",
  "University of Lagos",
 
  "Massachusetts Institute of Technology (MIT)",
  "Harvard University",
  "Stanford University",
  
  "University of Oxford",
  "University of Cambridge",
  "Imperial College London",

  "University of Toronto",
  "University of Melbourne",
  "National University of Singapore",
];

const optionsLoc = [
  "Lagos",
  "Abuja",
  "Johannesburg",
  "Nairobi",
  "Cairo",
  "Accra",
  "Kampala",
  "Dar es Salaam",
  "Casablanca",
  "Addis Ababa",

  "New York",
  "Los Angeles",
  "Toronto",
  "Vancouver",
  "Chicago",
  "Mexico City",
  "Houston",
  "Miami",
  "Montreal",
  "Boston",

  "São Paulo",
  "Buenos Aires",
  "Rio de Janeiro",
  "Bogotá",
  "Santiago",
  "Lima",
  "Caracas",
  "Quito",
  "Montevideo",
  "Curitiba",

  "London",
  "Paris",
  "Berlin",
  "Madrid",
  "Rome",
  "Moscow",
  "Amsterdam",
  "Stockholm",
  "Vienna",
  "Zurich",
  "Brussels",
  "Lisbon",
  "Dublin",
  "Warsaw",
  "Prague",
  "Budapest",

  "Beijing",
  "Shanghai",
  "Tokyo",
  "Seoul",
  "Mumbai",
  "Delhi",
  "Bangkok",
  "Singapore",
  "Kuala Lumpur",
  "Jakarta",
  "Manila",
  "Dubai",
  "Hong Kong",
  "Taipei",
  "Hanoi",
  "Karachi",

  "Sydney",
  "Melbourne",
  "Auckland",
  "Brisbane",
  "Perth",
];

const optionsField = [
  "Accounting",
  "Agriculture",
  "Anthropology",
  "Architecture",
  "Art and Design",
  "Astronomy",
  "Biology",
  "Business Administration",
  "Chemical Engineering",
  "Civil Engineering",
  "Communication Studies",
  "Computer Science",
  "Criminology",
  "Data Science",
  "Dentistry",
  "Economics",
  "Education",
  "Electrical Engineering",
  "Environmental Science",
  "Finance",
  "Geography",
  "Geology",
  "History",
  "Hospitality Management",
  "Human Resource Management",
  "Industrial Engineering",
  "Information Technology",
  "International Relations",
  "Journalism",
  "Law",
  "Linguistics",
  "Marketing",
  "Mathematics",
  "Mechanical Engineering",
  "Medicine",
  "Music",
  "Nursing",
  "Pharmacy",
  "Philosophy",
  "Physics",
  "Political Science",
  "Psychology",
  "Public Administration",
  "Public Health",
  "Religious Studies",
  "Social Work",
  "Sociology",
  "Software Engineering",
  "Statistics",
  "Theatre Arts",
  "Theology",
  "Tourism and Travel",
  "Veterinary Medicine",
  "Zoology"
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

function Education() {
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

  const [educationLevel, setEducationLevel] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [location, setLocation] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [degree, setDegree] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [allFilled, setAllFilled] = useState(false);

  useEffect(() => {
    setAllFilled(
      educationLevel &&
        institutionName &&
        location &&
        fieldOfStudy &&
        degree.trim() &&
        startDate &&
        endDate
    );
  }, [
    educationLevel,
    institutionName,
    location,
    fieldOfStudy,
    degree,
    startDate,
    endDate,
  ]);

  const clearForm = () => {
    setEducationLevel("");
    setInstitutionName("");
    setLocation("");
    setFieldOfStudy("");
    setDegree("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className=" min-h-screen py-4">
      <Header />
      <StepTabs steps={steps} currentStep={currentStep} />
      <ProgressBar currentStep={currentStep} totalSteps={steps.length} />

      <div className="max-w-3xl mx-auto mt-6 px-4 text-[#E63357] text-2xl font-semibold">
        Education
      </div>
      <p className="max-w-3xl mx-auto px-4 text-[#333] text-sm mb-6">
        Your academic background shows your foundation.
      </p>

      <div className="max-w-full md:max-w-4xl mx-auto border-2 border-[#E0E0E0] p-4 ">
        <div className="bg-[#F5F5F5] p-3 rounded-2xl space-y-1">
          <div className="bg-[#82828280] rounded-2xl p-4 ">
            <p className="font-semibold text-xs mb-1">EDUCATIONAL LEVEL</p>
            <SelectWithIcon
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              options={optionsEdu}
              placeholder="Select..."
            />
          </div>

          <div className="bg-[#82828280] rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <p className="font-semibold text-xs mb-1">INSTITUTION NAME</p>
              <SelectWithIcon
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                options={optionsInst}
                placeholder="Select institution..."
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-xs mb-1">LOCATION</p>
              <SelectWithIcon
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                options={optionsLoc}
                placeholder="Select location..."
              />
            </div>
          </div>

          <div className="bg-[#82828280] rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <p className="font-semibold text-xs mb-1">FIELD OF STUDY</p>
              <SelectWithIcon
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                options={optionsField}
                placeholder="Select field..."
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-xs mb-1">DEGREE</p>
              <InputWithIcon
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g. B.Sc"
              />
            </div>
          </div>

          <div className="bg-[#82828280] rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <p className="font-semibold text-xs mb-1">START DATE</p>
              <InputWithIcon
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-xs mb-1">END DATE</p>
              <InputWithIcon
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex-1 flex items-end">
              <button
                onClick={clearForm}
                className={`w-full h-16 flex items-center justify-center gap-2 text-white border-2 rounded-lg text-sm ${
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
      </div>

      {allFilled && (
        <div className="max-w-4xl px-4 mt-6   m-auto ">
          <div className="max-w-2xs  bg-[#16730F] text-white rounded-lg flex flex-col m-auto sm:flex-row justify-between  sm:items-center p-4 space-y-2 sm:space-y-0">
            <div>
              <p className="font-semibold">{fieldOfStudy}</p>
              <p className="text-sm">
                {degree} @ {institutionName}
              </p>
            </div>
            <button onClick={clearForm} className="text-white text-xl  ">
              <FaTrash />
            </button>
          </div>
        </div>
      )}

      <NavigationButtons
        isFormComplete={allFilled}
        onBack={() => navigate(-1)}
        onNext={() => allFilled && navigate("/skills")}
      />
    </div>
  );
}

export default Education;

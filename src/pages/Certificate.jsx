import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import StepTabs from "../components/StepTabs";
import ProgressBar from "../components/ProgressBar";
import { useOutletContext, useNavigate } from "react-router-dom";
import NavigationButtons from "../components/NavigationButtons";
import {
  FaPlus,
  FaCheckCircle,
  FaChevronDown,
  FaCamera,
  FaTrash,
} from "react-icons/fa";
import { FaDeleteLeft } from "react-icons/fa6";


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

function Certificate() {
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

  const [certName, setCertName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [file, setFile] = useState(null);
  const [allFilled, setAllFilled] = useState(false);

  useEffect(() => {
    setAllFilled(certName && issuer && issueDate && file);
  }, [certName, issuer, issueDate, file]);

  
  const clearForm = () => {
    setCertName("");
    setIssuer("");
    setIssueDate("");
    setFile(null);
  };

  return (
    <div className="min-h-screen py-4 px-2 sm:px-4">
      <Header />
      <StepTabs steps={steps} currentStep={currentStep} />
      <ProgressBar currentStep={currentStep} totalSteps={steps.length} />

      <div className="max-w-3xl mx-auto mt-6 text-[#E63357] text-2xl font-semibold">
        Awards / Achievements (Optional)
      </div>
      <p className="max-w-3xl mx-auto text-[#333] text-sm mb-6">
        Stand out by showing recognition you’ve received for your work or
        talent.
      </p>

      <div className="max-w-full md:max-w-4xl mx-auto border-2 border-[#E0E0E0] p-4 rounded-lg">
        <div className="bg-[#F5F5F5] p-3 rounded-2xl space-y-4">
          <div className="bg-[#82828280] rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <p className="font-semibold text-xs mb-1">CERTIFICATE NAME</p>
              <InputWithIcon
                value={certName}
                onChange={(e) => setCertName(e.target.value)}
                placeholder="Enter certificate name"
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-xs mb-1">ISSUING ORGANIZATION</p>
              <InputWithIcon
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="Enter issuing organization"
              />
            </div>
          </div>

          <div className="bg-[#82828280] rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <p className="font-semibold text-xs mb-1">
                UPLOAD CERTIFICATE IMAGE
              </p>
              <label className="flex justify-between items-center bg-black text-white h-12 rounded-[10px] px-3 cursor-pointer overflow-hidden">
                <span className="truncate">
                  {file ? file.name : "Upload your image"}
                </span>
                {file ? (
                  <FaCheckCircle className="ml-2 text-[#16730F] text-lg" />
                ) : (
                  <FaCamera className="ml-2 text-lg" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files[0] && setFile(e.target.files[0])
                  }
                />
              </label>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-xs mb-1">ISSUING DATE</p>
              <InputWithIcon
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="max-w-xs mx-auto bg-[#00000040] mt-3 rounded-2xl flex">
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
        <div className="max-w-4xl px-4 mt-6 m-auto">
          <div className="max-w-xs m-auto bg-[#16730F] text-white rounded-lg flex flex-col sm:flex-row justify-between sm:items-center p-4 space-y-2 sm:space-y-0">
            <div>
              <p className="font-semibold">{certName}</p>
              <p className="text-sm">@ {issuer}</p>
              <img src={file} alt="" />
            </div>
            <button onClick={clearForm} className="text-white text-xl">
              <FaTrash />
            </button>
          </div>
        </div>
      )}

      <NavigationButtons
        isFormComplete={allFilled}
        onBack={() => navigate(-1)}
        onNext={() => allFilled && navigate("/links")}
      />
    </div>
  );
}

export default Certificate;

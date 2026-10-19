import React, { useState, useEffect } from "react";
import Header from "../../../components/Header";
import StepTabs from "../../../components/StepTabs";
import ProgressBar from "../../../components/ProgressBar";
import { useOutletContext, useNavigate, useLocation } from "react-router-dom";
import NavigationButtons from "../../../components/NavigationButtons";
import { toast } from "react-toastify";
import axiosInstance from "../../../utils/axiosInstance";
import Loader from "../../../components/ui/Loader";
import useAuth from "../../../hooks/useAuth";
import OnboardingLayout from "../../../components/layout/onboardingLayout";
import FormLabel from "../../../components/forms/FormLabel";
import {
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaGlobe,
  FaLink,
} from "react-icons/fa";

// Validation functions for each platform
const validateLinkedIn = (url) => {
  if (!url || !url.trim()) return true;
  const pattern =
    /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[\w-]+\/?$/i;
  return pattern.test(url.trim());
};

const validateTwitter = (url) => {
  if (!url || !url.trim()) return true;
  const pattern = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[\w]+\/?$/i;
  return pattern.test(url.trim());
};

const validateInstagram = (url) => {
  if (!url || !url.trim()) return true;
  const pattern = /^(https?:\/\/)?(www\.)?instagram\.com\/[\w.]+\/?$/i;
  return pattern.test(url.trim());
};

const validatePortfolio = (url) => {
  if (!url || !url.trim()) return true;
  const pattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i;
  return pattern.test(url.trim());
};

function Link() {
  const navigate = useNavigate();
  const { currentStep, isEditMode, cvData, getPath } = useOutletContext();

  const handleStepClick = (path) => {
    navigate(path);
  };
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const steps = [
    "Bio",
    "Education",
    "Skills",
    "Work history",
    "Certificate",
    "Links",
    "Job Type",
  ];

  const [formLinks, setFormLinks] = useState({
    linkedin: "",
    twitter: "",
    instagram: "",
    portfolio: "",
  });

  const [errors, setErrors] = useState({
    linkedin: "",
    twitter: "",
    instagram: "",
    portfolio: "",
  });

  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (isEditMode && cvData?.links && !dataLoaded) {
      const links = cvData.links;
      setFormLinks({
        linkedin: links.linkedin || "",
        twitter: links.twitter || "",
        instagram: links.instagram || "",
        portfolio: links.portfolio || "",
      });
      setDataLoaded(true);
    }
  }, [isEditMode, cvData, dataLoaded]);

  const handleChange = (e, key) => {
    setFormLinks({ ...formLinks, [key]: e.target.value });
    if (errors[key]) {
      setErrors({ ...errors, [key]: "" });
    }
  };

  const validateField = (key, value) => {
    if (!value.trim()) return "";

    switch (key) {
      case "linkedin":
        return validateLinkedIn(value)
          ? ""
          : "Please enter a valid LinkedIn URL (e.g., linkedin.com/in/username)";
      case "twitter":
        return validateTwitter(value)
          ? ""
          : "Please enter a valid X URL (e.g., x.com/username)";
      case "instagram":
        return validateInstagram(value)
          ? ""
          : "Please enter a valid Instagram URL (e.g., instagram.com/username)";
      case "portfolio":
        return validatePortfolio(value)
          ? ""
          : "Please enter a valid URL (e.g., yourwebsite.com)";
      default:
        return "";
    }
  };

  const handleBlur = (key) => {
    const error = validateField(key, formLinks[key]);
    setErrors({ ...errors, [key]: error });
  };

  const linkFields = [
    {
      name: "linkedin",
      label: "LinkedIn",
      icon: FaLinkedin,
      iconColor: "text-[#0077B5]",
      placeholder: "linkedin.com/in/username",
      bgColor: "bg-[#0077B5]/10",
      borderColor: "hover:border-[#0077B5] focus:border-[#0077B5]",
      tooltip: "Your LinkedIn profile URL to showcase your professional network and recommendations",
    },
    {
      name: "twitter",
      label: "X (Twitter)",
      icon: FaTwitter,
      iconColor: "text-[#1DA1F2]",
      placeholder: "x.com/username",
      bgColor: "bg-[#1DA1F2]/10",
      borderColor: "hover:border-[#1DA1F2] focus:border-[#1DA1F2]",
      tooltip: "Your Twitter/X handle or profile link to highlight your industry presence",
    },
    {
      name: "instagram",
      label: "Instagram",
      icon: FaInstagram,
      iconColor: "text-[#E4405F]",
      placeholder: "instagram.com/username",
      bgColor: "bg-[#E4405F]/10",
      borderColor: "hover:border-[#E4405F] focus:border-[#E4405F]",
      tooltip: "Your professional or creative Instagram profile link",
    },
    {
      name: "portfolio",
      label: "Portfolio Website",
      icon: FaGlobe,
      iconColor: "text-[#4A5568]",
      placeholder: "yourwebsite.com",
      bgColor: "bg-gray-100",
      borderColor: "hover:border-gray-400 focus:border-[#16730F]",
      tooltip: "Your personal website, GitHub, Behance, or online portfolio link",
    },
  ];

  const location = useLocation();
  const { email, firstName, lastName, role, mode, followings } =
    location.state || {};

  const hasAnyLink = Object.values(formLinks).some(value => value.trim() !== "");

  return (
    <OnboardingLayout
      steps={steps}
      currentStep={currentStep}
      handleStepClick={handleStepClick}
      getPath={getPath}
      isEditMode={isEditMode}
    >
      <div className="min-h-screen pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#16730F] to-[#145a0c] rounded-2xl shadow-lg mb-4">
              <FaLink className="text-3xl text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#16730F] mb-2">
              Professional Links
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Connect your professional profiles to help employers learn more about you.
              All links are optional and can be added or updated anytime.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#16730F] to-[#145a0c] px-6 py-4">
              <h2 className="text-white text-lg font-semibold flex items-center gap-2">
                <FaLink className="text-white/80" />
                Add Your Links
              </h2>
              <p className="text-white/70 text-sm mt-1">
                Enter your profile URLs below
              </p>
            </div>

            <div className="p-6 space-y-6">
              {linkFields.map((field) => {
                const FieldIcon = field.icon;
                return (
                <div key={field.name} className="group">
                  <FormLabel
                    label={field.label}
                    optional={true}
                    tooltip={field.tooltip}
                    className="text-gray-700 text-sm mb-2"
                  />
                  <div className="relative">
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${field.iconColor} transition-all duration-200 group-focus-within:scale-110`}>
                      <FieldIcon className="text-xl" />
                    </div>
                    <input
                      type="text"
                      value={formLinks[field.name]}
                      onChange={(e) => handleChange(e, field.name)}
                      onBlur={() => handleBlur(field.name)}
                      placeholder={`https://${field.placeholder}`}
                      className={`w-full h-12 pl-12 pr-4 rounded-xl border-2 border-gray-200 bg-gray-50/50 
                        focus:outline-none focus:bg-white transition-all duration-200
                        ${field.borderColor} ${errors[field.name] ? "border-red-500 focus:border-red-500" : ""}
                        hover:border-gray-300`}
                    />
                    {formLinks[field.name] && !errors[field.name] && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 bg-[#16730F] rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  {errors[field.name] && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors[field.name]}
                    </p>
                  )}
                  {!errors[field.name] && formLinks[field.name] && (
                    <p className="text-[#16730F] text-xs mt-2 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Valid URL format
                    </p>
                  )}
                </div>
                );
              })}
            </div>

            {hasAnyLink && (
              <div className="border-t border-gray-100 bg-gray-50/30 px-6 py-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  Preview
                </h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(formLinks).map(([key, value]) => {
                    if (!value.trim()) return null;
                    const field = linkFields.find(f => f.name === key);
                    const Icon = field?.icon;
                    return (
                      <a
                        key={key}
                        href={value.startsWith('http') ? value : `https://${value}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-sm hover:shadow-md transition-all hover:scale-105"
                      >
                        {Icon && <Icon className={`text-base ${field?.iconColor}`} />}
                        <span className="text-gray-700">{field?.label}</span>
                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Privacy Note:</span> Your links will be visible to potential employers viewing your profile.
                  You can add or remove links at any time from your account settings.
                </p>
              </div>
            </div>
          </div>
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
            const linksToSend = Object.entries(formLinks)
              .filter(([, value]) => value.trim() !== "")
              .reduce((acc, [key, value]) => {
                let url = value.trim();
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                  url = `https://${url}`;
                }
                acc[key] = url;
                return acc;
              }, {});

            if (Object.keys(linksToSend).length === 0) {
              if (isEditMode) {
                navigate("/job-type", {
                  state: { profileUpdateComplete: true }
                });
              } else {
                navigate("/job-type", {
                  state: { email, firstName, lastName, role, mode, followings },
                });
              }
              return;
            }

            const data = { userId: user.id, ...linksToSend };
            setIsLoading(true);
            try {
              const response = await axiosInstance.post(
                "/api/cv-builder/links",
                data
              );
              setIsLoading(false);

              if (response.status === 200 || response.status === 201) {
                toast.success("Links saved successfully!");
                if (isEditMode) {
                  navigate("/job-type", {
                    state: { profileUpdateComplete: true }
                  });
                } else {
                  navigate("/job-type", {
                    state: { email, firstName, lastName, role, mode, followings },
                  });
                }
              } else {
                toast.error("Failed to save Links");
              }
            } catch (err) {
              setIsLoading(false);
              console.error("Error:", err);
              toast.error(err.response?.data?.message || "Error saving links");
            }
          }}
          showSkip={true}
          onSkip={() => {
            if (isEditMode) {
              navigate("/job-type", {
                state: { profileUpdateComplete: true }
              });
            } else {
              navigate("/job-type", {
                state: { email, firstName, lastName, role, mode, followings },
              });
            }
          }}
        />

        <Loader show={isLoading} />
      </div>
    </OnboardingLayout>
  );
}

export default Link;
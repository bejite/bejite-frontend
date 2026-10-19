import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import { FaMapMarkerAlt } from "react-icons/fa";
import NavigationButtons from "../../components/NavigationButtons";
import useRecruiterProfile from "../../services/recruiterProfile";
import OnboardingLayout from "../../components/layout/onboardingLayout";
import { COUNTRY_OPTIONS } from "../../data/jobTypeData";
import useCountryStateOptions from "../../hooks/useCountryStateOptions";
import {
  RecruiterFormShell,
  RecruiterPageHero,
  RecruiterSelect,
  RecruiterTextField,
} from "../../components/recruiter/recruiterOnboardingUi";
import { RECRUITER_ONBOARDING_STEPS } from "../../components/recruiter/recruiterOnboardingSteps";

const CoperateLocation = () => {
  const navigate = useNavigate();
  const { currentStep, isEditMode, recruiterData, getPath } =
    useOutletContext();
  const location = useLocation();
  const isIndividual = location.pathname.includes("individual");

  const [dataLoaded, setDataLoaded] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    country: "",
  });
  const [isManualCity, setIsManualCity] = useState(false);

  const { updateLocation } = useRecruiterProfile();

  const handleStepClick = (path) => {
    if (path) navigate(path);
  };

  const { states: stateOptions } = useCountryStateOptions(formData.country);

  useEffect(() => {
    if (isEditMode && recruiterData && !dataLoaded) {
      const country = recruiterData.country || "";
      const city = recruiterData.city || "";
      setFormData({
        address: recruiterData.address || "",
        city: city,
        country: country,
      });
      setDataLoaded(true);
    }
  }, [isEditMode, recruiterData, dataLoaded]);

  useEffect(() => {
    if (!formData.country) return;
    if (stateOptions.length === 0) {
      setIsManualCity(true);
      return;
    }
    if (formData.city) {
      setIsManualCity(!stateOptions.includes(formData.city));
    }
  }, [formData.country, formData.city, stateOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "country") {
      setFormData({
        ...formData,
        country: value,
        city: "",
      });
      setIsManualCity(false);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const isFormComplete = Object.values(formData).every((v) => v.trim() !== "");

  const handleNextStep = async () => {
    if (!isFormComplete) {
      toast.error("Please complete all fields.");
      return;
    }

    const submitData = async () => {
      await updateLocation({
        address: formData.address,
        city: formData.city,
        country: formData.country,
      });
      return "Location saved successfully!";
    };

    try {
      await toast.promise(submitData(), {
        pending: "Saving location...",
        success: "Location saved successfully!",
        error: {
          render({ data }) {
            return `Save failed: ${data}`;
          },
        },
      });

      if (isEditMode) {
        navigate(getPath(currentStep + 1));
      } else {
        navigate(isIndividual ? "/individual/verify" : "/corporate/verify");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSkip = () => {
    if (isEditMode) {
      navigate(getPath(currentStep + 1));
    } else {
      navigate(isIndividual ? "/individual/verify" : "/corporate/verify");
    }
  };

  return (
    <OnboardingLayout
      steps={RECRUITER_ONBOARDING_STEPS}
      currentStep={currentStep}
      handleStepClick={handleStepClick}
      getPath={getPath}
      isEditMode={isEditMode}
    >
      <div className="pb-20">
        <div className="max-w-3xl mx-auto px-4">
          <RecruiterPageHero
            icon={FaMapMarkerAlt}
            eyebrow="Where you hire"
            title="Location"
            description="Jobseekers see your city and region. Your full address stays private until you choose to share it."
          />

          <RecruiterFormShell
            icon={FaMapMarkerAlt}
            sectionTitle="Business location"
            sectionHint="City and country are shown on your public profile."
          >
            <RecruiterTextField
              label="HEADQUARTERS ADDRESS"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street, building, or office address"
              required
              hint="Not shown publicly — used for verification only."
            />

            <RecruiterSelect
              label="COUNTRY"
              name="country"
              value={formData.country}
              onChange={handleChange}
              options={COUNTRY_OPTIONS}
              placeholder="Select your country"
              required
            />

            {isManualCity ? (
              <RecruiterTextField
                label="CITY / STATE"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter your city / state"
                required
              />
            ) : formData.country && stateOptions.length === 0 ? (
              <div className="space-y-1">
                <div onClick={() => setIsManualCity(true)} className="cursor-pointer">
                  <RecruiterSelect
                    label="CITY / STATE"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    options={[]}
                    placeholder="Select your city / state"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  No cities/states found.{" "}
                  <button
                    type="button"
                    onClick={() => setIsManualCity(true)}
                    className="text-[#16730F] hover:underline font-semibold"
                  >
                    input your city/state
                  </button>
                </p>
              </div>
            ) : (
              <RecruiterSelect
                label="CITY / STATE"
                name="city"
                value={formData.city}
                onChange={handleChange}
                options={stateOptions}
                placeholder="Select your city / state"
                required
              />
            )}
          </RecruiterFormShell>
        </div>

        <NavigationButtons
          showSkip={true}
          onSkip={handleSkip}
          isFormComplete={isFormComplete}
          onBack={() => {
            if (isEditMode) {
              navigate(getPath(currentStep - 1));
            } else {
              navigate(-1);
            }
          }}
          onNext={handleNextStep}
        />
      </div>
    </OnboardingLayout>
  );
};

export default CoperateLocation;

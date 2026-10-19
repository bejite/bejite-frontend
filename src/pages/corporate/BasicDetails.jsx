import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import NavigationButtons from "../../components/NavigationButtons";
import useRecruiterProfile from "../../services/recruiterProfile";
import useAuth from "../../hooks/useAuth";
import OnboardingLayout from "../../components/layout/onboardingLayout";
import RecruiterFieldGroup from "../../components/recruiter/RecruiterFieldGroup";
import { navigateBack } from "../../utils/navigateBack";
import { RECRUITER_ONBOARDING_STEPS } from "../../components/recruiter/recruiterOnboardingSteps";
import { updateUser } from "../../features/auth/authSlice";
import {
  formatRecruiterFullName,
  splitRecruiterFullName,
} from "../../utils/recruiterDisplayName";

const CoperateBasicDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { currentStep, isEditMode, recruiterData, getPath } =
    useOutletContext();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    full_name: "",
    job_title: "",
    email: "",
    phone_number: "",
  });

  const { updateBasicDetails } = useRecruiterProfile();

  const fieldGroups = useMemo(
    () => [
      [
        {
          name: "full_name",
          label: "FULL NAME",
          placeholder: "Enter your full name",
          width: "w-full",
        },
      ],
      [
        {
          name: "job_title",
          label: "POSITION / ROLE IN COMPANY",
          placeholder: "e.g. HR Manager, Talent Acquisition Lead",
          width: "w-full",
        },
      ],
      [
        {
          name: "email",
          label: "OFFICIAL EMAIL",
          type: "email",
          placeholder: "your@company.com",
          disabled: true,
          width: "w-full",
          hint: "Signed in with this address — cannot be changed here.",
        },
      ],
      [
        {
          name: "phone_number",
          label: "PHONE NUMBER",
          type: "tel",
          placeholder: "e.g +234 706 004 0000",
          width: "w-full",
        },
      ],
    ],
    [],
  );

  const handleStepClick = (path) => {
    if (path) navigate(path);
  };

  useEffect(() => {
    if (isEditMode) return;

    let storedUser = {};
    try {
      storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      storedUser = {};
    }

    const routeState = location.state || {};
    const resolvedEmail =
      routeState?.email || user?.email || storedUser?.email || "";
    const resolvedName = formatRecruiterFullName(
      routeState?.firstName || user?.firstName || storedUser?.firstName,
      routeState?.lastName || user?.lastName || storedUser?.lastName,
    );
    const resolvedPhone =
      user?.phone_number ||
      user?.phone ||
      storedUser?.phone_number ||
      storedUser?.phone ||
      "";
    const resolvedJobTitle =
      user?.jobTitle ||
      user?.job_title ||
      storedUser?.jobTitle ||
      storedUser?.job_title ||
      "";

    setFormData((prev) => {
      const next = {
        full_name: prev.full_name || resolvedName,
        job_title: prev.job_title || resolvedJobTitle,
        email: prev.email || resolvedEmail,
        phone_number: prev.phone_number || resolvedPhone,
      };
      if (
        prev.full_name === next.full_name &&
        prev.job_title === next.job_title &&
        prev.email === next.email &&
        prev.phone_number === next.phone_number
      ) {
        return prev;
      }
      return next;
    });
  }, [
    isEditMode,
    location.state,
    user?.email,
    user?.firstName,
    user?.lastName,
    user?.jobTitle,
    user?.job_title,
    user?.phone_number,
    user?.phone,
  ]);

  useEffect(() => {
    if (!isEditMode || !recruiterData) return;

    setFormData({
      full_name: formatRecruiterFullName(
        recruiterData.firstName,
        recruiterData.lastName,
      ),
      job_title: recruiterData.job_title || "",
      email: recruiterData.email || "",
      phone_number: recruiterData.phone_number || "",
    });
  }, [
    isEditMode,
    recruiterData,
    recruiterData?.firstName,
    recruiterData?.lastName,
    recruiterData?.job_title,
    recruiterData?.email,
    recruiterData?.phone_number,
  ]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isFormComplete = Object.values(formData).every((v) => v.trim() !== "");

  const handleNextStep = async () => {
    if (!isFormComplete) {
      toast.error("Please complete all fields.");
      return;
    }

    const submitData = async () => {
      await updateBasicDetails({
        full_name: formData.full_name.trim(),
        job_title: formData.job_title.trim(),
        phone_number: formData.phone_number,
      });

      const { firstName, lastName } = splitRecruiterFullName(
        formData.full_name,
      );
      const phone_number = formData.phone_number;
      const job_title = formData.job_title.trim();

      dispatch(
        updateUser({
          firstName,
          lastName,
          phone_number,
          phone: phone_number,
          jobTitle: job_title,
          job_title,
        }),
      );

      try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...stored,
            firstName,
            lastName,
            phone_number,
            phone: phone_number,
            jobTitle: job_title,
            job_title,
          }),
        );
      } catch {
        /* ignore */
      }

      return "Basic details saved successfully!";
    };

    try {
      await toast.promise(submitData(), {
        pending: "Saving basic details...",
        success: "Basic details saved successfully!",
        error: {
          render({ data }) {
            return `Save failed: ${data}`;
          },
        },
      });

      const isIndividual = location.pathname.includes("individual");
      if (isEditMode) {
        navigate(getPath(currentStep + 1));
      } else {
        navigate(isIndividual ? "/individual/profile-setup" : "/corporate/profile-setup");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // const handleSkip = () => {
  //   if (isEditMode) {
  //     navigate(getPath(currentStep + 1));
  //   } else {
  //     navigate("/corporate/profile-setup");
  //   }
  // };

  return (
    <OnboardingLayout
      steps={RECRUITER_ONBOARDING_STEPS}
      currentStep={currentStep}
      handleStepClick={handleStepClick}
      getPath={getPath}
      isEditMode={isEditMode}
    >
      <section className="max-w-3xl font-nunito-semi text-center md:text-start mx-auto px-4 mt-4 text-[#16730F] text-2xl font-semibold">
        Basic Details
      </section>
      <p className="max-w-3xl mx-auto px-4 text-center md:text-start text-[#333] text-[15px]">
        Tell us who you are. This is how jobseekers and your team will reach
        you.
      </p>

      <div className="max-w-4xl mx-auto mt-8 bg-white md:border border-gray-200 rounded-2xl md:shadow-sm p-2 md:p-8">
        <RecruiterFieldGroup
          formData={formData}
          handleChange={handleChange}
          fieldGroups={fieldGroups}
        />
      </div>

      <NavigationButtons
        // showSkip={true}
        // onSkip={handleSkip}
        isFormComplete={isFormComplete}
        onBack={() => {
          if (isEditMode && currentStep > 1) {
            navigate(getPath(currentStep - 1));
            return;
          }
          navigateBack(
            navigate,
            isEditMode ? "/news-feed" : "/employer-option",
          );
        }}
        onNext={handleNextStep}
      />
    </OnboardingLayout>
  );
};

export default CoperateBasicDetails;

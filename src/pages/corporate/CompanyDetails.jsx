import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { updateUser } from "../../features/auth/authSlice";
import { FaBuilding, FaShareAlt } from "react-icons/fa";
import NavigationButtons from "../../components/NavigationButtons";
import useRecruiterProfile from "../../services/recruiterProfile";
import OnboardingLayout from "../../components/layout/onboardingLayout";
import {
  RecruiterFormShell,
  RecruiterPageHero,
  RecruiterTextField,
} from "../../components/recruiter/recruiterOnboardingUi";
import { RECRUITER_ONBOARDING_STEPS } from "../../components/recruiter/recruiterOnboardingSteps";

const validateLinkedIn = (url) => {
  if (!url?.trim()) return true;
  return /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[\w-]+\/?$/i.test(
    url.trim(),
  );
};

const validateTwitter = (url) => {
  if (!url?.trim()) return true;
  return /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[\w]+\/?$/i.test(
    url.trim(),
  );
};

const validateInstagram = (url) => {
  if (!url?.trim()) return true;
  return /^(https?:\/\/)?(www\.)?instagram\.com\/[\w.]+\/?$/i.test(url.trim());
};

const SOCIAL_FIELDS = [
  {
    name: "linkedin",
    label: "LINKEDIN",
    placeholder: "linkedin.com/company/your-company",
    hint: "Company LinkedIn page or your recruiter profile.",
    validate: validateLinkedIn,
    errorMessage:
      "Please enter a valid LinkedIn URL (e.g., linkedin.com/company/your-company)",
  },
  {
    name: "twitter",
    label: "X (TWITTER)",
    placeholder: "x.com/yourcompany",
    hint: "Your company X profile.",
    validate: validateTwitter,
    errorMessage: "Please enter a valid X URL (e.g., x.com/yourcompany)",
  },
  {
    name: "instagram",
    label: "INSTAGRAM",
    placeholder: "instagram.com/yourcompany",
    hint: "Your company Instagram handle.",
    validate: validateInstagram,
    errorMessage:
      "Please enter a valid Instagram URL (e.g., instagram.com/yourcompany)",
  },
];

const CompanyDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentStep, isEditMode, recruiterData, getPath } =
    useOutletContext();
  const location = useLocation();
  const isIndividual = location.pathname.includes("individual");
  const [dataLoaded, setDataLoaded] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    website: "",
    linkedin: "",
    twitter: "",
    instagram: "",
  });
  const [socialErrors, setSocialErrors] = useState({
    linkedin: "",
    twitter: "",
    instagram: "",
  });

  const { updateCompanyDetails } = useRecruiterProfile();

  const handleStepClick = (path) => {
    if (path) navigate(path);
  };

  useEffect(() => {
    if (isEditMode && recruiterData && !dataLoaded) {
      setFormData({
        full_name: recruiterData.company_name || "",
        website: recruiterData.website || "",
        linkedin: recruiterData.linkedin_url || recruiterData.linkedin || "",
        twitter: recruiterData.twitter_url || recruiterData.twitter || "",
        instagram: recruiterData.instagram_url || recruiterData.instagram || "",
      });
      setDataLoaded(true);
    }
  }, [isEditMode, recruiterData, dataLoaded]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (socialErrors[name]) {
      setSocialErrors({ ...socialErrors, [name]: "" });
    }
  };

  const validateSocialField = (field, value) => {
    if (!value.trim()) return "";
    return field.validate(value) ? "" : field.errorMessage;
  };

  const handleSocialBlur = (fieldName) => {
    const field = SOCIAL_FIELDS.find((item) => item.name === fieldName);
    if (!field) return;
    setSocialErrors((prev) => ({
      ...prev,
      [fieldName]: validateSocialField(field, formData[fieldName]),
    }));
  };

  const isFormComplete = formData.full_name.trim() !== "";

  const handleNextStep = async () => {
    if (!isFormComplete) {
      toast.error("Please enter your company name.");
      return;
    }

    const nextSocialErrors = SOCIAL_FIELDS.reduce((acc, field) => {
      acc[field.name] = validateSocialField(field, formData[field.name]);
      return acc;
    }, {});

    setSocialErrors(nextSocialErrors);

    const firstSocialError = Object.values(nextSocialErrors).find(Boolean);
    if (firstSocialError) {
      toast.error(firstSocialError);
      return;
    }

    const submitData = async () => {
      const company_name = formData.full_name.trim();
      const website = formData.website.trim();
      const linkedin = formData.linkedin.trim();
      const twitter = formData.twitter.trim();
      const instagram = formData.instagram.trim();

      await updateCompanyDetails({
        company_name,
        website,
        linkedin,
        twitter,
        instagram,
      });

      dispatch(
        updateUser({
          company_name,
          companyName: company_name,
          website,
          linkedin_url: linkedin,
          twitter_url: twitter,
          instagram_url: instagram,
        }),
      );

      return "Company details saved successfully!";
    };

    try {
      await toast.promise(submitData(), {
        pending: "Saving company details...",
        success: "Company details saved successfully!",
        error: {
          render({ data }) {
            return `Save failed: ${data}`;
          },
        },
      });

      // if (isEditMode) {
      //   navigate(getPath(currentStep + 1));
      // } else {
      //   navigate("/corporate/location");
      // }

      const isIndividual = location.pathname.includes("individual");
      if (isEditMode) {
        navigate(getPath(currentStep + 1));
      } else {
        navigate(isIndividual ? "/individual/location" : "/corporate/location");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // const handleSkip = () => {
  //   if (isEditMode) {
  //     navigate(getPath(currentStep + 1));
  //   } else {
  //     navigate("/corporate/location");
  //   }
  // };

  const handleSkip = () => {
    if (isEditMode) {
      navigate(getPath(currentStep + 1));
    } else {
      navigate(isIndividual ? "/individual/location" : "/corporate/location");
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
            icon={FaBuilding}
            eyebrow="Your organization"
            title="Company details"
            description="Share your registered business name so candidates know who they're applying to."
          />

          <RecruiterFormShell
            icon={FaBuilding}
            sectionTitle="Business information"
            sectionHint="Use the legal name that matches your verification documents."
          >
            <RecruiterTextField
              label="COMPANY NAME"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter your registered company name"
              required
              hint="Must match legal documents used for verification."
            />
            <RecruiterTextField
              label="COMPANY WEBSITE"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://www.yourcompany.com"
              optional
              hint="Adds credibility to your recruiter profile."
            />
          </RecruiterFormShell>

          <div className="mt-6">
            <RecruiterFormShell
              icon={FaShareAlt}
              sectionTitle="Social media handles"
              sectionHint="Optional — help candidates find and trust your brand online."
            >
              {SOCIAL_FIELDS.map((field) => (
                <div key={field.name}>
                  <RecruiterTextField
                    label={field.label}
                    name={field.name}
                    type="url"
                    value={formData[field.name]}
                    onChange={handleChange}
                    onBlur={() => handleSocialBlur(field.name)}
                    placeholder={field.placeholder}
                    optional
                    hint={field.hint}
                  />
                  {socialErrors[field.name] && (
                    <p className="text-xs text-red-500 mt-1">
                      {socialErrors[field.name]}
                    </p>
                  )}
                </div>
              ))}
            </RecruiterFormShell>
          </div>
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

export default CompanyDetails;

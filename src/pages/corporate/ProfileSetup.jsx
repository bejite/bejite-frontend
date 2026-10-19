import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { updateUser } from "../../features/auth/authSlice";
import NavigationButtons from "../../components/NavigationButtons";
import ImageUpload from "../../components/ImageUpload";
import useRecruiterProfile from "../../services/recruiterProfile";
import { profilePhotoUrl } from "../../utils/profilePhotoUrl";
import { fetchCurrentUserProfilePhoto } from "../../services/profilePhotoService";
import { getUser, pickProfilePhotoPath } from "../../utils/tokenManager";
import useAuth from "../../hooks/useAuth";
import OnboardingLayout from "../../components/layout/onboardingLayout";
import RecruiterFieldGroup from "../../components/recruiter/RecruiterFieldGroup";
import { navigateBack } from "../../utils/navigateBack";
import { RECRUITER_ONBOARDING_STEPS } from "../../components/recruiter/recruiterOnboardingSteps";
import {
  PROFILE_PHOTO_MAX_BYTES,
  getUploadSizeError,
} from "../../utils/uploadLimits";

const CoperateProfileSetup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentStep, isEditMode, recruiterData, getPath } =
    useOutletContext();
  const location = useLocation();
  const isIndividual = location.pathname.includes("individual");
  const { user: authUser } = useAuth();

  const [dataLoaded, setDataLoaded] = useState(false);
  const [formData, setFormData] = useState({
    nickname: "",
    summary: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const { updateProfileSetup, uploadProfilePhoto } = useRecruiterProfile();

  const fieldGroups = useMemo(
    () => [
      [
        {
          name: "nickname",
          label: "UNIQUE IDENTIFIER",
          placeholder: "@your-handle",
          width: "w-full",
        },
      ],
      [
        {
          name: "summary",
          label: "BIO / SUMMARY (1000 words max)",
          type: "textarea",
          placeholder:
            "e.g. I run a food delivery brand and need a social media manager for daily content.",
          maxWords: 1000,
          rows: 8,
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
    if (!isEditMode) return;
    let cancelled = false;
    (async () => {
      const fromStorage =
        pickProfilePhotoPath(authUser) || pickProfilePhotoPath(getUser());
      if (!cancelled && fromStorage) {
        setImagePreview(profilePhotoUrl(fromStorage) ?? null);
      }
      try {
        const fromApi = await fetchCurrentUserProfilePhoto();
        if (!cancelled && fromApi)
          setImagePreview(profilePhotoUrl(fromApi) ?? null);
      } catch {
        /* optional */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEditMode, authUser]);

  useEffect(() => {
    if (!isEditMode || dataLoaded) return;

    const loadEditData = async () => {
      if (recruiterData) {
        setFormData({
          nickname: recruiterData.nickname || "",
          summary: recruiterData.summary || "",
        });
        const fromProfile =
          recruiterData.profile_photo || recruiterData.profilePhoto;
        if (fromProfile) {
          setImagePreview(profilePhotoUrl(fromProfile) ?? null);
        }
      }

      const fromStorage =
        pickProfilePhotoPath(authUser) || pickProfilePhotoPath(getUser());
      if (fromStorage) {
        setImagePreview(profilePhotoUrl(fromStorage) ?? null);
      }

      try {
        const fromApi = await fetchCurrentUserProfilePhoto();
        if (fromApi) setImagePreview(profilePhotoUrl(fromApi) ?? null);
      } catch {
        /* keep existing preview */
      }

      setDataLoaded(true);
    };

    if (recruiterData !== null && recruiterData !== undefined) {
      loadEditData();
    }
  }, [isEditMode, recruiterData, dataLoaded, authUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeError = getUploadSizeError(file, PROFILE_PHOTO_MAX_BYTES);
      if (sizeError) {
        toast.error(sizeError);
        e.target.value = "";
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const isFormComplete =
    formData.nickname.trim() !== "" &&
    formData.summary.trim() !== "" &&
    (imagePreview || imageFile);

  const handleNextStep = async () => {
    if (!isFormComplete) {
      toast.error("Please complete all fields and upload a profile photo.");
      return;
    }

    const submitProfileSequence = async () => {
      await updateProfileSetup({
        nickname: formData.nickname,
        summary: formData.summary,
      });

      if (imageFile) {
        const photoRes = await uploadProfilePhoto(imageFile);
        const photoUrl =
          photoRes?.profilePhoto ??
          photoRes?.profile_photo ??
          photoRes?.image ??
          photoRes?.data?.profilePhoto ??
          photoRes?.data?.profile_photo ??
          photoRes?.url ??
          null;
        if (photoUrl) {
          dispatch(
            updateUser({
              image: photoUrl,
              profilePhoto: photoUrl,
              profile_photo: photoUrl,
            }),
          );
        }
      }

      return "Profile setup saved successfully!";
    };

    try {
      await toast.promise(submitProfileSequence(), {
        pending: "Saving profile setup...",
        success: "Profile setup saved successfully!",
        error: {
          render({ data }) {
            return `Save failed: ${data}`;
          },
        },
      });

      if (isEditMode) {
        navigate(getPath(currentStep + 1));
      } else {
        navigate(
          isIndividual
            ? "/individual/company-details"
            : "/corporate/company-details",
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSkip = () => {
    if (isEditMode) {
      navigate(getPath(currentStep + 1));
    } else {
      navigate(
        isIndividual
          ? "/individual/company-details"
          : "/corporate/company-details",
      );
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
      <section className="max-w-3xl font-nunito-semi text-center md:text-start mx-auto px-4 mt-4 text-[#16730F] text-2xl font-semibold">
        Profile Setup
      </section>
      <p className="max-w-3xl mx-auto px-4 text-center md:text-start text-[#333] text-[15px]">
        Introduce yourself to jobseekers. Add a photo and a short summary.
      </p>

      <div className="max-w-4xl mx-auto mt-8 bg-white md:border border-gray-200 rounded-2xl md:shadow-sm flex flex-col lg:flex-row gap-10 p-2 md:p-8">
        <ImageUpload
          imagePreview={imagePreview}
          handleImageChange={handleImageChange}
        />

        <RecruiterFieldGroup
          formData={formData}
          handleChange={handleChange}
          fieldGroups={fieldGroups}
        />
      </div>

      <NavigationButtons
        showSkip={true}
        onSkip={handleSkip}
        isFormComplete={isFormComplete}
        onBack={() => {
          if (isEditMode) {
            navigate(getPath(currentStep - 1));
          } else {
            navigateBack(
              navigate,
              isIndividual
                ? "/individual/basic-details"
                : "/corporate/basic-details",
            );
          }
        }}
        onNext={handleNextStep}
      />
    </OnboardingLayout>
  );
};

export default CoperateProfileSetup;

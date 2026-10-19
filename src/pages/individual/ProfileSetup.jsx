import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import NavigationButtons from "../../components/NavigationButtons";
import ProgressBar from "../../components/ProgressBar";
import StepTabs from "../../components/StepTabs";
import Header from "../../components/Header";
import ImageUpload from "../../components/ImageUpload";
import useRecruiterProfile from "../../services/recruiterProfile";
import { updateUser } from "../../features/auth/authSlice";
import { profilePhotoUrl } from "../../utils/profilePhotoUrl";
import { fetchCurrentUserProfilePhoto } from "../../services/profilePhotoService";
import { getUser, pickProfilePhotoPath } from "../../utils/tokenManager";
import useAuth from "../../hooks/useAuth";
import {
  PROFILE_PHOTO_MAX_BYTES,
  getUploadSizeError,
} from "../../utils/uploadLimits";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentStep, isEditMode, recruiterData, getPath } = useOutletContext();
  const { user: authUser } = useAuth();
  const { updateProfileSetup, uploadProfilePhoto } = useRecruiterProfile();

  const steps = ["Basic Details", "Profile Setup", "Location"];

  const [dataLoaded, setDataLoaded] = useState(false);

  const [formData, setFormData] = useState({
    nickname: "",
    summary: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
    if (!isFormComplete || submitting) {
      if (!isFormComplete) {
        toast.error("Please complete all fields and upload a profile photo.");
      }
      return;
    }

    const submitProfileSequence = async () => {
      await updateProfileSetup({
        nickname: formData.nickname.trim(),
        summary: formData.summary.trim(),
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

    setSubmitting(true);
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
      navigate(getPath(3));
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate(getPath(3));
  };

  return (
    <div className="bg-white min-h-screen">
      <Header />

      <StepTabs
        steps={steps}
        currentStep={currentStep}
        getPath={getPath}
        isEditMode={isEditMode}
      />
      <ProgressBar currentStep={currentStep} totalSteps={steps.length} />

      <section className="max-w-3xl mx-auto px-4 mt-4 text-[#16730F] text-2xl font-semibold">
        Profile Setup
      </section>
      <p className="max-w-3xl mx-auto px-4 text-[#333] text-[15px]">
        Introduce yourself to jobseekers
      </p>

      <div className="max-w-4xl mx-auto mt-8 bg-white md:border border-gray-200 rounded-2xl md:shadow-sm p-4 md:p-8 flex flex-col lg:flex-row gap-8 items-start">
        <ImageUpload
          imagePreview={imagePreview}
          handleImageChange={handleImageChange}
          bio={formData.bio}
          onBioChange={handleChange}
        />

        <div className="w-full flex-1 space-y-5">
          <div>
            <label className="font-semibold text-[12px] mb-2 block">
              Unique Identifier (required)
            </label>
            <input
              type="text"
              name="nickname"
              placeholder="@Nickname"
              value={formData.nickname}
              onChange={handleChange}
              className="w-full h-11 bg-white border border-gray-300 rounded-xl px-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#16730F] focus:border-transparent transition-all shadow-sm placeholder-gray-400"
            />
          </div>

          <div>
            <label className="font-semibold text-[12px] mb-2 block">
              Bio/Summary (Required, 500 chars max)
            </label>
            <textarea
              name="summary"
              placeholder="e.g., I own a food delivery brand and need a social media manager for daily content."
              value={formData.summary}
              onChange={handleChange}
              rows={4}
              maxLength={500}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#16730F] focus:border-transparent transition-all shadow-sm resize-none"
            />
          </div>
        </div>
      </div>

      <NavigationButtons
        showSkip
        onSkip={handleSkip}
        isFormComplete={isFormComplete && !submitting}
        onBack={() => {
          if (isEditMode) {
            navigate(getPath(currentStep - 1));
            return;
          }
          navigate(-1);
        }}
        onNext={handleNextStep}
      />
    </div>
  );
};

export default ProfileSetup;

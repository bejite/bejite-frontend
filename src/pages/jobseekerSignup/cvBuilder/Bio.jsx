import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { navigateBack } from "../../../utils/navigateBack";
import { useDispatch } from "react-redux";
import StepTabs from "../../../components/StepTabs";
import ProgressBar from "../../../components/ProgressBar";
import ImageUpload from "../../../components/ImageUpload";
import FieldGroup from "../../../components/FieldGroup";
import NavigationButtons from "../../../components/NavigationButtons";
import Header from "../../../components/Header";
import { toast } from "react-toastify";
import useLocalStorage from "../../../hooks/useLocalStorage";
import CreateBio from "../../../services/createBio";
import { countries } from "../../../data/countries";
import { steps } from "../../../data/bioSteps";
import { profilePhotoUrl } from "../../../utils/profilePhotoUrl";
import { updateUser } from "../../../features/auth/authSlice";
import { fetchCurrentUserProfilePhoto } from "../../../services/profilePhotoService";
import { getUser, pickProfilePhotoPath } from "../../../utils/tokenManager";
import useAuth from "../../../hooks/useAuth";
import OnboardingLayout from "../../../components/layout/onboardingLayout";
import {
  formatPhoneForStorage,
  isPhoneValid,
} from "../../../utils/displayFormatUtils";
import {
  PROFILE_PHOTO_MAX_BYTES,
  getUploadSizeError,
} from "../../../utils/uploadLimits";

const Bio = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentStep, isEditMode, cvData, getPath } = useOutletContext();
  const { user: authUser } = useAuth();

  const handleStepClick = (path) => {
    navigate(path);
  };

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [formData, setFormData] = useState({
    nickname: "",
    phone: "",
    gender: "",
    maritalStatus: "",
    age: "",
    dob: "",
    country: "",
    street: "",
    city: "",
    tribe: "",
    zip: "",
    bio: "",
  });

  // Helper function to safely convert values to strings
  const toString = (value) => {
    if (value === null || value === undefined) return "";
    return String(value);
  };

  const applyPhotoPreview = (stored) => {
    if (!stored) return;
    const url = profilePhotoUrl(stored);
    if (url) setImagePreview(url);
  };

  // Restore photo immediately in edit mode (not only from user_bio row).
  useEffect(() => {
    if (!isEditMode) return;
    let cancelled = false;
    (async () => {
      const fromStorage =
        pickProfilePhotoPath(authUser) || pickProfilePhotoPath(getUser());
      if (!cancelled && fromStorage) applyPhotoPreview(fromStorage);
      try {
        const fromApi = await fetchCurrentUserProfilePhoto();
        if (!cancelled && fromApi) applyPhotoPreview(fromApi);
      } catch {
        /* optional */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEditMode, authUser]);

  // Load existing bio + photo when in edit mode
  useEffect(() => {
    if (!isEditMode || dataLoaded) return;

    const loadEditData = async () => {
      const bio = cvData?.bio;
      if (bio) {
        setFormData({
          nickname: toString(bio.nickname),
          phone: toString(bio.phone),
          gender: toString(bio.gender),
          maritalStatus: toString(bio.marital_status),
          age: toString(bio.age),
          dob: toString(bio.dob || bio.date_of_birth).slice(0, 10),
          country: toString(bio.country),
          street: toString(bio.street),
          city: toString(bio.city),
          tribe: toString(bio.tribe),
          zip: toString(bio.zip),
          bio: toString(bio.bio),
        });
        applyPhotoPreview(bio.profile_photo);
      }

      const fromStorage =
        pickProfilePhotoPath(authUser) || pickProfilePhotoPath(getUser());
      if (fromStorage) applyPhotoPreview(fromStorage);

      try {
        const fromApi = await fetchCurrentUserProfilePhoto();
        if (fromApi) applyPhotoPreview(fromApi);
      } catch {
        /* keep existing preview */
      }

      setDataLoaded(true);
    };

    if (cvData !== null && cvData !== undefined) {
      loadEditData();
    }
  }, [isEditMode, cvData, dataLoaded, authUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Ensure all form values are strings
    setFormData((prev) => ({ ...prev, [name]: String(value) }));
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
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const requiredFields = [
    "nickname",
    "phone",
    "gender",
    "maritalStatus",
    "country",
    "street",
    "city",
    "bio",
  ];
  const isFormComplete =
    requiredFields.every((key) => {
      const v = formData[key];
      const str = typeof v === "string" ? v : String(v || "");
      return str.trim() !== "";
    }) &&
    (imageFile || imagePreview);

  //pass data and image to createBio Api
  const { postBioData, uploadProfileImage } = CreateBio();
  const { id: userId } = useLocalStorage("user");

  // Utility function to normalize text for consistent storage
  const normalizeText = (text) => {
    if (!text || typeof text !== "string") return text;
    return text.trim().toLowerCase();
  };

  // function that chains both API calls
  const handleNextStep = async () => {
    if (!isFormComplete) {
      toast.error("Please complete all required fields and upload an image.");
      return;
    }

    const phoneE164 = formatPhoneForStorage(formData.phone, formData.country);
    if (!phoneE164 || !isPhoneValid(phoneE164, formData.country)) {
      toast.error("Enter a valid phone number for your selected country.");
      return;
    }

    const bioPayload = {
      userId,
      nickname: normalizeText(formData.nickname),
      phone: phoneE164,
      gender: normalizeText(formData.gender),
      maritalStatus: normalizeText(formData.maritalStatus),
      age: formData.age ? Number(formData.age) : null,
      dob: formData.dob || null,
      country: normalizeText(formData.country),
      street: normalizeText(formData.street),
      city: normalizeText(formData.city),
      tribe: formData.tribe ? normalizeText(formData.tribe) : null,
      zip: formData.zip ? normalizeText(formData.zip) : null,
      bio: formData.bio,
    };

    //  sequential logic
    const submitProfileSequence = async () => {
      await postBioData(bioPayload);
      let photoResponse = null;
      if (imageFile) {
        photoResponse = await uploadProfileImage(imageFile);
        const photoUrl =
          photoResponse?.data?.profilePhoto ??
          photoResponse?.data?.profile_photo ??
          photoResponse?.profilePhoto ??
          null;
        if (photoUrl) {
          dispatch(
            updateUser({
              image: photoUrl,
              profile_photo: photoUrl,
              profilePhoto: photoUrl,
            }),
          );
        }
      } else if (!imagePreview) {
        throw new Error("Image file is missing for upload.");
      }

      return "Profile updated successfully!";
    };

    try {
      await toast.promise(submitProfileSequence(), {
        pending: "Saving personal information...",
        success: "Profile updated successfully!",
        error: {
          render({ data }) {
            return `Save failed: ${data}`;
          },
        },
      });

      // Navigate only after the entire sequence completes successfully
      if (isEditMode) {
        navigate(getPath(currentStep + 1));
      } else {
        navigate("/education");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <OnboardingLayout
      steps={steps}
      currentStep={currentStep}
      handleStepClick={handleStepClick}
      getPath={getPath}
      isEditMode={isEditMode}
    >
      <section className="max-w-3xl font-nunito-semi text-center md:text-start mx-auto px-4 text-[#16730F] text-2xl font-semibold">
        Bio/Personal Information
      </section>
      <p className="max-w-3xl mx-auto px-4 text-center md:text-start text-[#333] text-[15px]">
        Tell us who you are. This is the first impression employers get.
      </p>

      <div className="max-w-4xl mx-auto bg-white md:border border-gray-200 rounded-2xl md:shadow-sm flex flex-col lg:flex-row gap-10 p-2 md:p-8">
        <ImageUpload
          imagePreview={imagePreview}
          handleImageChange={handleImageChange}
          bio={formData.bio}
          onBioChange={handleChange}
        />

        <FieldGroup
          formData={formData}
          handleChange={handleChange}
          countries={countries}
        />
      </div>

      <NavigationButtons
        isFormComplete={isFormComplete}
        // showSkip={true}
        // onSkip={() => {
        //   if (isEditMode) {
        //     navigate(getPath(currentStep + 1));
        //   } else {
        //     navigate("/links");
        //   }
        // }}
        onBack={() =>
          navigateBack(navigate, isEditMode ? "/news-feed" : "/resume")
        }
        onNext={handleNextStep}
      />
    </OnboardingLayout>
  );
};

export default Bio;

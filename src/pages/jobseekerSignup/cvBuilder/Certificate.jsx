import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate, useLocation } from "react-router-dom";
import NavigationButtons from "../../../components/NavigationButtons";
import {
  FaPlus,
  FaCamera,
  FaTrash,
  FaCheck,
} from "react-icons/fa";
import { toast } from "react-toastify";

import useAuth from "../../../hooks/useAuth";
import useLocalStorage from "../../../hooks/useLocalStorage";
import { useCreateCertificate } from "../../../services/certificateService";
import OnboardingLayout from "../../../components/layout/onboardingLayout";
import FormLabel from "../../../components/forms/FormLabel";
import axiosInstance from "../../../utils/axiosInstance";
import {
  CERTIFICATE_MAX_BYTES,
  getUploadSizeError,
} from "../../../utils/uploadLimits";

const ALLOWED_CERTIFICATE_TYPES = new Set(["image/jpeg", "image/png"]);
const ALLOWED_CERTIFICATE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);

const isAllowedCertificateFile = (selectedFile) => {
  if (!selectedFile) return false;

  if (ALLOWED_CERTIFICATE_TYPES.has(selectedFile.type)) {
    return true;
  }

  const extension = `.${selectedFile.name.split(".").pop()?.toLowerCase() || ""}`;
  return ALLOWED_CERTIFICATE_EXTENSIONS.has(extension);
};

const InputWithIcon = ({ value, onChange, placeholder, type = "text" }) => (
  <div className="relative w-full">
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full h-12 border-2 rounded-[10px] text-sm p-2 pr-10 focus:outline-1 focus:outline-[#16730F] ${
        value ? "border-[#828282]" : "border-[#F5F5F5]"
      } ${type === "date" && value ? "hide-calendar-icon" : ""}`}
    />
    {value && (
      <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-[#16730F] text-lg" />
    )}
  </div>
);

const mapExistingCertificate = (cert) => ({
  id: cert.id,
  certName: cert.cert_name || cert.certName || "",
  issuer: cert.issuer || "",
  issueDate: cert.issue_date || cert.issueDate || "",
  fileUrl: cert.file_url || cert.fileUrl || null,
  fileName: cert.file_name || cert.fileName || null,
});

function Certificate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { currentStep, isEditMode, cvData, getPath } = useOutletContext();
  const { id: localUserId } = useLocalStorage("user");
  const userId = user?.id || localUserId;

  const handleStepClick = (path) => {
    navigate(path);
  };
  const steps = [
    "Bio",
    "Education",
    "Skills",
    "Work history",
    "Certificate",
    "Links",
    "Job Type",
  ];

  const [certName, setCertName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [allFilled, setAllFilled] = useState(false);
  const [savedCertificates, setSavedCertificates] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { postCertficateData, uploadCertificateFile } = useCreateCertificate();

  const { email, firstName, lastName, role, mode, followings } =
    location.state || {};

  const isFormEmpty = !certName && !issuer && !issueDate && !file;
  const canProceed = allFilled || isFormEmpty;

  useEffect(() => {
    setAllFilled(Boolean(certName && issuer && issueDate && file));
  }, [certName, issuer, issueDate, file]);

  useEffect(() => {
    if (!file) {
      setFilePreview(null);
      return undefined;
    }

    const previewUrl = URL.createObjectURL(file);
    setFilePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [file]);

  useEffect(() => {
    if (
      isEditMode &&
      cvData?.certificates &&
      Array.isArray(cvData.certificates) &&
      !dataLoaded
    ) {
      setSavedCertificates(cvData.certificates.map(mapExistingCertificate));
      setDataLoaded(true);
    }
  }, [isEditMode, cvData, dataLoaded]);

  const clearForm = () => {
    setCertName("");
    setIssuer("");
    setIssueDate("");
    setFile(null);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!isAllowedCertificateFile(selectedFile)) {
      toast.error("Only JPG and PNG images are allowed.");
      event.target.value = "";
      return;
    }

    const sizeError = getUploadSizeError(selectedFile, CERTIFICATE_MAX_BYTES);
    if (sizeError) {
      toast.error(sizeError);
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

  const goNext = () => {
    if (isEditMode) {
      navigate(getPath(currentStep + 1));
    } else {
      navigate("/links", {
        state: { email, firstName, lastName, role, mode, followings },
      });
    }
  };

  const saveCurrentCertificate = async () => {
    if (!userId) {
      throw new Error("Could not determine your account. Please sign in again.");
    }

    if (!certName || !issuer || !issueDate || !file) {
      throw new Error("Please complete all certificate fields or clear the form.");
    }

    const payLoad = {
      certName,
      issuer,
      issueDate,
    };

    const result = await postCertficateData(payLoad);
    const certificateId = result?.data?.id;

    let fileUrl = filePreview;
    if (file && certificateId) {
      const uploadResult = await uploadCertificateFile(
        userId,
        certificateId,
        file,
      );
      fileUrl =
        uploadResult?.data?.file_url ||
        uploadResult?.data?.fileUrl ||
        uploadResult?.file_url ||
        filePreview;
    }

    const savedEntry = {
      id: certificateId,
      certName,
      issuer,
      issueDate,
      fileUrl,
      fileName: file?.name || null,
    };

    setSavedCertificates((prev) => [...prev, savedEntry]);
    clearForm();
    return savedEntry;
  };

  const addMore = async () => {
    if (!allFilled) {
      toast.error("Please complete all fields before adding another certificate.");
      return;
    }

    const isDuplicate = savedCertificates.some(
      (item) =>
        item.certName === certName &&
        item.issuer === issuer &&
        item.issueDate === issueDate,
    );
    if (isDuplicate) {
      toast.warning("This certificate already exists");
      return;
    }

    setIsSaving(true);
    try {
      await toast.promise(saveCurrentCertificate(), {
        pending: "Saving certificate...",
        success: "Certificate added",
        error: {
          render({ data }) {
            return (
              data?.message ||
              (typeof data === "string" ? data : null) ||
              "Failed to save certificate"
            );
          },
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cert, index) => {
    try {
      if (cert.id && userId) {
        await axiosInstance.delete(
          `/api/cv-builder/certificates/${userId}/${cert.id}`,
        );
      }
      setSavedCertificates((prev) => prev.filter((_, idx) => idx !== index));
      toast.success("Certificate removed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete certificate");
    }
  };

  const handleSubmit = async () => {
    if (isFormEmpty) {
      goNext();
      return;
    }

    if (!allFilled) {
      toast.error("Please complete all certificate fields or clear the form.");
      return;
    }

    setIsSaving(true);
    try {
      await toast.promise(saveCurrentCertificate(), {
        pending: "Saving Certificate....",
        success: "Certificate Added Successfully",
        error: {
          render({ data }) {
            return (
              data?.message ||
              (typeof data === "string" ? data : null) ||
              "Failed to save certificate"
            );
          },
        },
      });
      goNext();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
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
      <div>
        <div className="max-w-3xl mx-auto mt-6 text-[#16730F] text-2xl font-semibold">
          Awards / Achievements (Optional)
        </div>
        <p className="max-w-3xl mx-auto text-[#333] text-sm mb-6">
          Stand out by showing recognition you’ve received for your work or
          talent.
        </p>

        <div className="max-w-full md:max-w-4xl mx-auto border-2 border-[#E0E0E0] p-4 rounded-lg">
          <div className="bg-[#F5F5F5] p-3 rounded-2xl space-y-4">
            <div className="bg-[#fff] rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <FormLabel
                  label="CERTIFICATE NAME"
                  tooltip="The title of the award, license, or certificate you earned"
                />
                <InputWithIcon
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  placeholder="Enter certificate name"
                />
              </div>
              <div className="flex-1">
                <FormLabel
                  label="ISSUING ORGANIZATION"
                  tooltip="The organization, institution, or authority that issued the certificate"
                />
                <InputWithIcon
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  placeholder="Enter issuing organization"
                />
              </div>
            </div>

            <div className="bg-[#fff] rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <FormLabel
                  label="UPLOAD CERTIFICATE IMAGE (JPG OR PNG, MAX 5MB)"
                  tooltip="A clear image (JPG or PNG) of your certificate or credential"
                />
                <label className="flex justify-between items-center bg-black text-white h-12 rounded-[10px] px-3 cursor-pointer overflow-hidden">
                  <span className="truncate">
                    {file ? file.name : "Upload JPG or PNG"}
                  </span>
                  {file ? (
                    <FaCheck className="ml-2 text-[#16730F] text-lg" />
                  ) : (
                    <FaCamera className="ml-2 text-lg" />
                  )}
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    className="hidden focus:outline-1 focus:outline-[#16730F]"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <div className="flex-1">
                <FormLabel
                  label="ISSUING DATE"
                  tooltip="The date on which the certificate or award was issued"
                />
                <InputWithIcon
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="max-w-xs mx-auto bg-[#00000040] mt-3 rounded-2xl flex">
              <button
                type="button"
                onClick={addMore}
                disabled={!allFilled || isSaving}
                className={`flex-1 cursor-pointer h-16 flex items-center justify-center gap-2 text-white border-2 rounded-lg text-sm ${
                  allFilled && !isSaving
                    ? "bg-[#16730F] border-[#16730F] hover:bg-[#145a0c]"
                    : "bg-transparent border-[#F5F5F5] cursor-not-allowed opacity-70"
                }`}
              >
                ADD MORE <FaPlus />
              </button>
            </div>
          </div>
        </div>

        {savedCertificates.length > 0 && (
          <div className="max-w-4xl px-4 mt-6 m-auto space-y-3">
            {savedCertificates.map((cert, index) => (
              <div
                key={cert.id || `${cert.certName}-${cert.issueDate}-${index}`}
                className="max-w-xs m-auto bg-[#16730F] text-white rounded-lg flex flex-col sm:flex-row justify-between sm:items-center p-4 space-y-2 sm:space-y-0"
              >
                <div>
                  <p className="font-semibold">{cert.certName}</p>
                  <p className="text-sm">@ {cert.issuer}</p>
                  {cert.issueDate && (
                    <p className="text-xs opacity-90 mt-1">{cert.issueDate}</p>
                  )}
                  {cert.fileUrl && (
                    <img
                      src={cert.fileUrl}
                      alt={cert.certName}
                      className="mt-2 max-h-24 rounded"
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(cert, index)}
                  className="text-white text-xl"
                  aria-label="Delete certificate"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}

        <NavigationButtons
          isFormComplete={canProceed && !isSaving}
          isLoading={isSaving}
          onBack={() => {
            if (isEditMode) {
              navigate(getPath(currentStep - 1));
            } else {
              navigate(-1);
            }
          }}
          onNext={handleSubmit}
          showSkip={true}
          onSkip={() => {
            if (isEditMode) {
              navigate(getPath(currentStep + 1));
            } else {
              navigate("/links", {
                state: { email, firstName, lastName, role, mode, followings },
              });
            }
          }}
        />
      </div>
    </OnboardingLayout>
  );
}

export default Certificate;

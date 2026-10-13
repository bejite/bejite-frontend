import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate, useLocation } from "react-router-dom";
import NavigationButtons from "../../../components/NavigationButtons";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaTrash,
  FaCheck,
  FaAward,
  FaBuilding,
  FaCalendarAlt,
  FaCamera,
} from "react-icons/fa";

import useAuth from "../../../hooks/useAuth";
import useLocalStorage from "../../../hooks/useLocalStorage";
import { useCreateCertificate } from "../../../services/certificateService";
import OnboardingLayout from "../../../components/layout/onboardingLayout";
import DeleteModal from "../../../components/modal/DeleteModal";
import { InputWithIcon } from "../../../components/forms/InputIcon";
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
  const [certToDelete, setCertToDelete] = useState(null);
  const [deletingCert, setDeletingCert] = useState(false);
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
      <div className="pb-20">
        <div className="max-w-3xl mx-auto mt-6 text-[#16730F] text-2xl font-semibold">
          Awards / Achievements (Optional)
        </div>
        <p className="max-w-3xl mx-auto text-[#333] text-sm mb-6">
          Stand out by showing recognition you’ve received for your work or talent.
        </p>

        <div className="max-w-4xl mx-auto border-2 border-[#E0E0E0] p-4 rounded-lg overflow-visible">
          <div className="bg-[#F5F5F5] p-3 rounded-2xl space-y-4 overflow-visible">
            <div className="bg-[#fff] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 overflow-visible">
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
                    <FaCheck className="ml-2 text-[#16730F] text-lg shrink-0" />
                  ) : (
                    <FaCamera className="ml-2 text-lg shrink-0" />
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

            <div className="max-w-2xs bg-[#00000040] mt-3 ml-auto rounded-2xl flex">
              <button
                type="button"
                onClick={addMore}
                disabled={!allFilled || isSaving}
                className={`flex-1 h-16 flex items-center justify-center gap-2 text-white border-2 rounded-lg text-sm transition-all ${
                  allFilled && !isSaving
                    ? "bg-[#16730F] border-[#16730F] cursor-pointer hover:bg-[#145a0c] transform hover:scale-105"
                    : "bg-transparent border-[#F5F5F5] cursor-not-allowed opacity-50"
                }`}
              >
                ADD MORE <FaPlus />
              </button>
            </div>
          </div>
        </div>

        {/* Added Certificates: full-width cards matching work history */}
        {savedCertificates.length > 0 && (
          <div className="w-full max-w-4xl mx-auto mt-6 space-y-4 px-1">
            {savedCertificates.map((cert, index) => (
              <div
                key={cert.id || `${cert.certName}-${cert.issueDate}-${index}`}
                className="w-full bg-white border border-gray-200 hover:border-[#16730F]/40 shadow-sm hover:shadow-md transition-all rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#16730F] rounded-l-xl"></div>
                <div className="flex items-start gap-4 flex-1 min-w-0 pl-1">
                  <div className="w-11 h-11 rounded-xl bg-[#16730F]/10 text-[#16730F] flex items-center justify-center shrink-0 group-hover:bg-[#16730F] group-hover:text-white transition-colors duration-200">
                    <FaAward className="text-lg" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-base sm:text-lg text-[#1A3E32] tracking-tight truncate">
                      {cert.certName}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-gray-700 mt-1">
                      <span className="flex items-center gap-1 font-semibold text-[#16730F]">
                        <FaBuilding className="text-xs opacity-75" />
                        {cert.issuer}
                      </span>
                      {cert.issueDate && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="flex items-center gap-1 text-xs text-gray-500 font-normal">
                            <FaCalendarAlt className="text-xs text-gray-400" />
                            Issued {cert.issueDate}
                          </span>
                        </>
                      )}
                    </div>

                    {cert.fileUrl && (
                      <div className="mt-3">
                        <img
                          src={cert.fileUrl}
                          alt={cert.certName}
                          className="h-16 w-auto max-w-xs object-cover rounded-md border border-gray-200 shadow-xs"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 shrink-0">
                  <button
                    type="button"
                    title="Delete certificate"
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 hover:border-red-200 transition-all cursor-pointer"
                    onClick={() => setCertToDelete({ cert, index })}
                  >
                    <FaTrash className="text-sm" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <NavigationButtons
          isFormComplete={canProceed && !isSaving}
          isLoading={isSaving}
          isEditMode={isEditMode}
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

      <DeleteModal
        isOpen={Boolean(certToDelete)}
        onClose={() => setCertToDelete(null)}
        onConfirm={async () => {
          if (!certToDelete) return;
          const { cert, index } = certToDelete;
          setDeletingCert(true);
          try {
            if (cert.id && userId) {
              await axiosInstance.delete(
                `/api/cv-builder/certificates/${userId}/${cert.id}`,
              );
            }
            setSavedCertificates((prev) => prev.filter((_, idx) => idx !== index));
            toast.success("Certificate removed");
            setCertToDelete(null);
          } catch (error) {
            console.error(error);
            toast.error("Failed to delete certificate");
          } finally {
            setDeletingCert(false);
          }
        }}
        title="Delete Certificate"
        message={
          certToDelete?.cert?.certName
            ? `Are you sure you want to delete "${certToDelete.cert.certName}"? This action cannot be undone.`
            : "Are you sure you want to delete this certificate? This action cannot be undone."
        }
        confirmText="Delete"
        isLoading={deletingCert}
      />
    </OnboardingLayout>
  );
}

export default Certificate;

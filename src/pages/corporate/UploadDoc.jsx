import React, { useRef, useState, useEffect } from "react";
import { Camera, CheckCircle2 } from "lucide-react";
import NavigationButtons from "../../components/NavigationButtons";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../../components/Header";
import useRecruiterProfile from "../../services/recruiterProfile";
import { documentViewUrl, isDocumentImage, isDocumentPdf } from "../../utils/documentViewUrl";
import RecruiterVerificationPayGate from "../../components/recruiter/RecruiterVerificationPayGate";

const isPdfPreview = (url) => url === "pdf-document" || isDocumentPdf(url);

const CoperateUploadDoc = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { currentStep, isEditMode, recruiterData, getPath } =
    useOutletContext();
  const location = useLocation();
  const isIndividual = location.pathname.includes("individual");
  const { uploadIdDocument } = useRecruiterProfile();

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [existingDocUrl, setExistingDocUrl] = useState(null);
  const [justUploaded, setJustUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  useEffect(() => {
    if (!isEditMode || !recruiterData?.id_document || dataLoaded) return;

    const preview = documentViewUrl(recruiterData.id_document);
    setExistingDocUrl(recruiterData.id_document);
    setFileName("Current document");

    if (isPdfPreview(preview)) {
      setPreviewUrl("pdf-document");
    } else if (isDocumentImage(preview) || preview?.startsWith("blob:")) {
      setPreviewUrl(preview);
    } else if (preview) {
      setPreviewUrl(preview);
    }

    setJustUploaded(true);
    setDataLoaded(true);
  }, [isEditMode, recruiterData, dataLoaded]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setFileName(file.name);
    setJustUploaded(false);

    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl("pdf-document");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || uploading) return;

    setUploading(true);
    try {
      const result = await toast.promise(uploadIdDocument(selectedFile), {
        pending: "Uploading document...",
        success: "Document uploaded.",
        error: {
          render({ data }) {
            return `Upload failed: ${data}`;
          },
        },
      });
      setUploadResult(result?.data || result);
      setJustUploaded(true);
      setExistingDocUrl(null);
      setSelectedFile(null);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const hasSavedDocument = Boolean(existingDocUrl) || justUploaded;
  const documentReady = isEditMode ? hasSavedDocument : justUploaded;
  const isFormComplete = documentReady && paymentComplete;
  const showFilePicker = isEditMode || !justUploaded;
  const canUploadNewFile = Boolean(selectedFile) && !uploading;

  return (
    <div className="min-h-screen bg-white px-4 flex flex-col justify-between pb-8">
      <div>
        <Header />

        <div className="max-w-xl mx-auto mt-4 flex flex-col items-center justify-center gap-6 p-4">
          {/* Instructions */}
          <div className="text-xs text-gray-700 max-w-md mx-auto space-y-1">
            <p className="font-bold text-black mb-2 text-center text-sm">Instructions:</p>
            {isIndividual ? (
              <>
                <p className="italic text-center text-gray-600">
                  • Ensure the image is clear and readable
                </p>
                <p className="italic text-center text-gray-600">
                  • All 4 corners of the ID must be visible
                </p>
                <p className="italic text-center text-gray-600">
                  • Make sure the ID is not expired
                </p>
                <p className="italic text-center text-gray-600">
                  • Supported formats: PNG, JPG, PDF (max 2MB)
                </p>
              </>
            ) : (
              <>
                <p className="italic text-center text-gray-600">
                  • Upload CAC documents (PDF/PNG) (e.g., Certificate of Incorporation, CAC status report, or business registration certificate.)
                </p>
                <p className="italic text-center text-gray-600">
                  • Supported formats: PNG, JPG, PDF (max 2MB)
                </p>
              </>
            )}
          </div>

          {/* Upload Section */}
          <div className="w-full flex flex-col items-center mt-4">
            {/* Preview Area */}
            {(isIndividual || (!isIndividual && hasSavedDocument)) && (
              <h2 className="text-[#16730F] font-bold text-lg sm:text-xl mb-4 text-center">
                {isIndividual ? "Front of Government ID" : "Company registration document"}
              </h2>
            )}
            <div className="w-full aspect-square max-w-[340px] bg-gray-200 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center mb-6 overflow-hidden relative shadow-inner transition-all duration-300">
              {previewUrl ? (
                previewUrl === "pdf-document" || previewUrl.endsWith(".pdf") || (!previewUrl.startsWith("data:image/") && !previewUrl.startsWith("blob:") && !previewUrl.match(/\.(jpeg|jpg|gif|png|webp)/i)) ? (
                  <div className="flex flex-col items-center justify-center p-4">
                    <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mb-2 animate-bounce">
                      <span className="text-red-600 font-bold text-lg">PDF</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[250px] truncate text-center">
                      {fileName || "Document.pdf"}
                    </span>
                  </div>
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="object-contain h-full w-full transition-opacity duration-300 ease-in"
                  />
                )
              ) : isIndividual ? (
                <div className="flex flex-col items-center justify-center p-6 w-full h-full">
                  <svg className="w-48 h-32 text-gray-300" viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="200" height="130" rx="10" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2"/>
                    <rect x="15" y="15" width="40" height="50" rx="4" fill="#CBD5E1"/>
                    <circle cx="35" cy="35" r="12" fill="#94A3B8"/>
                    <path d="M21 58C21 50 27 48 35 48C43 48 49 50 49 58H21Z" fill="#94A3B8"/>
                    <rect x="70" y="20" width="110" height="8" rx="2" fill="#CBD5E1"/>
                    <rect x="70" y="34" width="90" height="8" rx="2" fill="#CBD5E1"/>
                    <rect x="70" y="48" width="100" height="8" rx="2" fill="#CBD5E1"/>
                    <rect x="70" y="62" width="60" height="8" rx="2" fill="#CBD5E1"/>
                    <rect x="15" y="85" width="170" height="15" rx="3" fill="#CBD5E1"/>
                    <circle cx="160" cy="92.5" r="4" fill="#94A3B8"/>
                    <line x1="25" y1="110" x2="155" y2="110" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 2"/>
                  </svg>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 p-6">
                  <Camera className="w-12 h-12 text-gray-400" />
                  <p className="text-xs text-gray-500 font-medium">Document Preview</p>
                </div>
              )}
            </div>

            {/* Choose File (hide only after upload) */}
            {showFilePicker && (
              <div className="mb-4 flex flex-col items-center w-full">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer border-2 border-[#16730F] hover:bg-[#16730F]/5 rounded-full px-12 py-3 flex items-center justify-center gap-2 text-[#16730F] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm w-full max-w-[320px]"
                >
                  <Camera className="w-5 h-5 text-[#16730F]" />
                  <span className="text-sm">
                    {isEditMode && hasSavedDocument ? "Choose a new file" : "Choose file"}
                  </span>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/png, image/jpeg, application/pdf"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </div>
            )}

            {selectedFile && !justUploaded && (
              <p className="text-xs text-gray-600 mb-4 font-semibold text-center italic bg-gray-50 py-1.5 px-4 rounded-full max-w-[320px] truncate">
                Selected: <span className="text-black font-normal">{fileName}</span>
              </p>
            )}

            <button
              type="button"
              onClick={handleUpload}
              disabled={!canUploadNewFile}
              className={`w-full max-w-[320px] py-3 rounded-full font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                canUploadNewFile
                  ? "bg-[#16730F] text-white hover:bg-[#125E0E] hover:scale-[1.02] active:scale-[0.98]"
                  : justUploaded
                    ? "bg-[#16730F] text-white cursor-default"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {uploading ? (
                "Uploading..."
              ) : justUploaded ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  Uploaded
                </>
              ) : selectedFile ? (
                isEditMode && existingDocUrl ? "Replace document" : "Upload"
              ) : (
                "Upload"
              )}
            </button>
          </div>

          <RecruiterVerificationPayGate
            uploadResult={uploadResult}
            hasDocument={hasSavedDocument}
            onPaymentComplete={setPaymentComplete}
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <NavigationButtons
        isFormComplete={isFormComplete}
        showSkip={isIndividual}
        onSkip={() => navigate("/news-feed")}
        nextLabel="Submit"
        onBack={() => {
          if (isEditMode) {
            navigate(getPath(currentStep - 1));
          } else {
            navigate(-1);
          }
        }}
        onNext={() => {
          if (!isFormComplete) return;
          if (selectedFile && !justUploaded) {
            toast.error("Upload your document before continuing.");
            return;
          }
          if (isEditMode) {
            if (currentStep === 6) {
              navigate("/news-feed");
              toast.success("Profile updated successfully!");
            } else {
              navigate(getPath(currentStep + 1));
            }
          } else if (isFormComplete) {
            navigate(isIndividual ? "/individual/inreview" : "/corporate/inreview");
          }
        }}
      />
    </div>
  );
};

export default CoperateUploadDoc;

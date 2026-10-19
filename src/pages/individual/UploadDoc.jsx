import React, { useEffect, useRef, useState } from "react";
import { Camera, Upload } from "lucide-react";
import { toast } from "react-toastify";
import NavigationButtons from "../../components/NavigationButtons";
import { useNavigate, useOutletContext } from "react-router-dom";
import Header from "../../components/Header";
import useRecruiterProfile from "../../services/recruiterProfile";
import {
  documentViewUrl,
  isDocumentImage,
  isDocumentPdf,
} from "../../utils/documentViewUrl";
import { CertificateViewLink } from "../../components/CertificateViewerModal";
import RecruiterVerificationPayGate from "../../components/recruiter/RecruiterVerificationPayGate";

const isPdfPreview = (url) =>
  url === "pdf-document" || isDocumentPdf(url);

const UploadDoc = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { isEditMode, recruiterData, getPath } = useOutletContext();
  const { uploadIdDocument } = useRecruiterProfile();

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [existingDocUrl, setExistingDocUrl] = useState(null);
  const [justUploaded, setJustUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [paymentComplete, setPaymentComplete] = useState(false);

  useEffect(() => {
    if (!isEditMode || !recruiterData?.id_document) return;

    const preview = documentViewUrl(recruiterData.id_document);
    setExistingDocUrl(recruiterData.id_document);

    if (!preview) return;

    if (isPdfPreview(preview)) {
      setPreviewUrl("pdf-document");
      setFileName("Current document.pdf");
    } else if (isDocumentImage(preview) || preview.startsWith("blob:")) {
      setPreviewUrl(preview);
    }
  }, [isEditMode, recruiterData]);

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
        pending: "Uploading ID document...",
        success: "ID document uploaded.",
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

  const renderPreview = () => {
    if (!previewUrl) {
      return <Camera className="w-10 h-10 text-gray-500" />;
    }

    if (isPdfPreview(previewUrl)) {
      return (
        <div className="flex flex-col items-center justify-center p-4">
          <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mb-2">
            <span className="text-red-600 font-bold text-lg">PDF</span>
          </div>
          <span className="text-sm font-medium text-gray-700 max-w-[250px] truncate text-center">
            {fileName || "Document.pdf"}
          </span>
        </div>
      );
    }

    return (
      <img
        src={previewUrl}
        alt="Preview"
        className="object-contain h-full w-full"
      />
    );
  };

  return (
    <div className="min-h-screen bg-white px-4 text-center">
      <Header />

      <div className="max-w-4xl mx-auto mt-6 flex flex-col items-center justify-center gap-8 p-4">
        <div className="text-xs text-black mb-6 text-left">
          <p className="font-semibold mb-2">Instructions:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Ensure the image is clear and readable</li>
            <li>All 4 corners of the ID must be visible</li>
            <li>Make sure the ID is not expired</li>
            <li>Supported formats: PNG, JPG, PDF (max 2MB)</li>
          </ul>
        </div>

        <div className="w-full max-w-lg">
          <p className="text-sm font-semibold text-gray-800 mb-3 text-left">
            {hasSavedDocument
              ? "Front of Government ID"
              : "Upload front of your Government ID"}
          </p>

          {isEditMode && existingDocUrl && (
            <div className="mb-3 text-left">
              <CertificateViewLink
                fileUrl={existingDocUrl}
                fetchUrl="/auth/user/profile/id-document/view"
                title="Government ID"
                className="text-sm font-medium text-[#16730F] hover:underline"
              >
                View uploaded ID document
              </CertificateViewLink>
            </div>
          )}

          <div className="w-full h-60 bg-white border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
            {renderPreview()}
          </div>

          {showFilePicker && (
            <div className="mb-3">
              <label
                htmlFor="file-upload"
                className="cursor-pointer border border-[#16730F] rounded-md px-4 py-3 flex items-center justify-center gap-2 text-[#16730F]"
              >
                <Upload className="w-4 h-4" />
                {isEditMode && hasSavedDocument
                  ? "Choose a new file"
                  : fileName || "Choose File"}
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
            <p className="text-xs text-gray-600 mb-3 text-left">
              Selected: <span className="font-medium">{fileName}</span>
            </p>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={!canUploadNewFile}
            className={`w-full py-3 rounded-md font-semibold transition ${
              canUploadNewFile
                ? "bg-[#16730F] text-white hover:bg-[#145a0c]"
                : justUploaded
                  ? "bg-gray-500 text-white cursor-default"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            {uploading
              ? "Uploading..."
              : justUploaded
                ? "Uploaded"
                : selectedFile
                  ? isEditMode && existingDocUrl
                    ? "Replace document"
                    : "Upload"
                  : isEditMode && hasSavedDocument
                    ? "Select a new file to replace"
                    : "Upload"}
          </button>
        </div>

        <RecruiterVerificationPayGate
          uploadResult={uploadResult}
          hasDocument={hasSavedDocument}
          onPaymentComplete={setPaymentComplete}
        />
      </div>

      <NavigationButtons
        isFormComplete={isFormComplete}
        onBack={() => {
          if (isEditMode) {
            navigate(getPath(5));
            return;
          }
          navigate(-1);
        }}
        onNext={() => {
          if (!isFormComplete) return;
          if (selectedFile && !justUploaded) {
            toast.error("Upload your new ID document before continuing.");
            return;
          }
          if (isEditMode) {
            navigate("/news-feed");
            toast.success("Profile updated successfully!");
            return;
          }
          navigate("/individual/inreview");
        }}
      />
    </div>
  );
};

export default UploadDoc;

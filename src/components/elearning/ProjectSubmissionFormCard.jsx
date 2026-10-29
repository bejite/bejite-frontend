import React, { useRef } from "react";
import { Link2, Upload, FileText, CheckCircle2, X } from "lucide-react";
import ELearningButton from "./ELearningButton";

function formatFileSize(bytes) {
  const num = Number(bytes);
  if (!num || num <= 0) return "";
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Reusable Prepare and Submit Deliverables Card for the Project Workspace.
 */
export default function ProjectSubmissionFormCard({
  portfolioUrl = "",
  onPortfolioUrlChange,
  placeholderUrl = "https://docs.google.com/document/d/demo-campaign-brief/edit",
  fileName = "",
  fileSize = null,
  onFileSelect,
  onFileRemove,
  notes = "",
  onNotesChange,
  placeholderNotes = "Attached full audience personas, channel allocation, and 2-week scheduled calendar.",
  isSubmitted = false,
  onSubmit,
  onBackToProgress,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const picked = e.target.files?.[0];
    if (picked && onFileSelect) {
      onFileSelect({
        fileName: picked.name,
        fileSize: picked.size,
      });
    }
    e.target.value = "";
  };

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 space-y-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
    >
      <div>
        <h2 className="text-base sm:text-lg font-extrabold text-[#112A20]">
          Prepare and Submit Deliverables
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Provide your practical evidence using any of the supported formats
          below.
        </p>
      </div>

      {/* Field 1: Project URL */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-bold text-[#1F2937]">
          <Link2 className="w-3.5 h-3.5 text-[#16730F] shrink-0" />
          <span>Project URL / Google Drive / Portfolio Link</span>
        </label>

        <input
          type="url"
          value={portfolioUrl}
          onChange={(e) => onPortfolioUrlChange?.(e.target.value)}
          placeholder={placeholderUrl}
          className="w-full mt-2 px-4 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#16730F] text-gray-800 placeholder:text-gray-400"
        />

        <p className="text-[11px] text-gray-400 mt-1.5">
          Ensure viewing permissions are enabled for partner reviewers.
        </p>
      </div>

      {/* Field 2: Upload Project File */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-bold text-[#1F2937]">
          <Upload className="w-3.5 h-3.5 text-[#16730F] shrink-0" />
          <span>Upload Project File (PDF, DOCX, ZIP)</span>
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.zip,.xlsx,.xls,.csv,.pptx"
          onChange={handleFileChange}
          className="hidden"
        />

        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className="mt-2 border border-dashed border-[#CBD5CE] hover:border-[#16730F] bg-[#F7FAF7] rounded-2xl px-6 py-7 text-center transition-colors cursor-pointer"
        >
          {fileName ? (
            <div className="space-y-1.5">
              <CheckCircle2 className="w-5 h-5 text-[#16730F] mx-auto" />
              <p className="text-xs font-extrabold text-[#112A20]">
                {fileName}
                {fileSize ? (
                  <span className="font-normal text-gray-500">
                    {" "}
                    ({formatFileSize(fileSize)})
                  </span>
                ) : null}
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileRemove?.();
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:underline cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Remove selected file</span>
              </button>
            </div>
          ) : (
            <>
              <FileText className="w-5 h-5 text-[#16730F] mx-auto" />
              <p className="text-xs font-extrabold text-[#112A20] mt-2">
                Click to select a file to upload
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                PDF, DOCX, or Spreadsheet (Simulated upload)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Field 3: Submission Notes & Executive Summary */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-bold text-[#1F2937]">
          <FileText className="w-3.5 h-3.5 text-[#16730F] shrink-0" />
          <span>Submission Notes & Executive Summary</span>
        </label>

        <textarea
          rows={3}
          value={notes}
          onChange={(e) => onNotesChange?.(e.target.value)}
          placeholder={placeholderNotes}
          className="w-full mt-2 px-4 py-3 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#16730F] text-gray-800 placeholder:text-gray-400 resize-y min-h-[96px]"
        />
      </div>

      {/* Submit Action Row */}
      <div className="pt-1 flex flex-wrap items-center justify-end gap-3">
        {isSubmitted && onBackToProgress && (
          <ELearningButton
            variant="outline"
            size="md"
            onClick={onBackToProgress}
          >
            Back to Progress & Criteria
          </ELearningButton>
        )}

        <ELearningButton type="submit" variant="primary" size="md">
          Submit Practical Evidence
        </ELearningButton>
      </div>
    </form>
  );
}


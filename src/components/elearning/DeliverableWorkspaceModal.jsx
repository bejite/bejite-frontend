import React, { useState, useEffect } from "react";
import { X, FileText, CheckCircle2 } from "lucide-react";
import ELearningButton from "./ELearningButton";

/**
 * Reusable Practical Project Deliverable Submission Modal.
 */
export default function DeliverableWorkspaceModal({
  deliverable,
  existingState,
  isOpen,
  onClose,
  onSubmitDeliverable,
}) {
  const [content, setContent] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setContent(existingState?.content || "");
      setPortfolioUrl(existingState?.portfolioUrl || "");
      setError("");
      setSaved(false);
    }
  }, [isOpen, existingState]);

  if (!isOpen || !deliverable) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Please write your project deliverable summary before submitting.");
      return;
    }
    try {
      onSubmitDeliverable?.({ content, portfolioUrl });
      setSaved(true);
    } catch (err) {
      setError(err?.message || "Could not submit deliverable.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden shadow-xl"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3 bg-[#F7FAF7]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#EAF5EA] text-[#16730F] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-gray-900 truncate">
                {deliverable.title}
              </h3>
              <p className="text-[11px] text-gray-500">
                Practical Portfolio Evidence Workspace
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {saved ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EAF5EA] text-[#16730F] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-base font-extrabold text-gray-900">
              Deliverable Submitted!
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Your practical project evidence for{" "}
              <span className="font-semibold text-gray-800">
                {deliverable.title}
              </span>{" "}
              has been saved to your Bejite learning record.
            </p>
            <div className="pt-2">
              <ELearningButton variant="primary" onClick={onClose}>
                Continue
              </ELearningButton>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-6 overflow-y-auto space-y-4 flex-1 min-h-0"
          >
            <div className="rounded-xl bg-[#F6FAF6] border border-[#DCE8DC] p-3.5">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#16730F]">
                INSTRUCTIONS
              </p>
              <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                {deliverable.instructions}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Project Deliverable Response
              </label>
              <textarea
                rows={5}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setError("");
                }}
                placeholder="Outline your target persona, primary campaign goal, key channels, and sample messaging..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#16730F] focus:ring-2 focus:ring-[#16730F]/15 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Supporting Document / Portfolio Link{" "}
                <span className="font-normal text-gray-400">(Optional)</span>
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://docs.google.com/... or portfolio link"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#16730F] focus:ring-2 focus:ring-[#16730F]/15"
              />
            </div>

            {error && <p className="text-xs font-medium text-red-600">{error}</p>}

            <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <ELearningButton variant="outline" onClick={onClose}>
                Cancel
              </ELearningButton>
              <ELearningButton type="submit" variant="primary">
                Submit Deliverable
              </ELearningButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


import React, { useState } from "react";
import {
  FaTimes,
  FaLayerGroup,
  FaComments,
  FaExchangeAlt,
} from "react-icons/fa";
import { RecruiterSelect } from "../recruiter/RecruiterSelect";

export function AddStageModal({ isOpen, onClose, onAdd }) {
  const [stageName, setStageName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!stageName.trim()) return;
    if (onAdd) onAdd(stageName.trim());
    setStageName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden p-5 sm:p-6 shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full z-10 transition-colors"
          aria-label="Close modal"
        >
          <FaTimes className="w-3.5 h-3.5" />
        </button>
        <div className="flex items-center gap-3 mb-4 shrink-0 pr-8">
          <div className="w-10 h-10 rounded-xl bg-[#E6F4EA] text-[#16730F] flex items-center justify-center text-lg shrink-0">
            <FaLayerGroup />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1A3E32]">Add New Stage</h3>
            <p className="text-xs text-gray-500">
              Insert a step into this recruitment pipeline.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto nfl-scroll pr-1 flex-1 min-h-0 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1A3E32] mb-1">
                Stage Name
              </label>
              <input
                type="text"
                required
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                placeholder="e.g. Assessment Test, Final Executive Interview"
                className="w-full bg-white border border-gray-300 text-sm px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-[#16730F]/40"
              />
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-3 border-t border-gray-100 mt-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#E5E7EB] hover:bg-gray-300 text-gray-800 font-bold px-5 py-2 rounded-full text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#16730F] hover:bg-[#125B0C] text-white font-bold px-5 py-2 rounded-full text-xs shadow-xs transition-colors"
            >
              Add Stage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CandidateFeedbackModal({
  isOpen,
  onClose,
  candidate,
  onSubmitFeedback,
}) {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState("Recommended");

  if (!isOpen || !candidate) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmitFeedback) onSubmitFeedback(candidate, { feedback, rating });
    setFeedback("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden p-5 sm:p-6 shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full z-10 transition-colors"
          aria-label="Close modal"
        >
          <FaTimes className="w-3.5 h-3.5" />
        </button>
        <div className="flex items-center gap-3 mb-4 shrink-0 pr-8">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg shrink-0">
            <FaComments />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1A3E32]">
              Record Interview Feedback
            </h3>
            <p className="text-xs text-gray-500">
              Provide evaluation notes for {candidate.name}.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto nfl-scroll pr-1 flex-1 min-h-0 space-y-4">
            <div>
              <RecruiterSelect
                label="Overall Recommendation"
                name="rating"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                options={[
                  { value: "Strong Hire", label: "Strong Hire" },
                  { value: "Recommended", label: "Recommended" },
                  { value: "Neutral", label: "Neutral" },
                  { value: "Do Not Hire", label: "Do Not Hire" },
                ]}
                placeholder="Select recommendation"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1A3E32] mb-1">
                Feedback Notes
              </label>
              <textarea
                rows={4}
                required
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter technical interview performance, key strengths, or concerns..."
                className="w-full bg-white border border-gray-300 text-sm p-3 rounded-xl resize-none"
              />
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-3 border-t border-gray-100 mt-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#E5E7EB] hover:bg-gray-300 text-gray-800 font-bold px-5 py-2 rounded-full text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#B45309] hover:bg-[#92400E] text-white font-bold px-5 py-2 rounded-full text-xs shadow-xs transition-colors"
            >
              Save Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function MoveStageModal({
  isOpen,
  onClose,
  candidate,
  stages = [],
  onMove,
}) {
  const [targetStage, setTargetStage] = useState("");

  if (!isOpen || !candidate) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetStage) return;
    if (onMove) onMove(candidate, targetStage);
    onClose();
  };

  const stageOptions = [
    ...stages.map((stg) => ({
      value: stg.name,
      label: stg.name,
    })),
    { value: "Hired", label: "Hired (Offer Accepted)" },
    { value: "Rejected", label: "Rejected" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden p-5 sm:p-6 shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full z-10 transition-colors"
          aria-label="Close modal"
        >
          <FaTimes className="w-3.5 h-3.5" />
        </button>
        <div className="flex items-center gap-3 mb-4 shrink-0 pr-8">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg shrink-0">
            <FaExchangeAlt />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1A3E32]">
              Move Candidate Stage
            </h3>
            <p className="text-xs text-gray-500">
              Advance or change pipeline stage for {candidate.name}.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto nfl-scroll pr-1 flex-1 min-h-0 space-y-4">
            <div>
              <RecruiterSelect
                label="Select Target Stage"
                name="targetStage"
                value={targetStage || candidate.currentStage}
                onChange={(e) => setTargetStage(e.target.value)}
                options={stageOptions}
                placeholder="Select stage"
              />
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-3 border-t border-gray-100 mt-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#E5E7EB] hover:bg-gray-300 text-gray-800 font-bold px-5 py-2 rounded-full text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#16730F] hover:bg-[#125B0C] text-white font-bold px-5 py-2 rounded-full text-xs shadow-xs transition-colors"
            >
              Move Candidate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


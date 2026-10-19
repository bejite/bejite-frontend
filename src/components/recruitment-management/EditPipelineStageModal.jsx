import React, { useState, useEffect } from "react";
import { FaPencilAlt, FaTimes } from "react-icons/fa";

export default function EditPipelineStageModal({ isOpen, onClose, stage, onUpdateStage }) {
  const [stageName, setStageName] = useState("");
  const [description, setDescription] = useState("");
  const [interviewer, setInterviewer] = useState("Technical Panel");
  const [duration, setDuration] = useState("60");

  useEffect(() => {
    if (stage) {
      setStageName(stage.name || "");
      setDescription(stage.description || "");
      setInterviewer(stage.interviewer || "Technical Panel");
      setDuration(stage.duration ? String(stage.duration).replace(" mins", "") : "60");
    }
  }, [stage]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!stageName.trim()) return;

    if (onUpdateStage) {
      onUpdateStage({
        ...stage,
        name: stageName.trim(),
        description: description.trim(),
        interviewer: interviewer.trim(),
        duration: duration || "60",
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden p-5 sm:p-7 shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors focus:outline-none z-10"
          aria-label="Close modal"
        >
          <FaTimes className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-4 shrink-0 pr-8">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#E6F4EA] text-[#16730F] flex items-center justify-center text-lg sm:text-xl shrink-0">
            <FaPencilAlt />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#1A3E32] tracking-tight">
              Edit Pipeline Stage
            </h3>
            <p className="text-xs text-gray-500 font-normal mt-0.5">
              Update pipeline stage parameters, interviewer, and duration.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto nfl-scroll pr-1 sm:pr-2 flex-1 min-h-0 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1A3E32] mb-1">
                Stage Name
              </label>
              <input
                type="text"
                required
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                placeholder="Final Interview"
                className="w-full bg-white border border-gray-300 text-gray-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16730F]/40 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A3E32] mb-1">
                Stage Description / Objectives
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe interview focus, evaluation rubric, or candidate expectations..."
                className="w-full bg-white border border-gray-300 text-gray-800 text-sm p-3.5 sm:p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#16730F]/40 font-medium resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1A3E32] mb-1">
                  Assigned Interviewer
                </label>
                <input
                  type="text"
                  value={interviewer}
                  onChange={(e) => setInterviewer(e.target.value)}
                  placeholder="Technical Panel"
                  className="w-full bg-white border border-gray-300 text-gray-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16730F]/40 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1A3E32] mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="60"
                  className="w-full bg-white border border-gray-300 text-gray-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16730F]/40 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-center gap-2.5 pt-4 border-t border-gray-100 mt-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-1/2 bg-[#E5E7EB] hover:bg-gray-300 text-gray-800 font-bold px-6 py-2.5 rounded-full text-xs sm:text-sm transition-colors active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-1/2 bg-[#16730F] hover:bg-[#125B0C] text-white font-bold px-6 py-2.5 rounded-full text-xs sm:text-sm transition-colors shadow-md active:scale-95"
            >
              Update Stage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


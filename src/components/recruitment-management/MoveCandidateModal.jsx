import React, { useState, useEffect, useMemo } from "react";
import { FaPencilAlt, FaTimes } from "react-icons/fa";
import Button from "../ui/Button";
import FormField from "../ui/FormField";

function stageIdOf(stage) {
  if (!stage) return "";
  return String(stage.id ?? stage.name ?? "");
}

function findCurrentStage(candidate, stages) {
  if (!stages.length) return null;
  const byId = stages.find(
    (stg) =>
      candidate?.pipelineStageId != null &&
      String(stg.id) === String(candidate.pipelineStageId),
  );
  if (byId) return byId;

  const currentName = String(candidate?.currentStage || "")
    .trim()
    .toLowerCase();
  if (!currentName) return null;
  return (
    stages.find(
      (stg) => String(stg.name || "").trim().toLowerCase() === currentName,
    ) || null
  );
}

function defaultTargetStage(candidate, stages) {
  const current = findCurrentStage(candidate, stages);
  if (!current) return stages[0] ? stageIdOf(stages[0]) : "";
  const index = stages.findIndex((stg) => stageIdOf(stg) === stageIdOf(current));
  const next = index >= 0 ? stages[index + 1] : null;
  if (next) return stageIdOf(next);
  const other = stages.find((stg) => stageIdOf(stg) !== stageIdOf(current));
  return other ? stageIdOf(other) : "";
}

export default function MoveCandidateModal({
  isOpen,
  onClose,
  candidate,
  candidates,
  stages = [],
  onMoveCandidate,
  submitting = false,
}) {
  const [selectedStage, setSelectedStage] = useState("");

  const list = useMemo(() => {
    if (Array.isArray(candidates) && candidates.length) return candidates;
    return candidate ? [candidate] : [];
  }, [candidates, candidate]);

  const isBulk = list.length > 1;
  const primary = list[0];

  const uniqueStageNames = useMemo(() => {
    const names = list
      .map((c) => String(c?.currentStage || "").trim())
      .filter(Boolean);
    return [...new Set(names)];
  }, [list]);

  const currentStageLabel = isBulk
    ? uniqueStageNames.length === 1
      ? uniqueStageNames[0]
      : uniqueStageNames.length
        ? "Mixed stages"
        : "—"
    : primary?.currentStage || "Invited";

  useEffect(() => {
    if (!primary) return;
    setSelectedStage(defaultTargetStage(primary, stages));
  }, [primary, stages, list.length]);

  const stageOptions = useMemo(() => {
    if (stages && stages.length > 0) {
      return stages.map((stg) => ({
        label: stg.name,
        value: stageIdOf(stg),
      }));
    }
    return [
      { label: "Applied", value: "Applied" },
      { label: "Under Review", value: "Under Review" },
      { label: "Interview", value: "Interview" },
      { label: "Hired", value: "Hired" },
      { label: "Rejected", value: "Rejected" },
    ];
  }, [stages]);

  const allAlreadyOnTarget =
    Boolean(selectedStage) &&
    list.length > 0 &&
    list.every((c) => {
      const current = findCurrentStage(c, stages);
      return current && String(stageIdOf(current)) === String(selectedStage);
    });

  const selectedLabel =
    stageOptions.find((opt) => String(opt.value) === String(selectedStage))
      ?.label || "Select a stage";

  if (!isOpen || !list.length) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStage || allAlreadyOnTarget || submitting) return;
    if (onMoveCandidate) {
      await onMoveCandidate(isBulk ? list : primary, selectedStage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden p-4 sm:p-7 shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors focus:outline-none z-10 disabled:opacity-50"
          aria-label="Close modal"
        >
          <FaTimes className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-3 shrink-0 pr-8">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#E6F4EA] text-[#16730F] flex items-center justify-center text-lg sm:text-xl shrink-0">
            <FaPencilAlt />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#1A3E32] tracking-tight">
              {isBulk ? "Move Candidates" : "Move Candidate"}
            </h3>
            <p className="text-xs text-gray-500 font-normal mt-0.5">
              {isBulk
                ? `Advance or change pipeline stage for ${list.length} candidates`
                : "Advance or change pipeline stage"}
            </p>
          </div>
        </div>

        <div className="overflow-y-auto nfl-scroll flex-1 min-h-0 space-y-3.5 pr-1 sm:pr-2">
          <div className="bg-[#16730F] text-white rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 shadow-xs">
            {isBulk ? (
              <>
                <div className="flex -space-x-2 shrink-0">
                  {list.slice(0, 3).map((c) => (
                    <img
                      key={c.id}
                      src={c.avatar || "/assets/images/photo_placeholder.png"}
                      alt={c.name}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-white/40"
                      onError={(e) => {
                        e.currentTarget.src =
                          "/assets/images/photo_placeholder.png";
                      }}
                    />
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold truncate">
                    {list.length} candidates
                  </h4>
                  <div className="text-xs text-emerald-100 mt-0.5 line-clamp-2">
                    {list.map((c) => c.name).join(", ")}
                  </div>
                </div>
              </>
            ) : (
              <>
                <img
                  src={
                    primary.avatar || "/assets/images/photo_placeholder.png"
                  }
                  alt={primary.name}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-white/40 shrink-0"
                  onError={(e) => {
                    e.currentTarget.src =
                      "/assets/images/photo_placeholder.png";
                  }}
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold truncate">{primary.name}</h4>
                  <div className="text-xs text-emerald-100 mt-0.5 truncate">
                    {primary.title || "Candidate"}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div className="bg-[#EFF5F2] border border-[#D5E5DD] rounded-2xl p-3">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                CURRENT STAGE
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#1A3E32] mt-1 truncate">
                {currentStageLabel}
              </div>
            </div>
            <div className="bg-[#EFF5F2] border border-[#D5E5DD] rounded-2xl p-3">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                TARGET STAGE
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#1A3E32] mt-1 truncate">
                {selectedLabel}
              </div>
            </div>
          </div>

          <form id="move-candidate-form" onSubmit={handleSubmit} className="space-y-3">
            <FormField
              label="Select New Stage"
              type="select"
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              options={stageOptions}
              placeholder="Select a stage"
              searchable={false}
            />
            {allAlreadyOnTarget && (
              <p className="text-xs text-amber-700 font-medium">
                {isBulk
                  ? "All selected candidates are already in this stage."
                  : "This candidate is already in the selected stage."}
              </p>
            )}
          </form>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-center sm:justify-end gap-2.5 pt-3 border-t border-gray-100 mt-2 shrink-0">
          <Button
            variant="gray"
            onClick={onClose}
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="move-candidate-form"
            variant="primary"
            disabled={!selectedStage || allAlreadyOnTarget || submitting}
            className="w-full sm:w-auto"
          >
            {submitting
              ? "Moving…"
              : isBulk
                ? `Move ${list.length} Candidates`
                : "Move Candidate"}
          </Button>
        </div>
      </div>
    </div>
  );
}

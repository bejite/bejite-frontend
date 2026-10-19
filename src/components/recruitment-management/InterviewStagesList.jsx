import React, { useRef, useState } from "react";
import { FaPlus, FaArrowUp, FaArrowDown, FaGripVertical } from "react-icons/fa";

export default function InterviewStagesList({
  stages = [],
  onAddStage,
  onEditStage,
  onDeleteStage,
  onReorderStages,
  readOnly = false,
}) {
  const stageItems = stages || [];
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const dragIndexRef = useRef(null);

  const commitReorder = (fromIndex, toIndex) => {
    if (
      fromIndex == null ||
      toIndex == null ||
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= stageItems.length ||
      toIndex >= stageItems.length
    ) {
      return;
    }
    const next = [...stageItems];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    if (onReorderStages) onReorderStages(next);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    commitReorder(index, index - 1);
  };

  const handleMoveDown = (index) => {
    if (index === stageItems.length - 1) return;
    commitReorder(index, index + 1);
  };

  const handleDragStart = (index, event) => {
    if (readOnly) return;
    dragIndexRef.current = index;
    setDragIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
    // Improve drag ghost in some browsers
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.style.opacity = "0.55";
    }
  };

  const handleDragEnd = (event) => {
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.style.opacity = "";
    }
    dragIndexRef.current = null;
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragOver = (index, event) => {
    if (readOnly || dragIndexRef.current == null) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (overIndex !== index) setOverIndex(index);
  };

  const handleDrop = (index, event) => {
    event.preventDefault();
    const from =
      dragIndexRef.current ??
      Number(event.dataTransfer.getData("text/plain"));
    commitReorder(from, index);
    dragIndexRef.current = null;
    setDragIndex(null);
    setOverIndex(null);
  };

  const getStatusBadge = (status) => {
    const formatted = (status || "").toLowerCase();
    if (formatted === "active") {
      return (
        <span className="inline-block bg-[#E6F4EA] text-[#16730F] text-xs font-bold px-3 py-1 rounded-full text-center">
          Active
        </span>
      );
    }
    if (formatted === "complete" || formatted === "completed") {
      return (
        <span className="inline-block bg-[#EAEAEA] text-[#374151] text-xs font-semibold px-3 py-1 rounded-full text-center">
          Complete
        </span>
      );
    }
    return (
      <span className="inline-block bg-[#F3F4F6] text-gray-500 text-xs font-semibold px-3 py-1 rounded-full text-center">
        Not Started
      </span>
    );
  };

  return (
    <div className="bg-[#F7FAF8] border border-[#D5E5DD] rounded-3xl p-4 sm:p-6 space-y-5 shadow-xs min-w-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A3E32] tracking-tight break-words">
            Interview Stages
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 font-normal mt-0.5">
            {readOnly
              ? "Fixed hiring pipeline based on application status."
              : "Drag stages by the grip handle to restructure the pipeline, or use the arrows."}
          </p>
        </div>
        {!readOnly && typeof onAddStage === "function" && (
          <button
            type="button"
            onClick={onAddStage}
            className="inline-flex items-center justify-center gap-2 bg-[#16730F] hover:bg-[#125B0C] active:scale-95 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-md transition-all shrink-0 w-full sm:w-auto"
          >
            <FaPlus className="w-3.5 h-3.5" />
            Add Stage
          </button>
        )}
      </div>

      <div className="space-y-3.5">
        {stageItems.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-sm text-gray-400 font-medium">
            No pipeline stages to display.
          </div>
        ) : (
          stageItems.map((stg, index) => {
            const isDragging = dragIndex === index;
            const isDropTarget = overIndex === index && dragIndex !== index;

            return (
              <div
                key={stg.id || index}
                draggable={!readOnly}
                onDragStart={(e) => handleDragStart(index, e)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(index, e)}
                onDrop={(e) => handleDrop(index, e)}
                className={`bg-white border rounded-2xl p-3.5 sm:p-5 flex flex-col gap-3 shadow-xs transition-all group min-w-0 ${
                  isDragging
                    ? "opacity-55 border-[#16730F] ring-2 ring-[#16730F]/20"
                    : isDropTarget
                      ? "border-[#16730F] bg-[#F0F7F1] shadow-md"
                      : "border-gray-200 hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {!readOnly && (
                    <span
                      className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing text-base shrink-0 touch-none mt-1.5"
                      title="Drag to reorder"
                      aria-label="Drag to reorder"
                    >
                      <FaGripVertical />
                    </span>
                  )}
                  <span className="w-8 h-8 rounded-full bg-[#16730F] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm sm:text-base font-bold text-[#1A3E32] break-words">
                        {stg.name}
                      </p>
                      <div className="shrink-0">{getStatusBadge(stg.status)}</div>
                    </div>
                    {stg.description ? (
                      <p className="text-xs text-gray-500 font-normal mt-0.5 break-words">
                        {stg.description}
                      </p>
                    ) : null}
                    <div className="text-xs text-gray-500 font-medium mt-1.5 flex items-center gap-x-2 gap-y-1 flex-wrap">
                      {stg.interviewer && (
                        <span>
                          Interviewer:{" "}
                          <strong className="text-gray-800 break-words">
                            {stg.interviewer}
                          </strong>
                        </span>
                      )}
                      {stg.duration && (
                        <span>
                          Duration:{" "}
                          <strong className="text-gray-800">{stg.duration}</strong>
                        </span>
                      )}
                      <span>
                        <strong className="text-gray-800">
                          {stg.count ?? 0}
                        </strong>{" "}
                        candidates
                      </span>
                    </div>
                  </div>
                </div>

                {!readOnly && (
                  <div className="flex flex-wrap items-center gap-2 w-full sm:justify-end">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveUp(index)}
                        className="w-8 h-8 sm:w-7 sm:h-7 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 flex items-center justify-center text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Move stage up"
                      >
                        <FaArrowUp className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === stageItems.length - 1}
                        onClick={() => handleMoveDown(index)}
                        className="w-8 h-8 sm:w-7 sm:h-7 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 flex items-center justify-center text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Move stage down"
                      >
                        <FaArrowDown className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onEditStage && onEditStage(stg)}
                      className="flex-1 min-w-[5.5rem] sm:flex-none bg-[#1A3E32] hover:bg-[#132E25] active:scale-95 text-white text-xs px-4 py-2 sm:py-1.5 rounded-full font-bold transition-all shadow-xs"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteStage && onDeleteStage(stg)}
                      className="flex-1 min-w-[5.5rem] sm:flex-none bg-[#FF3B30] hover:bg-[#E03126] active:scale-95 text-white text-xs px-4 py-2 sm:py-1.5 rounded-full font-bold transition-all shadow-xs"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

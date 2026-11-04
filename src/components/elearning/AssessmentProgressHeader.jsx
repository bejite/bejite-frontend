import React from "react";

function formatSeconds(seconds) {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Reusable Assessment Progress Header Bar (Step 2 of the E-Learning Assessment flow).
 * Displays attempt indicator, active question index, live countdown timer pill, answered tally,
 * and interactive segmented step bars.
 */
export default function AssessmentProgressHeader({
  attemptNumber = 1,
  maxAttempts = 2,
  currentIndex = 0,
  totalQuestions = 1,
  answeredCount = 0,
  remainingSeconds = 900,
  questions = [],
  answers = {},
  onJumpToQuestion,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3.5 max-w-[840px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#112A20]">
            ATTEMPT {attemptNumber} OF {maxAttempts}
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500 font-medium">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FFF6E5] border border-[#FDE2BA] text-[#C26A1B] font-extrabold text-[11px] tabular-nums">
            {formatSeconds(remainingSeconds)}
          </span>
        </div>

        <div className="text-xs text-gray-500">
          Answered:{" "}
          <strong className="font-extrabold text-gray-900">
            {answeredCount}
          </strong>{" "}
          of {totalQuestions}
        </div>
      </div>

      {/* Segmented Step Bars */}
      <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar py-0.5">
        {Array.from({ length: totalQuestions }).map((_, idx) => {
          const q = questions[idx];
          const isAnswered = q ? answers[q.id] != null : false;
          const isCurrent = idx === currentIndex;
          const activeBar = isCurrent || isAnswered;

          return (
            <button
              key={q?.id || idx}
              type="button"
              aria-label={`Go to question ${idx + 1}`}
              onClick={() => onJumpToQuestion && onJumpToQuestion(idx)}
              className={`h-1.5 flex-1 min-w-[14px] max-w-[28px] rounded-full transition-colors cursor-pointer shrink-0 ${
                activeBar ? "bg-[#16730F]" : "bg-[#DCE4DF] hover:bg-gray-300"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}


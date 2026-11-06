import React, { useEffect } from "react";
import {
  X,
  HelpCircle,
  Clock,
  Award,
  RotateCcw,
  CheckCircle2,
  Check,
  AlertCircle,
  FileQuestion,
} from "lucide-react";

/**
 * Slide-over drawer to inspect full assessment questions and configuration.
 * Matches Figma Image 4 (media_1793756058192_39fd3832.png).
 */
export default function AssessmentPreviewDrawer({
  isOpen,
  onClose,
  quiz = {},
  courseTitle = "",
}) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const questions = quiz.questions || [];
  const passMark = quiz.passMark || 80;
  const timeLimit = quiz.timeLimitMinutes || quiz.timeLimit || 45;
  const maxAttempts = quiz.maxAttempts || 2;
  const instructions =
    quiz.instructions ||
    "Answer all multiple-choice and single-selection questions to test your understanding of core concepts. You must meet the passing grade to earn completion credit.";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="p-4 sm:p-6 border-b border-[#EDF3EE] bg-[#FAFCFA] flex items-start justify-between gap-3 sm:gap-4 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#EBF4EC] text-[#16730F] text-[10px] font-extrabold uppercase px-2.5 py-0.5 tracking-wider">
                  Assessment Preview
                </span>
                {courseTitle && (
                  <span className="text-xs text-gray-400 font-medium truncate max-w-[220px]">
                    {courseTitle}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#112A20] mt-1.5 leading-snug">
                {quiz.title || "Digital Marketing Basics Quiz"}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* KPI Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="rounded-2xl border border-[#E5EDE7] bg-[#F7FAF8] p-3 text-center">
                <div className="flex items-center justify-center text-[#16730F] mb-1">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                  Pass Mark
                </span>
                <span className="text-base font-extrabold text-[#112A20]">
                  {passMark}%
                </span>
              </div>

              <div className="rounded-2xl border border-[#E5EDE7] bg-[#F7FAF8] p-3 text-center">
                <div className="flex items-center justify-center text-[#16730F] mb-1">
                  <FileQuestion className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                  Questions
                </span>
                <span className="text-base font-extrabold text-[#112A20]">
                  {questions.length}
                </span>
              </div>

              <div className="rounded-2xl border border-[#E5EDE7] bg-[#F7FAF8] p-3 text-center">
                <div className="flex items-center justify-center text-[#16730F] mb-1">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                  Time Limit
                </span>
                <span className="text-base font-extrabold text-[#112A20]">
                  {timeLimit} min
                </span>
              </div>

              <div className="rounded-2xl border border-[#E5EDE7] bg-[#F7FAF8] p-3 text-center">
                <div className="flex items-center justify-center text-[#16730F] mb-1">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                  Attempts
                </span>
                <span className="text-base font-extrabold text-[#112A20]">
                  {maxAttempts} max
                </span>
              </div>
            </div>

            {/* Learner Instructions Card */}
            <div className="rounded-2xl border border-[#E2EBE4] bg-[#F2F7F3] p-4 text-xs space-y-1">
              <span className="font-extrabold text-[#143B2A] block text-[11px] uppercase tracking-wide">
                Instructions for Learners
              </span>
              <p className="text-[#3E5549] leading-relaxed">{instructions}</p>
            </div>

            {/* Questions Header */}
            <div className="flex items-center justify-between pt-1">
              <h3 className="text-sm font-extrabold text-[#112A20] tracking-tight">
                Configured Questions ({questions.length})
              </h3>
              <span className="text-xs text-gray-500 font-medium">
                Answer key visible to partner
              </span>
            </div>

            {/* Questions List */}
            {questions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-xs text-gray-400">
                No questions have been configured for this assessment yet.
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const qType = String(q.type || "single").toLowerCase();
                  const isTrueFalse =
                    qType === "true_false" || qType === "true-false";
                  const isTextBased =
                    qType === "text" || qType === "text_based";
                  const options = q.options || [];
                  const correctIdx = q.correctOptionIndex ?? 0;
                  const correctAnswers = Array.isArray(q.correctAnswers)
                    ? q.correctAnswers
                    : [correctIdx];

                  return (
                    <div
                      key={q.id || idx}
                      className="rounded-2xl border border-[#E5ECE7] bg-white p-5 space-y-3.5 shadow-2xs hover:border-[#C9DDD0] transition-colors"
                    >
                      {/* Question Item Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#16730F] text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-extrabold text-[#112A20]">
                            Question {idx + 1}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="rounded-full bg-[#EBF4EC] text-[#16730F] text-[10px] font-bold px-2.5 py-0.5">
                            {isTrueFalse
                              ? "True or False"
                              : isTextBased
                              ? "Text-Based"
                              : qType === "multiple"
                              ? "Multiple Choice"
                              : "Single Choice"}
                          </span>
                          <span className="rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5">
                            {q.points || 1} {q.points === 1 ? "point" : "points"}
                          </span>
                        </div>
                      </div>

                      {/* Prompt */}
                      <p className="text-xs sm:text-sm font-bold text-[#142C21] leading-snug">
                        {q.prompt || "Question prompt"}
                      </p>

                      {/* Answers Breakdown */}
                      {isTextBased ? (
                        <div className="rounded-xl border border-[#D3E5D7] bg-[#F2F8F4] p-3 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-[#16730F] font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Expected Key Concepts / Answer:</span>
                          </div>
                          <p className="text-[#2B4638] font-medium pl-5">
                            {q.expectedAnswer ||
                              options[0] ||
                              "Evaluated based on completeness and comprehension criteria."}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {options.map((opt, oIdx) => {
                            const isCorrect = correctAnswers.includes(oIdx);
                            const letter = String.fromCharCode(65 + oIdx);

                            return (
                              <div
                                key={oIdx}
                                className={`rounded-xl border px-3.5 py-2.5 text-xs flex items-center justify-between gap-3 transition-colors ${
                                  isCorrect
                                    ? "border-[#16730F] bg-[#EFF8F1] text-[#0F291E]"
                                    : "border-[#E8EFEA] bg-[#FAFCFA] text-gray-700"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                                      isCorrect
                                        ? "bg-[#16730F] text-white"
                                        : "border border-gray-300 text-gray-500 bg-white"
                                    }`}
                                  >
                                    {isCorrect ? (
                                      <Check className="w-3 h-3 stroke-[3]" />
                                    ) : (
                                      letter
                                    )}
                                  </span>
                                  <span
                                    className={`truncate ${
                                      isCorrect ? "font-bold text-[#0F291E]" : "font-medium"
                                    }`}
                                  >
                                    {opt}
                                  </span>
                                </div>

                                {isCorrect && (
                                  <span className="rounded-full bg-[#16730F] text-white text-[9px] font-extrabold px-2 py-0.5 shrink-0 tracking-wider">
                                    CORRECT
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Explanation if configured */}
                      {q.explanation && (
                        <div className="pt-1 text-[11px] text-gray-500 flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                          <p className="leading-relaxed">
                            <strong className="text-gray-700">Explanation:</strong>{" "}
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sticky Drawer Footer */}
          <div className="p-4 sm:p-5 border-t border-[#EDF3EE] bg-white shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full bg-[#16730F] hover:bg-[#125E0C] text-white font-bold text-xs sm:text-sm py-3 transition-colors shadow-xs cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


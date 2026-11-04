import React, { useState, useEffect } from "react";
import {
  Check,
  Clock,
  Lock,
  RotateCcw,
  BookOpen,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

/**
 * Reusable Assessment Completed Screen Component for Jobseekers.
 * Perfectly matches Figma Image 1 (Pass Mark Not Met / Failed) and Image 2 (Congratulations! You Passed).
 *
 * Props:
 * - passed: boolean indicating whether user met or exceeded pass mark
 * - scorePercent: number (e.g. 100 or 33)
 * - correctCount: number (e.g. 3 or 1)
 * - totalCount: number (e.g. 3)
 * - passMark: number (e.g. 80)
 * - attemptNumber: number (e.g. 1)
 * - maxAttempts: number (e.g. 2)
 * - initialCooldownSeconds: number (default: 38s matching Figma mockup "00:38")
 * - onProceedToProject: callback for "Proceed to Practical Project >"
 * - onReturnToCurriculum: callback for "Return to Course Curriculum"
 * - onRetakeAssessment: callback for "Retake Assessment"
 * - questions: optional questions array for question review
 * - answers: optional answers map for question review
 */
export default function AssessmentCompletedCard({
  passed = false,
  scorePercent = 0,
  correctCount = 0,
  totalCount = 3,
  passMark = 80,
  attemptNumber = 1,
  maxAttempts = 2,
  initialCooldownSeconds = 38,
  onProceedToProject,
  onReturnToCurriculum,
  onRetakeAssessment,
  questions = [],
  answers = {},
}) {
  const [cooldown, setCooldown] = useState(passed ? 0 : initialCooldownSeconds);
  const [showReview, setShowReview] = useState(false);

  // Active countdown timer for failed attempt cooldown
  useEffect(() => {
    if (passed || cooldown <= 0) return undefined;

    const timer = window.setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [passed, cooldown]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const nextAttemptNumber = Math.min(attemptNumber + 1, maxAttempts);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Main Completed Screen Card (Image 1 & Image 2) */}
      <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-14 text-center shadow-xs space-y-5 sm:space-y-6">
        {/* Top Icon Circle */}
        {passed ? (
          <div className="w-12 h-12 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto shadow-xs">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#FEE2E2] text-[#EF4444] flex items-center justify-center mx-auto shadow-xs">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
        )}

        {/* Status Badge & Header */}
        <div className="space-y-2">
          {passed ? (
            <span className="bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              ASSESSMENT PASSED
            </span>
          ) : (
            <span className="bg-[#FEE2E2] text-[#EF4444] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              ASSESSMENT NOT PASSED
            </span>
          )}

          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#112A20] tracking-tight">
            {passed ? "Congratulations! You Passed" : "Pass Mark Not Met"}
          </h2>

          <p className="text-xs sm:text-sm text-gray-500">
            You scored{" "}
            <strong className="text-gray-900 font-bold">{scorePercent}%</strong>{" "}
            ({correctCount} of {totalCount} correct). The configured passing
            mark is{" "}
            <strong className="text-gray-900 font-bold">{passMark}%</strong>.
          </p>
        </div>

        {/* Details Box: Passed (Mint Green - Image 2) vs Failed (Amber Cooldown - Image 1) */}
        {passed ? (
          <div className="bg-[#EDF7ED] border border-[#D1E8D1] rounded-2xl p-4 sm:p-5 text-left space-y-2">
            <div className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-[#16730F] shrink-0 mt-0.5" />
              <p className="text-xs text-gray-800 leading-relaxed">
                <strong className="font-bold text-gray-900">
                  Assessment criteria satisfied:
                </strong>{" "}
                You scored {scorePercent}%, meeting the {passMark}% threshold
                on Attempt {attemptNumber} of {maxAttempts}.
              </p>
            </div>
            <p className="text-xs text-gray-600 pl-6.5">
              Next milestone: Submit your practical project deliverable.
            </p>
          </div>
        ) : (
          <div className="bg-[#FDF8EC] border border-[#F6E8C3] rounded-2xl p-4 sm:p-5 text-left space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-xs font-bold text-gray-900">
                  Cooldown Period Active Before Attempt {nextAttemptNumber}
                </span>
              </div>
              <span className="text-amber-800 font-mono font-bold text-xs bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                {formatTimer(cooldown)}
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Attempt {attemptNumber} of {maxAttempts} has been used. Under
              configured course policies, a mandatory revision waiting period
              applies before Attempt {nextAttemptNumber} unlocks to encourage
              thorough lesson review.
            </p>
            {cooldown > 0 && (
              <button
                type="button"
                onClick={() => setCooldown(0)}
                className="text-[10px] text-amber-700 underline font-medium hover:text-amber-900 cursor-pointer pt-0.5"
              >
                Skip cooldown period (testing shortcut)
              </button>
            )}
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2 w-full">
          {passed ? (
            <button
              type="button"
              onClick={onProceedToProject}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#16730F] hover:bg-[#125E0C] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <FileText className="w-4 h-4" />
              <span>Proceed to Practical Project &gt;</span>
            </button>
          ) : cooldown > 0 ? (
            <button
              type="button"
              disabled
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#E5E7EB] text-gray-400 text-xs font-bold rounded-xl cursor-not-allowed select-none"
            >
              <Lock className="w-4 h-4" />
              <span>Retake Locked</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onRetakeAssessment}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#16730F] hover:bg-[#125E0C] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Assessment</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReturnToCurriculum}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <BookOpen className="w-4 h-4 text-gray-500" />
            <span>Return to Course Curriculum</span>
          </button>
        </div>

        {/* Question Review Accordion Toggle */}
        {questions.length > 0 && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowReview((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16730F] hover:underline cursor-pointer"
            >
              <span>{showReview ? "Hide Question Review" : "Review Submitted Answers"}</span>
              {showReview ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Optional Question Review Section */}
      {showReview && questions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
          <h3 className="text-sm font-extrabold text-gray-900">
            Submitted Answers Breakdown
          </h3>
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const selectedIdx = Number(answers?.[q.id]);
              const isCorrect = selectedIdx === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className={`border rounded-2xl p-4 text-left space-y-2.5 ${
                    isCorrect
                      ? "border-green-200 bg-green-50/30"
                      : "border-red-200 bg-red-50/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                      Question {idx + 1}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCorrect
                          ? "bg-[#E8F5E9] text-[#2E7D32]"
                          : "bg-[#FEE2E2] text-[#EF4444]"
                      }`}
                    >
                      {isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-gray-900">{q.prompt}</p>

                  <div className="space-y-1.5 pt-1">
                    {(q.options || []).map((opt, oIdx) => {
                      const isUserChoice = selectedIdx === oIdx;
                      const isActualCorrect = q.correctIndex === oIdx;

                      return (
                        <div
                          key={oIdx}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs ${
                            isActualCorrect
                              ? "bg-green-100 text-green-900 font-bold"
                              : isUserChoice
                              ? "bg-red-100 text-red-900 font-bold"
                              : "bg-gray-50 text-gray-600"
                          }`}
                        >
                          <span>{opt}</span>
                          {isActualCorrect ? (
                            <Check className="w-3.5 h-3.5 text-green-700 shrink-0" />
                          ) : isUserChoice ? (
                            <X className="w-3.5 h-3.5 text-red-700 shrink-0" />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


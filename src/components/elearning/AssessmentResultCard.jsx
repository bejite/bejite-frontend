import React from "react";
import { CheckCircle2, AlertCircle, RotateCcw, ArrowLeft, Check, X } from "lucide-react";
import ELearningBadge from "./ELearningBadge";
import ELearningButton from "./ELearningButton";

/**
 * Reusable Assessment Result & Answer Breakdown Card.
 * Shown immediately after submitting an assessment or when clicking "Review Quiz Answers".
 */
export default function AssessmentResultCard({
  quiz,
  scorePercent = 0,
  passed = false,
  attemptsUsed = 1,
  answers = {},
  onBackToProgress,
  onRetakeAssessment,
}) {
  if (!quiz) return null;

  const questions = quiz.questions || [];
  const correctCount = questions.reduce(
    (sum, q) =>
      Number(answers?.[q.id]) === q.correctIndex ? sum + 1 : sum,
    0
  );

  return (
    <div className="max-w-[840px] space-y-6">
      {/* Top Result Summary Card */}
      <div
        className={`rounded-2xl border p-6 sm:p-8 ${
          passed
            ? "bg-[#EFF5EF] border-[#CFE3CF]"
            : "bg-[#FFF8EE] border-[#FDE2BA]"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <ELearningBadge variant={passed ? "statusSuccess" : "required"}>
              {passed ? "Assessment Passed" : "Below Required Pass Mark"}
            </ELearningBadge>

            <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#112A20] tracking-tight">
              {quiz.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#4A6358] max-w-xl leading-relaxed">
              {passed
                ? "Great work! Your assessment score meets the partner pass threshold and has been recorded toward your course completion criteria."
                : `You scored ${scorePercent}%, which is below the ${quiz.passMark}% pass mark. Review your answers below and retake the assessment when ready.`}
            </p>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl px-6 py-4 text-center shrink-0 min-w-[165px]">
            <div className="flex items-center justify-center gap-1.5">
              {passed ? (
                <CheckCircle2 className="w-5 h-5 text-[#16730F]" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[#C26A1B]" />
              )}
              <span
                className={`text-3xl font-extrabold ${
                  passed ? "text-[#16730F]" : "text-[#C26A1B]"
                }`}
              >
                {scorePercent}%
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              {correctCount} of {questions.length} correct • Attempt{" "}
              {attemptsUsed}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-black/5 flex flex-wrap items-center justify-between gap-3">
          <ELearningButton
            variant="outline"
            size="md"
            leftIcon={ArrowLeft}
            onClick={onBackToProgress}
          >
            Back to Progress & Criteria
          </ELearningButton>

          <ELearningButton
            variant={passed ? "soft" : "primary"}
            size="md"
            leftIcon={RotateCcw}
            onClick={onRetakeAssessment}
          >
            Retake Assessment
          </ELearningButton>
        </div>
      </div>

      {/* Question-by-Question Answer Review */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 space-y-5">
        <div>
          <h2 className="text-base font-extrabold text-gray-900">
            Submitted Answer Review
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Review how each of your selected responses scored.
          </p>
        </div>

        <div className="space-y-4">
          {questions.map((q, qIdx) => {
            const selectedIdx =
              answers?.[q.id] != null ? Number(answers[q.id]) : null;
            const isCorrect = selectedIdx === q.correctIndex;

            return (
              <div
                key={q.id}
                className="border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#16730F]">
                      QUESTION {qIdx + 1}
                    </p>
                    <p className="text-sm font-extrabold text-gray-900 mt-0.5">
                      {q.prompt}
                    </p>
                  </div>

                  <ELearningBadge
                    variant={isCorrect ? "statusSuccess" : "required"}
                  >
                    {isCorrect ? "Correct" : "Incorrect"}
                  </ELearningBadge>
                </div>

                <div className="space-y-2">
                  {(q.options || []).map((opt, optIdx) => {
                    const isUserChoice = selectedIdx === optIdx;
                    const isRightOption = q.correctIndex === optIdx;

                    let styleClass =
                      "bg-white border-gray-100 text-gray-600";
                    if (isRightOption) {
                      styleClass =
                        "bg-[#EFF5EF] border-[#CFE3CF] text-[#112A20] font-semibold";
                    } else if (isUserChoice && !isRightOption) {
                      styleClass =
                        "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B] font-medium";
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`px-3.5 py-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${styleClass}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                              isRightOption
                                ? "bg-[#16730F] text-white"
                                : isUserChoice
                                  ? "bg-[#DC2626] text-white"
                                  : "border border-gray-300 bg-white"
                            }`}
                          >
                            {isRightOption ? (
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            ) : isUserChoice ? (
                              <X className="w-2.5 h-2.5 stroke-[3]" />
                            ) : null}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {isUserChoice && (
                          <span className="text-[10px] font-bold uppercase tracking-wider shrink-0">
                            Your Answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


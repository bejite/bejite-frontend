import React, { useState } from "react";
import { X, HelpCircle, CheckCircle2, AlertCircle } from "lucide-react";
import ELearningButton from "./ELearningButton";

/**
 * Reusable Interactive Knowledge Assessment Quiz Modal.
 */
export default function KnowledgeQuizModal({
  quiz,
  isOpen,
  onClose,
  onSubmitQuiz,
}) {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  if (!isOpen || !quiz) return null;

  const questions = quiz.questions || [];
  const allAnswered =
    questions.length > 0 &&
    questions.every((q) => answers[q.id] !== undefined);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!allAnswered) return;
    const outcome = onSubmitQuiz?.(answers);
    if (outcome) {
      setResult(outcome);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setResult(null);
  };

  const handleClose = () => {
    setResult(null);
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-xl max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden shadow-xl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3 bg-[#F7FAF7]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#EAF5EA] text-[#16730F] flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-gray-900 truncate">
                {quiz.title}
              </h3>
              <p className="text-[11px] text-gray-500">
                Pass mark: {quiz.passMark}% • {questions.length} Questions •{" "}
                {quiz.allowedAttempts || "Unlimited"} Attempts
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {result ? (
          <div className="p-6 text-center space-y-4">
            <div
              className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center ${
                result.passed
                  ? "bg-[#EAF5EA] text-[#16730F]"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {result.passed ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <AlertCircle className="w-7 h-7" />
              )}
            </div>

            <div>
              <p className="text-2xl font-extrabold text-gray-900">
                {result.scorePercent}% Score
              </p>
              <p className="text-xs text-gray-500 mt-1">
                You answered {result.correct} of {result.total} questions
                correctly.
              </p>
            </div>

            <div
              className={`rounded-xl p-3.5 text-xs font-medium ${
                result.passed
                  ? "bg-[#EFF7EF] text-[#16730F]"
                  : "bg-amber-50 text-amber-800"
              }`}
            >
              {result.passed
                ? "Congratulations! You passed the knowledge assessment requirement."
                : `A minimum score of ${quiz.passMark}% is required to satisfy this criterion. You can retry immediately.`}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              {!result.passed && (
                <ELearningButton variant="outline" onClick={handleRetake}>
                  Retry Quiz
                </ELearningButton>
              )}
              <ELearningButton variant="primary" onClick={handleClose}>
                Done
              </ELearningButton>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-6 overflow-y-auto space-y-5 flex-1 min-h-0"
          >
            {questions.map((question, qIdx) => (
              <div key={question.id} className="space-y-2.5">
                <p className="text-xs sm:text-sm font-bold text-gray-900">
                  {qIdx + 1}. {question.prompt}
                </p>
                <div className="space-y-2">
                  {question.options.map((opt, optIdx) => {
                    const selected = answers[question.id] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [question.id]: optIdx,
                          }))
                        }
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                          selected
                            ? "border-[#16730F] bg-[#EFF7EF] font-semibold text-[#112A20]"
                            : "border-gray-200 hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <ELearningButton variant="outline" onClick={handleClose}>
                Cancel
              </ELearningButton>
              <ELearningButton
                type="submit"
                variant="primary"
                disabled={!allAnswered}
              >
                Submit Assessment
              </ELearningButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


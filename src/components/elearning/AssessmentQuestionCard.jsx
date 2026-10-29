import React from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import ELearningButton from "./ELearningButton";

/**
 * Reusable Single-Question Assessment Card (Step 2 of the E-Learning Assessment flow).
 */
export default function AssessmentQuestionCard({
  question,
  questionNumber = 1,
  totalQuestions = 1,
  selectedOptionIndex = null,
  onSelectOption,
  onPrevious,
  onNext,
  canGoPrevious = false,
}) {
  if (!question) return null;

  const isLastQuestion = questionNumber >= totalQuestions;
  const hasSelection = selectedOptionIndex != null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 max-w-[840px] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Question Overline & Title */}
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#16730F]">
        QUESTION {questionNumber}
      </p>

      <h2 className="text-xl sm:text-[22px] font-extrabold text-[#0F172A] mt-1.5 leading-snug">
        {question.prompt}
      </h2>

      {/* Answer Options */}
      <div className="mt-6 space-y-3">
        {(question.options || []).map((optionText, optIdx) => {
          const isSelected = selectedOptionIndex === optIdx;

          return (
            <button
              key={optIdx}
              type="button"
              onClick={() => onSelectOption && onSelectOption(optIdx)}
              className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-150 flex items-center gap-3 cursor-pointer ${
                isSelected
                  ? "bg-[#EFF5EF] border-[#DCE8DC] text-[#112A20]"
                  : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 text-gray-700"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? "border-[1.5px] border-[#16730F] text-[#16730F] bg-white"
                    : "border border-gray-300 bg-white"
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
              </span>

              <span className="text-xs sm:text-sm font-medium leading-relaxed">
                {optionText}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Question Navigation */}
      <div className="mt-8 flex items-center justify-between gap-3">
        <ELearningButton
          variant="outline"
          size="md"
          leftIcon={ChevronLeft}
          disabled={!canGoPrevious}
          onClick={onPrevious}
          className="px-4"
        >
          Previous
        </ELearningButton>

        <ELearningButton
          variant="primary"
          size="md"
          rightIcon={ChevronRight}
          disabled={!hasSelection}
          onClick={onNext}
          className="px-5"
        >
          {isLastQuestion ? "Finish Assessment" : "Next Question"}
        </ELearningButton>
      </div>
    </div>
  );
}


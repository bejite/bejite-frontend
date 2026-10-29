import React from "react";
import { Check } from "lucide-react";
import ELearningButton from "./ELearningButton";

/**
 * Reusable Ready-to-Submit Assessment Confirmation Card (Step 3 of the E-Learning Assessment flow).
 */
export default function AssessmentSubmitConfirmCard({
  assessmentTitle,
  passMark = 80,
  answeredCount = 0,
  totalQuestions = 0,
  attemptNumber = 1,
  maxAttempts = 2,
  onReturnToQuestions,
  onConfirmSubmit,
}) {
  return (
    <div className="min-h-[64vh] flex items-center justify-center py-6">
      <div className="bg-white border border-gray-200/90 rounded-2xl p-7 sm:p-9 w-full max-w-[465px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center">
        {/* Top Green Check Circle */}
        <div className="w-12 h-12 rounded-full border-[1.5px] border-[#16730F] bg-[#F5FAF5] text-[#16730F] flex items-center justify-center mx-auto">
          <Check className="w-6 h-6 stroke-[2.5]" />
        </div>

        {/* Heading & Pass Mark Copy */}
        <h2 className="text-lg sm:text-xl font-extrabold text-[#16730F] mt-4 tracking-tight">
          Ready to submit your assessment?
        </h2>

        <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-[340px] mx-auto">
          You have completed all {totalQuestions} questions. Once submitted,
          your score will be calculated against the {passMark}% pass mark.
        </p>

        {/* Soft Sage Summary Table */}
        <div className="bg-[#EFF5EF] rounded-xl px-4 py-3.5 mt-5 space-y-2 text-xs text-left">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#5A7166]">Assessment:</span>
            <span className="font-extrabold text-[#112A20] text-right">
              {assessmentTitle}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-[#5A7166]">Questions answered:</span>
            <span className="font-extrabold text-[#112A20]">
              {answeredCount} of {totalQuestions}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-[#5A7166]">Attempt count:</span>
            <span className="font-extrabold text-[#112A20]">
              Attempt {attemptNumber} of {maxAttempts}
            </span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ELearningButton
            variant="outline"
            size="md"
            fullWidth
            onClick={onReturnToQuestions}
          >
            Return to Questions
          </ELearningButton>

          <ELearningButton
            variant="primary"
            size="md"
            fullWidth
            onClick={onConfirmSubmit}
          >
            Confirm and Submit Answers
          </ELearningButton>
        </div>
      </div>
    </div>
  );
}


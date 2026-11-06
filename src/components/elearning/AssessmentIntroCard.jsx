import React from "react";
import { HelpCircle, ChevronRight } from "lucide-react";
import ELearningBadge from "./ELearningBadge";
import ELearningButton from "./ELearningButton";

/**
 * Reusable Course Assessment Intro Card (Step 1 of the E-Learning Assessment flow).
 */
export default function AssessmentIntroCard({
  quiz,
  onReviewLessons,
  onStartAssessment,
  startLabel = "Start Assessment",
}) {
  if (!quiz) return null;

  const questionCount = quiz.questions?.length || 0;
  const passMarkLabel = `${quiz.passMark ?? 80}% minimum`;
  const attemptsLabel =
    quiz.allowedAttempts ||
    (quiz.maxAttempts ? `${quiz.maxAttempts} attempts` : "Unlimited");
  const timeLimitLabel = `${quiz.timeLimitMinutes || 15} Minutes`;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-9 max-w-[840px] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Top Badge */}
      <div>
        <ELearningBadge variant="statusSuccess" icon={HelpCircle}>
          Course Assessment
        </ELearningBadge>
      </div>

      {/* Title & Subtitle */}
      <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#112A20] tracking-tight mt-3.5">
        {quiz.title}
      </h1>

      {quiz.description && (
        <p className="text-xs sm:text-sm text-[#4A6358] mt-2 max-w-2xl leading-relaxed">
          {quiz.description}
        </p>
      )}

      {/* Dark Forest Metrics Strip */}
      <div className="bg-[#153B2E] text-white rounded-2xl px-6 py-5 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9BB5AA]">
            QUESTIONS
          </p>
          <p className="text-sm sm:text-base font-extrabold text-white mt-1">
            {questionCount} {questionCount === 1 ? "question" : "questions"}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9BB5AA]">
            PASSING SCORE
          </p>
          <p className="text-sm sm:text-base font-extrabold text-white mt-1">
            {passMarkLabel}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9BB5AA]">
            ALLOWED ATTEMPTS
          </p>
          <p className="text-sm sm:text-base font-extrabold text-white mt-1">
            {attemptsLabel}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9BB5AA]">
            TIME LIMIT
          </p>
          <p className="text-sm sm:text-base font-extrabold text-white mt-1">
            {timeLimitLabel}
          </p>
        </div>
      </div>

      {/* Bottom Action Row */}
      <div className="mt-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={onReviewLessons}
          className="text-xs font-semibold text-[#3B5249] hover:text-[#16730F] hover:underline transition-colors cursor-pointer self-start sm:self-center"
        >
          Review Course Lessons First
        </button>

        <ELearningButton
          variant="primary"
          size="md"
          rightIcon={ChevronRight}
          onClick={onStartAssessment}
          className="px-5 py-2.5 self-end sm:self-center"
        >
          {startLabel}
        </ELearningButton>
      </div>
    </div>
  );
}


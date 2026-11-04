import React from "react";
import { COURSE_BUILDER_STEPS } from "../../services/elearningService";

/**
 * Reusable 8-step horizontal pill + connected track stepper for Create/Edit Course.
 */
export default function CourseBuilderStepper({
  steps = COURSE_BUILDER_STEPS,
  currentStepIndex = 0,
  onStepSelect,
}) {
  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="min-w-[680px]">
        {/* Top Pill Labels */}
        <div className="grid grid-cols-8 gap-2.5 sm:gap-3">
          {steps.map((step, index) => {
            const isReached = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onStepSelect?.(index)}
                aria-current={isCurrent ? "step" : undefined}
                className={`w-full rounded-xl py-2.5 px-2 text-xs font-bold transition-all text-center truncate ${
                  isReached
                    ? "bg-[#1A3B2B] text-white shadow-xs"
                    : "bg-[#9FB29E] hover:bg-[#8FA48E] text-white"
                }`}
              >
                {step.label}
              </button>
            );
          })}
        </div>

        {/* Connected Numbered Track */}
        <div className="mt-3.5 grid grid-cols-8">
          {steps.map((step, index) => {
            const isReached = index <= currentStepIndex;
            const isNextReached = index + 1 <= currentStepIndex;
            return (
              <div key={step.id} className="relative flex items-center justify-center">
                {/* Left Track Segment */}
                <div
                  className={`h-[2.5px] flex-1 transition-colors ${
                    isReached ? "bg-[#16730F]" : "bg-[#D1DBD2]"
                  }`}
                />

                {/* Step Number Circle */}
                <button
                  type="button"
                  onClick={() => onStepSelect?.(index)}
                  className={`relative z-10 w-6 h-6 rounded-full text-[11px] font-extrabold flex items-center justify-center transition-colors shrink-0 ${
                    isReached
                      ? "bg-[#16730F] text-white"
                      : "bg-[#9FB29E] text-white"
                  }`}
                  aria-label={`Go to step ${step.number}: ${step.label}`}
                >
                  {step.number}
                </button>

                {/* Right Track Segment */}
                <div
                  className={`h-[2.5px] flex-1 transition-colors ${
                    index === steps.length - 1
                      ? isReached
                        ? "bg-[#16730F]"
                        : "bg-[#D1DBD2]"
                      : isNextReached
                      ? "bg-[#16730F]"
                      : "bg-[#D1DBD2]"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


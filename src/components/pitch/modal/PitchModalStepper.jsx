import React from "react";
import { STEP_LABELS } from "./pitchModalConstants";

export default function PitchModalStepper({ currentStep, totalSteps = 6 }) {
  return (
    <div className="px-3.5 sm:px-6 pt-2.5 pb-2 bg-white shrink-0">
      <div className="grid grid-cols-6 gap-1.5 mb-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNum) => (
          <div
            key={stepNum}
            className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
              stepNum <= currentStep ? "bg-[#16730F]" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <div className="inline-block px-2.5 sm:px-3 py-0.5 rounded-full bg-[#EAF5E9] text-[#16730F] text-[10px] sm:text-[11px] font-semibold">
        Step {currentStep} of {totalSteps}: {STEP_LABELS[currentStep - 1] || ""}
      </div>
    </div>
  );
}

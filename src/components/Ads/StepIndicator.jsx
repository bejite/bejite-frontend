import React from "react";
import { Check } from "lucide-react";

export default function StepIndicator({ currentStep, steps }) {
  const activeStep = steps.find((step) => step.number === currentStep);

  return (
    <>
      {/* Slim screens: compact progress */}
      <div className="md:hidden mb-6 space-y-3">
        <div className="flex items-start justify-between gap-3 min-w-0">
          <p className="text-sm font-semibold text-gray-900 break-words min-w-0">
            {activeStep?.label}
          </p>
          <p className="text-xs text-gray-500 shrink-0 pt-0.5">
            Step {currentStep} of {steps.length}
          </p>
        </div>
        <div className="flex gap-1.5">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                currentStep >= step.number ? "bg-[#1A3E32]" : "bg-gray-200"
              }`}
              aria-hidden
            />
          ))}
        </div>
        <ol className="flex justify-between gap-1 text-[10px] leading-tight text-gray-400">
          {steps.map((step) => (
            <li
              key={step.number}
              className={`flex-1 text-center break-words min-w-0 ${
                currentStep >= step.number
                  ? "text-[#1A3E32] font-medium"
                  : ""
              }`}
            >
              {step.label}
            </li>
          ))}
        </ol>
      </div>

      {/* Wider screens: full step indicator */}
      <div className="hidden md:flex items-start justify-between mb-8 gap-2 lg:gap-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center min-w-0 flex-shrink-0 w-24 lg:w-32">
              <div
                className={`
                  w-9 h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all shrink-0
                  ${
                    currentStep >= step.number
                      ? "bg-[#1A3E32] text-white shadow-lg"
                      : "bg-gray-200 text-gray-500"
                  }
                `}
              >
                {currentStep > step.number ? (
                  <Check className="w-4 h-4 lg:w-5 lg:h-5" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`text-xs lg:text-sm mt-2 text-center break-words px-1 ${
                  currentStep >= step.number
                    ? "text-[#1A3E32] font-medium"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mt-4 lg:mt-5 mx-1 lg:mx-2 transition-all ${
                  currentStep > step.number ? "bg-[#1A3E32]" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}

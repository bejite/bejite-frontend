import { Fragment } from 'react';
import { Check } from "lucide-react";

export default function StepIndicator({ currentStep, steps }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <Fragment key={step.number}>
          <div className="flex flex-col items-center">
            <div
              className={`
              w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all
              ${
                currentStep >= step.number
                  ? "bg-[#1A3E32] text-white shadow-lg"
                  : "bg-gray-200 text-gray-500"
              }
            `}
            >
              {currentStep > step.number ? (
                <Check className="w-5 h-5" />
              ) : (
                step.number
              )}
            </div>
            <span
              className={`text-xs mt-2 ${currentStep >= step.number ? "text-[#1A3E32] font-medium" : "text-gray-400"}`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-4 transition-all ${currentStep > step.number + 1 ? "bg-[#1A3E32]" : "bg-gray-200"}`}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}

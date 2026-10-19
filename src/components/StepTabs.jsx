import React from "react";
import { toast } from "react-toastify";
import {
  SIGNUP_STEP_ACTIVE,
  SIGNUP_STEP_PENDING,
} from "../constants/signupTheme";

const StepTabs = ({
  steps,
  currentStep,
  onStepClick,
  getPath,
  isEditMode = false,
}) => (
  <div className="max-w-3xl flex flex-wrap justify-center sm:justify-between items-center mx-auto gap-2 p-2">
    {steps.map((step, i) => {
      const stepNumber = i + 1;
      const isCompleted = stepNumber < currentStep;
      const isCurrent = stepNumber === currentStep;
      const isFuture = stepNumber > currentStep;
      const isClickable = onStepClick && isEditMode;

      const handleClick = () => {
        if (isClickable) {
          if (getPath) {
            const path = getPath(stepNumber);
            if (path) {
              onStepClick(path);
            }
          } else {
            onStepClick(stepNumber);
          }
        } else if (isFuture) {
          toast.error("please complete the current step");
        } else if (!isCurrent && isCompleted) {
          toast.info(
            "Please use the Back button to navigate to previous steps.",
          );
        }
      };

      const tabClass =
        isCompleted || isCurrent ? SIGNUP_STEP_ACTIVE : SIGNUP_STEP_PENDING;

      return (
        <button
          key={step}
          onClick={handleClick}
          className={`px-4 py-2 font-semibold rounded-[8px] transition-colors ${tabClass}`}
        >
          {step}
        </button>
      );
    })}
  </div>
);

export default StepTabs;

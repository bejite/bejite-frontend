import { toast } from "react-toastify";

const StepTabs = ({
  steps,
  currentStep,
  onStepClick,
  getPath,
  isEditMode = false,
}) => (
  <div className="max-w-3xl flex flex-wrap justify-center sm:justify-between items-center mx-auto mt-[5%] gap-2 p-2">
    {steps.map((step, i) => {
      const stepNumber = i + 1;
      const isCompleted = stepNumber < currentStep;
      const isCurrent = stepNumber === currentStep;
      const isFuture = stepNumber > currentStep;
      const isClickable = onStepClick && isEditMode; // Only clickable in edit mode

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

      return (
        <button
          key={step}
          onClick={handleClick}
          className={`px-4 py-2 font-semibold rounded-[8px] text-white shadow-md transition-colors ${
            isCompleted
              ? "bg-[#2A4E42] shadow-[#00000040] hover:bg-[#145a0c] cursor-pointer"
              : isCurrent
                ? "bg-[#2A4E42] hover:bg-[#3A5E52] cursor-pointer"
                : isFuture
                  ? "bg-[#1A3E32] opacity-50 cursor-not-allowed" // Disabled look
                  : "bg-[#1A3E3240] cursor-not-allowed"
          }`}
        >
          {step}
        </button>
      );
    })}
  </div>
);

export default StepTabs;

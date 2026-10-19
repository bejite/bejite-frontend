import {
  SIGNUP_PROGRESS_FILL,
  SIGNUP_PROGRESS_STEP_PENDING,
} from "../constants/signupTheme";

const ProgressBar = ({ currentStep, totalSteps }) => {
  const width = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="max-w-3xl mx-auto mt-[2%] pb-6 pt-2 px-1">
      <div className="relative w-full h-1 bg-[#E0E0E0] rounded-full">
        <div
          className={`absolute top-0 left-0 h-1 rounded-full transition-all duration-300 ${SIGNUP_PROGRESS_FILL}`}
          style={{ width: `${width}%` }}
        />
        <div className="absolute -top-4 w-full flex justify-between px-1 pointer-events-none">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full font-semibold flex items-center justify-center ${
                i + 1 <= currentStep
                  ? `${SIGNUP_PROGRESS_FILL} text-white`
                  : `${SIGNUP_PROGRESS_STEP_PENDING} text-white`
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;

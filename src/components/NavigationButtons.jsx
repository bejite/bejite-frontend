import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa";
import {
  SIGNUP_BTN_DISABLED,
  SIGNUP_BTN_ENABLED,
} from "../constants/signupTheme";

const NavigationButtons = ({
  isFormComplete,
  onBack,
  onNext,
  showSkip = false,
  onSkip,
  nextLabel = "Next",
  isLoading = false,
}) => (
  <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center mt-10 px-4 gap-4 mb-12 font-nunito-semi">
    <button
      className="flex items-center justify-center cursor-pointer w-full sm:w-auto px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-xl transition-colors font-semibold"
      onClick={onBack}
    >
      <FaArrowLeft className="mr-2 text-sm" />
      Go back
    </button>

    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
      {showSkip && onSkip && (
        <button
          className="w-full sm:w-auto cursor-pointer px-8 h-11 border-2 border-[#16730F] text-[#16730F] bg-white hover:bg-[#16730F]/5 font-bold rounded-full shadow-sm transition-all"
          onClick={onSkip}
        >
          Skip
        </button>
      )}

      <button
        className={`w-full sm:w-auto px-8 h-11 flex items-center justify-center gap-2 font-bold rounded-full shadow-md transition-all ${
          isFormComplete && !isLoading
            ? `${SIGNUP_BTN_ENABLED} hover:shadow-md cursor-pointer`
            : SIGNUP_BTN_DISABLED
        }`}
        disabled={!isFormComplete || isLoading}
        onClick={onNext}
      >
        {isLoading ? (
          <>
            <FaSpinner className="animate-spin text-lg" />
            Saving...
          </>
        ) : (
          nextLabel
        )}
      </button>
    </div>
  </div>
);

export default NavigationButtons;

import { FaArrowLeft } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa";

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
          className="w-full sm:w-auto cursor-pointer px-8 h-11 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-bold rounded-xl shadow-sm transition-all"
          onClick={onSkip}
        >
          Skip
        </button>
      )}

      <button
        className={`w-full sm:w-auto px-8 h-11 flex items-center justify-center gap-2 font-bold rounded-xl shadow-sm transition-all ${
          isFormComplete && !isLoading
            ? "bg-[#1A3E32] text-white hover:bg-[#143026] hover:shadow-md cursor-pointer"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
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

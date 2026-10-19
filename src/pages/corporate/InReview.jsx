import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import { SIGNUP_BTN_ENABLED } from "../../constants/signupTheme";

const CoperateInReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isIndividual = location.pathname.includes("individual");

  const handleContinue = () => {
    navigate("/");
  };

  return (
    <div className="bg-white min-h-screen relative">
      <Header />

      <div className="w-full max-w-xl mx-auto p-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-full bg-white rounded-2xl p-5 flex flex-col gap-y-6 items-center">
          <img
            src="/assets/images/verified.png"
            alt="Verified"
            className="object-contain w-24 h-24 sm:w-28 sm:h-28 mb-3"
          />

          <div className="text-center">
            {isIndividual ? (
              <>
                <h1 className="text-[#16730F] font-semibold text-xl sm:text-2xl">
                  Thank you!
                </h1>
                <h1 className="text-[#16730F] font-semibold text-xl sm:text-2xl mt-1">
                  Your ID has been submitted for review
                </h1>
              </>
            ) : (
              <>
                <h1 className="text-[#16730F] font-semibold text-xl sm:text-2xl">
                  Thank You for Submitting Documents!
                </h1>
                <h1 className="text-[#16730F] font-semibold text-xl sm:text-2xl mt-1">
                  Your company verification is under review.
                </h1>
              </>
            )}
          </div>

          <button
            className={`w-full sm:w-1/2 text-white text-base sm:text-lg py-3 sm:py-4 rounded-full shadow-md font-semibold ${SIGNUP_BTN_ENABLED}`}
            onClick={handleContinue}
          >
            Proceed to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoperateInReview;

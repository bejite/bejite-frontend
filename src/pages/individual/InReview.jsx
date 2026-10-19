import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";

import { SIGNUP_BTN_ENABLED } from "../../constants/signupTheme";

const btnPrimary =
  `w-full max-w-md min-h-[44px] px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-full shadow-md transition-colors ${SIGNUP_BTN_ENABLED}`;

const InReview = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/");
  };

  return (
    <div className="bg-white min-h-screen min-h-[100dvh] flex flex-col w-full min-w-0 overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full min-w-0 flex items-center justify-center px-3 sm:px-4 md:px-6 py-6 sm:py-10 pb-8">
        <div className="w-full max-w-xl mx-auto flex flex-col gap-5 sm:gap-6 items-center text-center">
          <img
            src="/assets/images/verified.png"
            alt="Verified Icon"
            className="object-contain w-24 h-24 sm:w-28 sm:h-28"
          />

          <div className="px-1">
            <h1 className="text-[#16730F] font-semibold text-xl sm:text-2xl leading-snug">
              Thank you!
            </h1>
            <p className="text-[#16730F] font-semibold text-xl sm:text-2xl leading-snug mt-1">
              Your ID has been submitted for review
            </p>
          </div>

          <button
            type="button"
            className={btnPrimary}
            onClick={handleContinue}
          >
            Proceed to Login
          </button>
        </div>
      </main>
    </div>
  );
};

export default InReview;

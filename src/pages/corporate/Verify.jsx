import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../../components/Header";
import { FaArrowLeft } from "react-icons/fa";
import useRecruiterProfile from "../../services/recruiterProfile";
import { SIGNUP_BTN_ENABLED } from "../../constants/signupTheme";

const btnPrimary =
  `w-full max-w-md min-h-[44px] px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-full shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${SIGNUP_BTN_ENABLED}`;

const btnSecondary =
  "w-full max-w-md min-h-[44px] px-6 py-3 bg-white border-2 border-[#16730F] text-[#16730F] text-sm sm:text-base font-medium rounded-full shadow-sm hover:bg-[#16730F]/5 transition-colors";

const CoperateVerify = () => {
  const navigate = useNavigate();
  const { currentStep, isEditMode, recruiterData, getPath } =
    useOutletContext();
  const location = useLocation();
  const isIndividual = location.pathname.includes("individual");
  const { updateVerificationConsent } = useRecruiterProfile();

  const [showConsent, setShowConsent] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && recruiterData?.verification_consent) {
      setAgreed(true);
      setShowConsent(true);
    }
  }, [isEditMode, recruiterData]);

  const handleStartVerification = () => {
    setShowConsent(true);
  };

  const handleContinue = async () => {
    if (!agreed) {
      toast.error("Please confirm the consent checkbox to continue.");
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    try {
      if (!isEditMode || !recruiterData?.verification_consent) {
        await toast.promise(updateVerificationConsent(true), {
          pending: "Saving consent...",
          success: "Consent recorded",
          error: {
            render({ data }) {
              return `Failed: ${data}`;
            },
          },
        });
      }

      if (isEditMode) {
        if (currentStep >= 6) {
          navigate("/news-feed");
          toast.success("Profile updated successfully!");
        } else {
          navigate(getPath(currentStep + 1));
        }
        return;
      }

      navigate(isIndividual ? "/individual/selectid" : "/corporate/upload");
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate("/news-feed");
  };

  const handleGoBack = () => {
    if (isEditMode) {
      navigate(getPath(currentStep - 1));
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="bg-white min-h-screen min-h-[100dvh] flex flex-col w-full min-w-0 overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full min-w-0 flex items-center justify-center px-3 sm:px-4 md:px-6 py-6 sm:py-10 pb-8">
        {!showConsent ? (
          <div className="w-full max-w-lg mx-auto flex flex-col gap-5 sm:gap-6 items-center text-center">
            <p className="text-base sm:text-xl font-medium text-[#16730F] italic">
              {isIndividual ? "Almost there" : "Almost there!"}
            </p>

            <h1 className={`${isIndividual ? "text-[#16730F]" : "text-[#16730F]"} font-semibold text-xl sm:text-2xl md:text-3xl leading-snug px-1`}>
              {isIndividual ? "Verify Your Identity" : "Build trust"}
            </h1>

            <p className="text-xs sm:text-sm italic text-gray-700 leading-relaxed max-w-prose px-1">
              {isIndividual
                ? "A quick verification helps jobseekers feel safe accepting your offers. Upload or snap a clear image of your valid government-issued ID to get verified on Bejite."
                : "Verify your company so jobseekers can trust you. A verified profile shows you are a real employer hiring on Bejite."}
            </p>

            <div className="w-full max-w-md flex flex-col items-center gap-3 mt-1 sm:mt-2">
              <button
                type="button"
                className={btnPrimary}
                onClick={handleStartVerification}
              >
                Start Verification
              </button>

              {!isIndividual && (
                <button
                  type="button"
                  className={btnSecondary}
                  onClick={handleSkip}
                >
                  Skip
                </button>
              )}
            </div>

            <button
              type="button"
              className="mt-2 flex items-center justify-center gap-2 text-[#16730F] text-sm font-medium underline hover:text-[#145a0c] min-h-[44px] px-2"
              onClick={handleGoBack}
            >
              <FaArrowLeft className="shrink-0" />
              Go back
            </button>
          </div>
        ) : (
          <div className="w-full max-w-2xl mx-auto flex flex-col gap-5 sm:gap-6 items-center">
            <h2 className="text-lg sm:text-xl font-semibold text-[#16730F] text-center px-2">
              Verification consent
            </h2>

            <label
              htmlFor="agree"
              className="flex items-start gap-3 w-full max-w-xl cursor-pointer rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-5"
            >
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={() => setAgreed(!agreed)}
                className="mt-1 h-4 w-4 shrink-0 accent-[#16730F]"
              />
              <span className="text-sm sm:text-base text-[#16730F] leading-relaxed text-left break-words">
                {isIndividual
                  ? "I confirm my consent to ID verification."
                  : "I confirm that I am legally authorized to hire for this company"}
              </span>
            </label>

            <div className="w-full max-w-md flex flex-col items-center gap-3">
              <button
                type="button"
                className={btnPrimary}
                onClick={handleContinue}
                disabled={!agreed || submitting}
              >
                {submitting ? "Saving..." : "Continue"}
              </button>

              {!isIndividual && (
                <button
                  type="button"
                  className={btnSecondary}
                  onClick={handleSkip}
                >
                  Skip
                </button>
              )}
            </div>

            <button
              type="button"
              className="mt-1 flex items-center justify-center gap-2 text-[#16730F] text-sm font-medium underline hover:text-[#16730F] min-h-[44px] px-2"
              onClick={() => setShowConsent(false)}
            >
              <FaArrowLeft className="shrink-0" />
              Go back
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default CoperateVerify;

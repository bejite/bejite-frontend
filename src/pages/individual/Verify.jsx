import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../../components/Header";
import { FaArrowLeft } from "react-icons/fa";
import useRecruiterProfile from "../../services/recruiterProfile";
import {
  SIGNUP_BTN_ENABLED,
} from "../../constants/signupTheme";

const btnPrimary =
  `w-full max-w-md min-h-[44px] px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-full shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${SIGNUP_BTN_ENABLED}`;

const btnSecondary =
  "w-full max-w-md min-h-[44px] px-6 py-3 bg-white border-2 border-[#16730F] text-[#16730F] text-sm sm:text-base font-medium rounded-full shadow-sm hover:bg-[#16730F]/5 transition-colors";

const Verify = () => {
  const navigate = useNavigate();
  const { isEditMode, recruiterData, getPath } = useOutletContext();
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
      await toast.promise(updateVerificationConsent(true), {
        pending: "Saving consent...",
        success: "Consent recorded",
        error: {
          render({ data }) {
            return `Failed: ${data}`;
          },
        },
      });
      navigate(getPath(5));
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate("/news-feed");
  };

  return (
    <div className="bg-white min-h-screen min-h-[100dvh] flex flex-col w-full min-w-0 overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full min-w-0 flex items-center justify-center px-3 sm:px-4 md:px-6 py-6 sm:py-10 pb-8">
        {!showConsent ? (
          <div className="w-full max-w-lg mx-auto flex flex-col gap-5 sm:gap-6 items-center text-center">
            <p className="text-base sm:text-xl font-medium text-[#16730F] italic">
              Almost there
            </p>

            <h1 className="text-[#16730F] font-semibold text-xl sm:text-2xl md:text-3xl leading-snug px-1">
              Verify Your Identity
            </h1>

            <p className="text-xs sm:text-sm italic text-gray-700 leading-relaxed max-w-prose px-1">
              A quick verification helps jobseekers feel safe accepting your
              offers. Upload or snap a clear image of your valid government-issued
              ID to get verified on Bejite.
            </p>

            <div className="w-full max-w-md flex flex-col items-center gap-3 mt-1 sm:mt-2">
              <button
                type="button"
                className={btnPrimary}
                onClick={handleStartVerification}
              >
                Start Verification
              </button>
              <button
                type="button"
                className={btnSecondary}
                onClick={handleSkip}
              >
                Skip
              </button>
            </div>

            <button
              type="button"
              className="mt-2 flex items-center justify-center gap-2 text-[#16730F] text-sm font-medium underline hover:text-[#145a0c] min-h-[44px] px-2"
              onClick={() => navigate(-1)}
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

            <div
              className="flex items-start gap-3 w-full max-w-xl rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-5 cursor-pointer"
              onClick={(event) => {
                if (event.target.closest("[data-privacy-link]")) return;
                setAgreed((prev) => !prev);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setAgreed((prev) => !prev);
                }
              }}
              role="checkbox"
              aria-checked={agreed}
              tabIndex={0}
            >
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                readOnly
                tabIndex={-1}
                aria-hidden="true"
                className="mt-1 h-4 w-4 shrink-0 accent-[#16730F] pointer-events-none"
              />
              <p className="text-sm sm:text-base text-[#16730F] leading-relaxed text-left break-words">
                I agree to Bejite&apos;s{" "}
                <a
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-privacy-link
                  className="relative z-10 text-[#16730F] underline hover:text-[#145a0c]"
                  onClick={(event) => event.stopPropagation()}
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  Privacy Policy
                </a>{" "}
                and consent to ID verification.
              </p>
            </div>

            <div className="w-full max-w-md flex flex-col items-center gap-3">
              <button
                type="button"
                className={btnPrimary}
                onClick={handleContinue}
                disabled={!agreed || submitting}
              >
                {submitting ? "Saving..." : "Continue"}
              </button>
              <button
                type="button"
                className={btnSecondary}
                onClick={handleSkip}
              >
                Skip
              </button>
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

export default Verify;

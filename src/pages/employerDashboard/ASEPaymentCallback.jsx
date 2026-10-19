import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  verifyOneTimePayment,
  verifySubscriptionPayment,
  verifyTopUpPayment,
} from "../../services/paymentApi";
import { refreshVerifiedBadgeInSession } from "../../services/verifiedBadgeSync";

const TOPUP_REDIRECTS = {
  extra_search: "/candidate-search-page",
  extra_job_post: "/employer/create-job",
  standalone_badge: "/subscription-dashboard",
};

const resolvePaymentVerifier = (reference, { isTopUpFlow, isSubscriptionFlow }) => {
  if (isTopUpFlow || reference.startsWith("TOPUP_")) {
    return verifyTopUpPayment;
  }
  if (isSubscriptionFlow || reference.startsWith("SUB_")) {
    return verifySubscriptionPayment;
  }
  if (reference.startsWith("ASE_")) {
    return verifyOneTimePayment;
  }
  return verifySubscriptionPayment;
};

const ASEPaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get("reference");
      const trxref = searchParams.get("trxref");
      const ref = reference || trxref;

      if (!ref) {
        setStatus("error");
        setMessage("Payment reference not found");
        return;
      }

      const topUpType = localStorage.getItem("aseTopUpType");
      const isTopUpFlow =
        location.pathname.includes("topup-callback") || Boolean(topUpType);
      const isSubscriptionFlow = location.pathname.includes("subscription-callback");

      try {
        const verify = resolvePaymentVerifier(ref, {
          isTopUpFlow,
          isSubscriptionFlow,
        });
        const response = await verify(ref);

        if (response?.data?.status === "success") {
          setStatus("success");
          setMessage("Payment verified! Redirecting...");
          await refreshVerifiedBadgeInSession(dispatch);

          const recruitJobId = localStorage.getItem("aseRecruitReturnJobId");
          localStorage.removeItem("aseRecruitReturnJobId");

          let redirectPath = "/candidate-search-page";
          if (isTopUpFlow || ref.startsWith("TOPUP_")) {
            redirectPath = TOPUP_REDIRECTS[topUpType] || "/subscription-pricing";
            localStorage.removeItem("aseTopUpType");
          } else if (isSubscriptionFlow || ref.startsWith("SUB_")) {
            redirectPath = "/subscription-dashboard";
          } else if (recruitJobId) {
            redirectPath = `/employer/job/${recruitJobId}/recruit?paid=1`;
          }

          setTimeout(() => {
            navigate(redirectPath, { replace: true });
          }, 2000);
        } else {
          setStatus("error");
          setMessage("Payment verification failed. Please try again.");
        }
      } catch (error) {
        console.error("Verification error:", error);

        if (!isTopUpFlow && !ref.startsWith("TOPUP_")) {
          try {
            const fallbackVerify =
              ref.startsWith("SUB_") || isSubscriptionFlow
                ? verifyOneTimePayment
                : verifySubscriptionPayment;
            const fallbackResponse = await fallbackVerify(ref);
            if (fallbackResponse?.data?.status === "success") {
              setStatus("success");
              setMessage("Payment verified! Redirecting...");
              await refreshVerifiedBadgeInSession(dispatch);
              setTimeout(() => {
                navigate(
                  ref.startsWith("SUB_") || isSubscriptionFlow
                    ? "/subscription-dashboard"
                    : "/candidate-search-page",
                  { replace: true },
                );
              }, 2000);
              return;
            }
          } catch {
            /* fall through to error UI */
          }
        }

        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "An error occurred during verification.",
        );
      }
    };

    verifyPayment();
  }, [searchParams, navigate, location.pathname, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {status === "processing" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">Processing Payment</h2>
            <p className="text-gray-600 mt-2">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Payment Successful!</h2>
            <p className="text-gray-600 mt-2">{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Payment Failed</h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <button
              onClick={() => navigate("/subscription-pricing")}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Back to Pricing
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ASEPaymentCallback;

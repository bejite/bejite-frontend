import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { verifyJobExtensionPayment } from "../../services/employerApi";

const JobExtendCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get("reference") || searchParams.get("trxref");
      const jobId = searchParams.get("jobId");

      if (!reference || !jobId) {
        setStatus("error");
        setMessage("Payment reference or job ID not found.");
        return;
      }

      try {
        const response = await verifyJobExtensionPayment(jobId, reference);

        if (response?.success && response?.data?.status === "success") {
          setStatus("success");
          setMessage("Job extended successfully! Redirecting to dashboard...");
          toast.success("Job extended by 72 hours.");

          setTimeout(() => {
            navigate("/employer/dashboard", { replace: true });
          }, 2000);
          return;
        }

        setStatus("error");
        setMessage("Payment verification failed. Please try again.");
      } catch (error) {
        console.error("Job extension verification error:", error);
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "An error occurred while verifying your payment.",
        );
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        {status === "processing" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#16730F] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">
              Processing Payment
            </h2>
            <p className="text-gray-600 mt-2">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Extension Successful
            </h2>
            <p className="text-gray-600 mt-2">{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Extension Failed
            </h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <button
              type="button"
              onClick={() => navigate("/employer/dashboard")}
              className="mt-4 px-6 py-2 bg-[#16730F] text-white rounded-lg hover:bg-[#145A0C]"
            >
              Back to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default JobExtendCallback;

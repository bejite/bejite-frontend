import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import NewsFeedLayout from "../../components/layout/NewsFeedLayout";
import {
  FaClock,
  FaDollarSign,
  FaCreditCard,
  FaLock,
  FaChevronLeft,
  FaCheckCircle,
  FaSpinner,
  FaCrown,
} from "react-icons/fa";
import {
  getJobExtendInfo,
  extendJobForSubscriber,
  initJobExtensionPayment,
} from "../../services/employerApi";

const formatPrice = (currency, pricing) => {
  if (currency === "NGN") {
    return `₦${Number(pricing.NGN).toLocaleString()}`;
  }
  return `$${pricing.USD}`;
};

const ExtendJob = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const selectedCurrency = "NGN";
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [extendInfo, setExtendInfo] = useState(null);

  useEffect(() => {
    const loadExtendInfo = async () => {
      if (!jobId) {
        setError("Job ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await getJobExtendInfo(jobId);

        if (!response?.success) {
          throw new Error(response?.message || "Failed to load job details");
        }

        setExtendInfo(response.data);
      } catch (err) {
        console.error("Failed to load extend info:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load job extension details.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadExtendInfo();
  }, [jobId]);

  const handleFreeExtend = async () => {
    if (!jobId || processing) return;

    setProcessing(true);
    try {
      const response = await extendJobForSubscriber(jobId);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to extend job");
      }

      toast.success("Job extended by 72 hours (included in your subscription).");
      navigate("/employer/dashboard");
    } catch (err) {
      console.error("Free extend failed:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to extend job posting.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!jobId || processing || extendInfo?.hasActiveSubscription) return;

    setProcessing(true);
    try {
      const response = await initJobExtensionPayment(jobId, selectedCurrency);
      const authorizationUrl = response?.data?.authorization_url;

      if (!authorizationUrl) {
        throw new Error("Payment URL not returned by Paystack");
      }

      window.location.href = authorizationUrl;
    } catch (err) {
      console.error("Payment init failed:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to start payment. Please try again.",
      );
      setProcessing(false);
    }
  };

  const pricing = extendInfo?.pricing || { USD: 10, NGN: 10000 };
  const job = extendInfo?.job;
  const hasSubscription = extendInfo?.hasActiveSubscription;

  return (
    <NewsFeedLayout showSidebars={false}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          type="button"
          onClick={() => navigate("/employer/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-[#16730F] mb-6 transition-colors"
        >
          <FaChevronLeft />
          Back to Dashboard
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-500 gap-3">
            <FaSpinner className="animate-spin text-[#16730F] text-xl" />
            Loading job details...
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-700 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => navigate("/employer/dashboard")}
              className="px-4 py-2 bg-[#16730F] text-white rounded-xl hover:bg-[#145A0C]"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <FaClock className="text-2xl text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Extend Job Posting
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Add {extendInfo?.extensionHours || 72} hours to your vacancy
                  </p>
                </div>
              </div>

              {job && (
                <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Job</p>
                  <p className="font-semibold text-gray-900">{job.title}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Time left: {job.timeLeft}
                  </p>
                  <p className="text-sm text-gray-600">
                    Extensions used: {job.extensionCount}
                  </p>
                </div>
              )}

              {hasSubscription && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                  <FaCrown className="text-[#16730F] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-[#16730F]">
                      Included in your ASE subscription
                    </p>
                    <p className="text-sm text-green-800">
                      {extendInfo?.subscription?.planType
                        ? `${extendInfo.subscription.planType.charAt(0).toUpperCase()}${extendInfo.subscription.planType.slice(1)} plan`
                        : "Active subscription"}{" "}
                      — extend this job at no extra cost.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-5">
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-600">Extension Duration</span>
                    <span className="font-semibold text-gray-900 flex items-center gap-1">
                      <FaClock className="text-[#16730F]" />
                      {extendInfo?.extensionHours || 72} Hours
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-gray-600">Total Price</span>
                    <span className="font-bold text-[#16730F] text-2xl">
                      {hasSubscription
                        ? "Free"
                        : formatPrice(selectedCurrency, pricing)}
                    </span>
                  </div>
                </div>

                {!hasSubscription && (
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <FaLock className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold">
                          Secure Payment via Paystack
                        </p>
                        <p>Your payment information is encrypted and secure</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    What you get:
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500 text-xs" />
                      {extendInfo?.extensionHours || 72} additional hours of
                      visibility
                    </li>
                    <li className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500 text-xs" />
                      Keep receiving applications
                    </li>
                    <li className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500 text-xs" />
                      Access to ASE after final expiry
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              {hasSubscription ? (
                <>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Extend for Free
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Your active ASE subscription covers job extensions. Click
                    below to add {extendInfo?.extensionHours || 72} more hours to
                    this posting.
                  </p>
                  <button
                    type="button"
                    onClick={handleFreeExtend}
                    disabled={processing}
                    className="w-full bg-[#16730F] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#145A0C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Extending...
                      </>
                    ) : (
                      <>
                        <FaCrown />
                        Extend Job for Free
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Payment Method
                  </h3>

                  {/* USD payments not activated yet — NGN only
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Currency
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedCurrency("USD")}
                        className={`py-3 rounded-xl border-2 font-semibold transition-all ${
                          selectedCurrency === "USD"
                            ? "border-[#16730F] bg-green-50 text-[#16730F]"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        USD ($)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedCurrency("NGN")}
                        className={`py-3 rounded-xl border-2 font-semibold transition-all ${
                          selectedCurrency === "NGN"
                            ? "border-[#16730F] bg-green-50 text-[#16730F]"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        NGN (₦)
                      </button>
                    </div>
                  </div>
                  */}

                  <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <FaCreditCard className="text-gray-500 text-xl" />
                      <span className="font-medium text-gray-700">
                        Supported Card
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-[#16730F] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#145A0C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaDollarSign />
                        Pay {formatPrice(selectedCurrency, pricing)} with
                        Paystack
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-500 mt-4">
                    By extending, you agree to our Terms of Service
                  </p>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-xs text-center text-gray-500">
                      Powered by Paystack • Secure payment processing
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </NewsFeedLayout>
  );
};

export default ExtendJob;

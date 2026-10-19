import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import NewsFeedHeader from "../../components/NewsFeedHeader";
import {
  getSubscriptionPlans,
  checkASEEligibility,
  initializeSubscriptionPayment,
  initializeTopUpPayment,
} from "../../services/paymentApi";
import { getUser, isAuthenticated } from "../../utils/tokenManager";

// Sub-components
import ASEPricingHeader from "../../components/pricing/ASEPricingHeader";
import ASEPricingSidebar from "../../components/pricing/ASEPricingSidebar";
import ASEPricingCard from "../../components/pricing/ASEPricingCard";
import ASEPricingComparisonTable from "../../components/pricing/ASEPricingComparisonTable";
import ASEPricingTopups from "../../components/pricing/ASEPricingTopups";
import ASECheckoutModal from "../../components/pricing/ASECheckoutModal";

const formatPlanPrice = (amount) =>
  `₦${Number(amount).toLocaleString("en-NG")}`;

const ASEPricingPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processingTopUp, setProcessingTopUp] = useState(null);

  // Toggles and Modal State
  const [billingInterval, setBillingInterval] = useState("monthly");
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState(null);

  const defaultPlans = useMemo(
    () => [
      {
        id: "standard",
        name: "Standard Plan",
        subtitle: "For growing recruiters and teams",
        prices: {
          monthly: { usd: 10, ngn: 10000 },
          yearly: { usd: 100, ngn: 100000 },
        },
        savings: { usd: 20, ngn: 20000 },
        limits: {
          searches: "5 searches/mo",
          results: "10 results/search",
          posts: "5 job posts/mo",
          adCredits: "₦10,000 ad credit",
          analytics: "Monthly",
          support: "Email support",
          events: "Access to events",
          badge: "Not included",
          applicantAccess: "Included before/after expiry for included posts",
        },
        features: [
          "5 ASE Searches / Month (10 results/search)",
          "5 Job Posts / Month",
          "Recruitment Management included",
          "Applicant access included before/after expiry",
          "₦10,000 AdPro ad credit",
          "Monthly Job Analytics Dashboard",
          "Access to Networking Events",
          "Standard Email Support",
        ],
      },
      {
        id: "premium",
        name: "Premium Plan",
        subtitle: "For professional agencies & scaling teams",
        prices: {
          monthly: { usd: 19, ngn: 19000 },
          yearly: { usd: 183, ngn: 183000 },
        },
        savings: { usd: 45, ngn: 45000 },
        limits: {
          searches: "20 searches/mo",
          results: "20 results/search",
          posts: "20 job posts/mo",
          adCredits: "₦20,000 ad credit",
          analytics: "Enhanced monthly",
          support: "Priority support",
          events: "Priority access to events",
          badge: "Not included",
          applicantAccess: "Included",
        },
        features: [
          "20 ASE Searches / Month (20 results/search)",
          "20 Job Posts / Month",
          "Recruitment Management included",
          "Full Applicant Access (before/after expiry)",
          "₦20,000 AdPro ad credit",
          "Enhanced Monthly Analytics Dashboard",
          "Priority Networking Event Access",
          "Priority Email & Chat Support",
        ],
      },
      {
        id: "jumbo",
        name: "Jumbo Plan",
        subtitle: "For high-volume recruiters & enterprises",
        prices: {
          monthly: { usd: 59, ngn: 59000 },
          yearly: { usd: 568, ngn: 568000 },
        },
        savings: { usd: 140, ngn: 140000 },
        limits: {
          searches: "60 searches/mo",
          results: "30 results/search",
          posts: "Unlimited Fair Use",
          adCredits: "₦30,000 ad credit",
          analytics: "Advanced monthly + trends",
          support: "Dedicated support manager",
          events: "VIP networking events",
          badge: "Not included",
          applicantAccess: "Included",
        },
        features: [
          "60 ASE Searches / Month (30 results/search)",
          "Unlimited Job Posts (Fair Use)",
          "Recruitment Management included",
          "Full Applicant Access (before/after expiry)",
          "₦30,000 AdPro ad credit",
          "Advanced Analytics & Trend Reports",
          "VIP Networking Event Access",
          "Dedicated Account Support",
        ],
      },
    ],
    [],
  );

  const loadData = useCallback(async () => {
    try {
      const plansRes = await getSubscriptionPlans();
      setPlans(plansRes.plans || defaultPlans);

      try {
        const eligRes = await checkASEEligibility();
        setEligibility(eligRes);
      } catch {
        console.log("Eligibility check failed, using default");
        setEligibility({
          success: true,
          eligible: false,
          accessType: "none",
          message: "Log in to check eligibility",
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setPlans(defaultPlans);
      setEligibility({
        success: true,
        eligible: false,
        accessType: "none",
        message: "Unable to load eligibility",
      });
    } finally {
      setLoading(false);
    }
  }, [defaultPlans]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const plansData = useMemo(() => {
    if (plans.length > 0) return plans;
    return defaultPlans;
  }, [plans, defaultPlans]);

  const isCurrentPlan = useCallback(
    (plan) =>
      eligibility?.accessType === "subscription" &&
      eligibility.planType === plan.id &&
      eligibility.billingInterval === billingInterval,
    [eligibility, billingInterval],
  );

  // Trigger checkout confirmation popup
  const handleSelectPlan = (plan) => {
    if (isCurrentPlan(plan)) return;
    setSelectedCheckoutPlan(plan);
    setIsCheckoutModalOpen(true);
  };

  // Perform backend Paystack subscription initialization
  const triggerPayment = async (plan) => {
    setProcessing(true);
    try {
      const user = getUser();

      if (!isAuthenticated() || !user?.email) {
        toast.error("Please log in to subscribe");
        navigate("/");
        return;
      }

      const paymentAmount = plan.prices?.[billingInterval]?.ngn;
      if (!paymentAmount) {
        toast.error("Unable to determine plan price. Please try again.");
        return;
      }

      const paymentData = {
        email: user.email,
        amount: paymentAmount,
        currency: "NGN",
        employerId: user.id,
        planType: plan.id,
        billingInterval,
        billingPeriod: billingInterval,
      };

      localStorage.setItem("aseSelectedPlan", JSON.stringify(plan));

      const data = await initializeSubscriptionPayment(paymentData);

      if (data.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        toast.error("Failed to initialize subscription checkout. Please try again.");
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Payment initialization failed. Please contact support.";
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handlePurchaseTopUp = async (topUpType) => {
    setProcessingTopUp(topUpType);
    try {
      if (!isAuthenticated()) {
        toast.error("Please log in to purchase top-ups");
        navigate("/");
        return;
      }

      localStorage.setItem("aseTopUpType", topUpType);
      const data = await initializeTopUpPayment({ topUpType });

      if (data.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        toast.error("Failed to initialize top-up checkout. Please try again.");
      }
    } catch (error) {
      console.error("Top-up payment error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to start top-up checkout",
      );
    } finally {
      setProcessingTopUp(null);
    }
  };

  // Price calculations helpers
  const getDisplayPrice = (plan) => {
    const val = plan.prices[billingInterval].ngn;
    return formatPlanPrice(val);
  };

  const getSaveText = (plan) => {
    if (billingInterval === "monthly") return null;
    const val = plan.savings.ngn;
    return `Save ${formatPlanPrice(val)}`;
  };

  const getMonthlyEquivalent = (plan) => {
    if (billingInterval === "monthly") return null;
    const val = plan.prices.yearly.ngn;
    const monthlyEq = Math.round((val / 12) * 100) / 100;
    return `${formatPlanPrice(Math.round(monthlyEq))}/mo`;
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-[#F5F5F5]">
        <NewsFeedHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16730F]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F5] text-[#16730F] font-sans antialiased">
      <NewsFeedHeader />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 sm:gap-6 lg:gap-8 p-3 sm:p-6 max-w-[1500px] mx-auto w-full flex-1 min-w-0">
        {/* Sidebar navigation & Help */}
        <ASEPricingSidebar />

        {/* Main Content */}
        <div className="space-y-6 min-w-0">
          {/* Header Banner */}
          <ASEPricingHeader />

          {/* Current Status Box */}
          {eligibility && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 bg-green-50 rounded-2xl flex items-center justify-center text-[#16730F] shrink-0 border border-[#16730F]/20">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Your Current Status
                  </p>
                  <h4 className="font-extrabold text-gray-900 text-base sm:text-lg leading-snug">
                    {eligibility.accessType === "free_monthly" &&
                      (eligibility.eligible
                        ? `Free Monthly Quota — ${eligibility.remainingSearches ?? 0}/${eligibility.monthlySearchLimit ?? 5} searches left`
                        : "Free Monthly Search Quota Used")}
                    {eligibility.accessType === "one_time" &&
                      `${eligibility.remainingSearches} Search Credits`}
                    {eligibility.accessType === "topup_search" &&
                      `${eligibility.remainingSearches} Top-Up Searches`}
                    {eligibility.accessType === "subscription" &&
                      `Active ${eligibility.planType?.toUpperCase()} — ${eligibility.remainingSearches ?? 0}/${eligibility.monthlySearchLimit ?? "∞"} searches left`}
                    {eligibility.accessType === "none" && "No Active Plan"}
                  </h4>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {eligibility.accessType === "free_monthly" &&
                      (eligibility.eligible
                        ? `Includes ${eligibility.monthlySearchLimit ?? 5} ASE searches, ${eligibility.monthlyJobPostLimit ?? 5} job posts, 2 recruitment exercises, and ₦${Number(eligibility.adCreditNgn ?? 5000).toLocaleString("en-NG")} AdPro credit this month`
                        : eligibility.message ||
                          "You've used your free ASE searches for this month. Wait until next month or subscribe to continue.")}
                    {eligibility.accessType === "one_time" &&
                      "Purchase more searches or upgrade to a monthly plan"}
                    {eligibility.accessType === "topup_search" &&
                      "Top-up search credits available"}
                    {eligibility.accessType === "subscription" &&
                      "Plan limits apply to searches, job posts, AdPro credits, and recruitment management this billing period"}
                    {eligibility.accessType === "none" &&
                      "Choose a plan below to continue"}
                  </p>
                </div>
              </div>

              {eligibility.accessType !== "none" &&
                eligibility.accessType !== "subscription" &&
                eligibility.eligible !== false && (
                <button
                  onClick={() => navigate("/candidate-search-page")}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#16730F] text-white rounded-xl hover:bg-[#2d5a47] transition-all font-bold text-sm shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
                >
                  Go to Search
                </button>
              )}
              {eligibility.accessType === "free_monthly" &&
                eligibility.eligible === false && (
                <button
                  onClick={() => navigate("/subscription-pricing")}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#16730F] text-white rounded-xl hover:bg-[#2d5a47] transition-all font-bold text-sm shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
                >
                  View Plans
                </button>
              )}
            </div>
          )}

          {/* Interactive Controls (Toggles) */}
          <div className="flex flex-col gap-4 sm:gap-6 bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider shrink-0">
                Billing Interval:
              </span>
              <div className="inline-flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setBillingInterval("monthly")}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    billingInterval === "monthly"
                      ? "bg-[#16730F] text-white shadow-sm"
                      : "text-gray-600 hover:text-[#16730F]"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingInterval("yearly")}
                  className={`relative flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                    billingInterval === "yearly"
                      ? "bg-[#16730F] text-white shadow-sm"
                      : "text-gray-600 hover:text-[#16730F]"
                  }`}
                >
                  Yearly
                  <span className="bg-[#16730F] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    Save ~20%
                  </span>
                </button>
              </div>
            </div>

            <p className="text-sm font-semibold text-gray-500 text-center sm:text-left">
              All prices in Nigerian Naira (₦)
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {plansData.map((plan) => (
              <ASEPricingCard
                key={plan.id}
                plan={plan}
                billingInterval={billingInterval}
                onSelectPlan={handleSelectPlan}
                getDisplayPrice={getDisplayPrice}
                getSaveText={getSaveText}
                getMonthlyEquivalent={getMonthlyEquivalent}
                isCurrentPlan={isCurrentPlan(plan)}
              />
            ))}
          </div>

          {/* Comparison Matrix Table */}
          <ASEPricingComparisonTable />

          {/* Top-Ups Information Box */}
          <ASEPricingTopups
            onPurchaseTopUp={handlePurchaseTopUp}
            processingTopUp={processingTopUp}
            topUpBalances={
              eligibility
                ? {
                    topupSearchesRemaining:
                      eligibility.topupSearchesRemaining || 0,
                    topupJobPostsRemaining:
                      eligibility.topupJobPostsRemaining || 0,
                  }
                : null
            }
          />

          {/* Free Monthly Quota Banner */}
          {eligibility && eligibility.accessType === "free_monthly" && (
              <div className="border-2 border-dashed border-[#16730F] bg-green-50/50 rounded-3xl p-6 sm:p-8 text-center space-y-4">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  {eligibility.eligible
                    ? "Your Free Monthly ASE Quota"
                    : "Free Monthly Quota Used"}
                </h3>
                <p className="text-gray-500 text-sm max-w-2xl mx-auto leading-relaxed">
                  {eligibility.eligible
                    ? `Each month you get ${eligibility.monthlySearchLimit ?? 5} ASE searches (20 results each), ${eligibility.monthlyJobPostLimit ?? 5} job posts, 2 recruitment exercises, and ₦${Number(eligibility.adCreditNgn ?? 5000).toLocaleString("en-NG")} AdPro credit — no card required.`
                    : eligibility.message ||
                      "You've used your free ASE quota for this month. Wait until next month or subscribe to continue enjoying Bejite recruiting."}
                </p>
                <button
                  onClick={() =>
                    navigate(
                      eligibility.eligible
                        ? "/candidate-search-page"
                        : "/subscription-pricing",
                    )
                  }
                  className="px-8 py-3 bg-[#16730F] text-white font-bold rounded-xl hover:bg-[#2d5a47] transition-all hover:shadow shadow-sm active:scale-95"
                >
                  {eligibility.eligible ? "Start Searching" : "View Plans"}
                </button>
              </div>
            )}
        </div>
      </div>

      {/* Paystack Checkout Modal */}
      <ASECheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        plan={selectedCheckoutPlan}
        billingInterval={billingInterval}
        processing={processing}
        onPay={triggerPayment}
        getDisplayPrice={getDisplayPrice}
        getSaveText={getSaveText}
      />
    </div>
  );
};

export default ASEPricingPage;

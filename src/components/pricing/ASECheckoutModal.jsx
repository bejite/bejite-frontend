// import React from "react";

const ASECheckoutModal = ({
  isOpen,
  onClose,
  plan,
  billingInterval,
  // currency,
  processing,
  onPay,
  getDisplayPrice,
  getSaveText,
}) => {
  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] animate-scale-up">
        {/* Modal Header */}
        <div className="bg-[#1A3E32] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
          >
            <svg
              className="w-5 h-5"
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
          </button>
          <span className="text-[10px] uppercase tracking-wider bg-[#16730F]  text-[#fff] font-extrabold px-3 py-1 rounded-full border border-[#fff]-500/30">
            Plan Review
          </span>
          <h3 className="text-2xl font-black mt-3">{plan.name}</h3>
          <p className="text-xs text-[#fff]  mt-1 capitalize font-semibold tracking-wider">
            Recruitment Subscription • {billingInterval} Billing
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border border-gray-100">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Total Price Due Now
              </p>
              <p className="text-2xs text-gray-400 font-semibold mt-0.5">
                {billingInterval === "yearly"
                  ? "Billed Annually"
                  : "Billed Monthly"}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-2xl font-black text-[#1A3E32]">
                {getDisplayPrice(plan)}
              </p>
              {billingInterval === "yearly" && (
                <span className="inline-block text-2xs font-extrabold text-[#fff]  bg-[#fff]  border border-[#fff]-100 px-2 py-0.5 rounded mt-1.5">
                  {getSaveText(plan)}
                </span>
              )}
            </div>
          </div>

          {/* Limits breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Recruiter Limits & Allowances
            </h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                <span className="w-5 h-5 rounded-full bg-[#fff] text-[#fff] flex items-center justify-center text-xs font-black">
                  ✓
                </span>
                <span>
                  ASE search credits: <strong>{plan.limits.searches}</strong> (
                  {plan.limits.results})
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                <span className="w-5 h-5 rounded-full bg-[#fff] text-[#1A3E32] flex items-center justify-center text-xs font-black">
                  ✓
                </span>
                <span>
                  Job postings allowance: <strong>{plan.limits.posts}</strong>
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                <span className="w-5 h-5 rounded-full bg-[#fff] text-[#1A3E32] flex items-center justify-center text-xs font-black">
                  ✓
                </span>
                <span>
                  AdPro advertising credit:{" "}
                  <strong>{plan.limits.adCredits}</strong>
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                <span className="w-5 h-5 rounded-full bg-[#fff] text-[#1A3E32] flex items-center justify-center text-xs font-black">
                  ✓
                </span>
                <span>
                  Job analytics dashboard:{" "}
                  <strong>{plan.limits.analytics}</strong>
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                <span className="w-5 h-5 rounded-full bg-[#fff] text-[#1A3E32] flex items-center justify-center text-xs font-black">
                  ✓
                </span>
                <span>
                  Networking events: <strong>{plan.limits.events}</strong>
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                <span className="w-5 h-5 rounded-full bg-[#fff] text-[#1A3E32] flex items-center justify-center text-xs font-black">
                  ✓
                </span>
                <span>
                  Customer support: <strong>{plan.limits.support}</strong>
                </span>
              </li>
            </ul>
          </div>

          {/* Settlement Disclaimer */}
          <div className="bg-[#1A3E32]/5 border border-[#1A3E32]/10 rounded-2xl p-4 text-2xs text-gray-500 space-y-2 leading-relaxed">
            <p className="font-extrabold text-[#1A3E32] uppercase tracking-wider">
              Settlement & Plan Rules
            </p>
            <ul className="list-disc list-outside pl-4 space-y-1">
              <li>
                Payments are processed securely by Paystack in Nigerian Naira
                (₦).
              </li>
              <li>
                Monthly allowances are refilled on the recurring renewal date.
                Unused search/job credits do not roll over.
              </li>
              <li>
                Top-ups: Extra search pack (5 credits, 10 results each) is
                ₦10,000; extra job pack (5 posts) is ₦10,000.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-gray-50 p-6 flex flex-col gap-2 border-t border-gray-100">
          <button
            onClick={() => onPay(plan)}
            disabled={processing}
            className="w-full py-4 px-4 bg-[#1A3E32] text-white rounded-xl hover:bg-[#2d5a47] transition-all font-bold text-base shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Connecting to Paystack...
              </>
            ) : (
              <>
                Pay {getDisplayPrice(plan)} with Paystack
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={processing}
            className="w-full py-2.5 text-center text-gray-400 hover:text-gray-700 transition-all font-bold text-xs tracking-wider uppercase disabled:opacity-50"
          >
            Cancel & Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ASECheckoutModal;

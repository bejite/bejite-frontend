// import React from "react";

const ASEPricingCard = ({
  plan,
  billingInterval,
  // currency,
  onSelectPlan,
  getDisplayPrice,
  getSaveText,
  getMonthlyEquivalent,
  isCurrentPlan = false,
}) => {
  const isPopular = plan.id === "premium";
  const isBestValue = plan.id === "jumbo";

  return (
    <div
      className={`relative border-2 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg min-w-0 overflow-visible bg-white ${
        isPopular
          ? "border-[#1A3E32] shadow-sm bg-gradient-to-b from-white to-green-50/20"
          : isBestValue
            ? "border-[#1A3E32] shadow-sm bg-gradient-to-b from-white to-[#1A3E32]/5"
            : "border-gray-200 hover:border-[#1A3E32]"
      }`}
    >
      {isPopular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap px-4 py-1.5 bg-[#1A3E32] text-white text-2xs font-extrabold uppercase tracking-wider rounded-full shadow text-center border border-white">
          MOST POPULAR
        </span>
      )}

      {isBestValue && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap px-4 py-1.5 bg-[#1A3E32] text-white text-2xs font-extrabold uppercase tracking-wider rounded-full shadow text-center border border-white">
          BEST VALUE
        </span>
      )}

      <div>
        {/* Header Details */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-gray-900 tracking-tight">
            {plan.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 leading-snug font-medium min-h-[2.5rem] px-2">
            {plan.subtitle}
          </p>
        </div>

        {/* Price display container */}
        <div className="mt-6 border-b border-gray-100 pb-6 text-center">
          <div className="flex items-baseline justify-center flex-wrap gap-x-1.5 gap-y-1">
            <span className="text-3xl sm:text-4xl font-black text-[#1A3E32] leading-none tracking-tight">
              {getDisplayPrice(plan)}
            </span>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
              /{billingInterval === "monthly" ? "mo" : "yr"}
            </span>
          </div>

          {billingInterval === "yearly" && (
            <div className="mt-3 space-y-1.5 flex flex-col items-center">
              <p className="text-xs font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md inline-block">
                {getSaveText(plan)}
              </p>
              <p className="text-2xs text-gray-400 font-semibold">
                Equivalent to {getMonthlyEquivalent(plan)}
              </p>
            </div>
          )}
        </div>

        {/* Features list */}
        <ul className="mt-6 space-y-3.5">
          {plan.features.map((feature, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 text-sm text-gray-600 leading-tight"
            >
              <svg
                className="w-4 h-4 text-[#1A3E32] flex-shrink-0 mt-0.5"
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
              <span className="font-medium text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Pricing action button */}
      <div className="mt-8 pt-4">
        <button
          onClick={() => !isCurrentPlan && onSelectPlan(plan)}
          disabled={isCurrentPlan}
          className={`w-full py-3.5 px-4 rounded-xl font-bold transition-all shadow-sm ${
            isCurrentPlan
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : isPopular || isBestValue
                ? "bg-[#1A3E32] text-white hover:bg-[#2d5a47] hover:shadow-md active:scale-98"
                : "bg-gray-100 text-[#1A3E32] hover:bg-gray-200 active:scale-98"
          }`}
        >
          {isCurrentPlan
            ? "Current Plan"
            : billingInterval === "monthly"
              ? "Subscribe Monthly"
              : "Subscribe Annually"}
        </button>
      </div>
    </div>
  );
};

export default ASEPricingCard;

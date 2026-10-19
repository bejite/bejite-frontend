import React from "react";

const formatTopUpPrice = (amount) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const ASEPricingTopups = ({
  onPurchaseTopUp,
  processingTopUp = null,
  topUpBalances = null,
}) => {
  const topUpItems = [
    {
      id: "extra_search",
      title: "Extra ASE searches",
      priceLabel: "/ pack",
      detail: "Get 5 search credits (up to 10 candidates each)",
      balanceKey: "topupSearchesRemaining",
      balanceLabel: "search credits available",
    },
    {
      id: "extra_job_post",
      title: "Extra Job postings",
      priceLabel: "/ pack",
      detail: "Get 5 extra job posting credits",
      balanceKey: "topupJobPostsRemaining",
      balanceLabel: "extra posts available",
    },
  ];

  const prices = {
    extra_search: 10000,
    extra_job_post: 10000,
  };

  return (
    <div className="bg-[#1A3E32] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
      <div className="relative z-10 space-y-5 sm:space-y-6">
        <div className="text-center space-y-3">
          <h4 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white">
            Bejite Pricing Logic & Top-Ups
          </h4>
          <p className="text-white/80 text-sm max-w-3xl mx-auto leading-relaxed px-1">
            Bejite subscription plans are built to scale with recruiters. Every
            subscription tier grants access to all features—higher tiers simply
            increase limits. Standard top-up credits are available anytime if you
            run out of monthly allowances.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {topUpItems.map((item) => {
            const balance =
              item.balanceKey && topUpBalances
                ? Number(topUpBalances[item.balanceKey]) || 0
                : null;

            return (
              <div
                key={item.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col items-center text-center gap-3"
              >
                <p className="text-xs uppercase tracking-wider text-white font-bold leading-snug">
                  {item.title}
                </p>
                <p className="text-xl sm:text-2xl font-black leading-tight">
                  {formatTopUpPrice(prices[item.id])}{" "}
                  <span className="block sm:inline text-xs font-semibold text-white/60 mt-1 sm:mt-0">
                    {item.priceLabel}
                  </span>
                </p>
                <p className="text-xs text-white/60 leading-relaxed max-w-[16rem]">
                  {item.detail}
                </p>
                {balance != null && balance > 0 && (
                  <p className="text-xs text-emerald-200 font-semibold">
                    {balance} {item.balanceLabel}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => onPurchaseTopUp?.(item.id)}
                  disabled={processingTopUp === item.id}
                  className="mt-1 w-full py-2.5 px-3 rounded-xl bg-white text-[#1A3E32] text-sm font-bold hover:bg-white/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {processingTopUp === item.id ? "Redirecting…" : "Buy now"}
                </button>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-white/50 pt-1 text-center italic px-2">
          * Note: Unused search and post credits do not roll over to the next
          billing cycle.
        </p>
      </div>
    </div>
  );
};

export default ASEPricingTopups;

import React from "react";

const ASEPricingHeader = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#16730F] via-[#16730F] to-[#122b23] rounded-3xl p-8 sm:p-12 text-center shadow-md">
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-5 sm:space-y-6 px-2">
        <span className="inline-block px-3.5 py-1.5 bg-[#F5F5F5] text-[#1A3E32] rounded-full text-xs font-bold tracking-wider uppercase border border-emerald-500/30">
          Advanced Recruit Options
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight sm:leading-none max-w-3xl">
          Recruit Talent without Limits
        </h1>
        <p className="text-white/70 text-base sm:text-lg max-w-2xl leading-relaxed">
          Unlock core Bejite recruiter services, advanced search metrics,
          and ad credits to get the best candidates.
        </p>
      </div>
    </div>
  );
};

export default ASEPricingHeader;

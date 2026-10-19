import React, { useState } from "react";
import { FaInfoCircle, FaTimes } from "react-icons/fa";

const NOTICE_STORAGE_KEY = "ase-search-credit-notice-dismissed";

const AseSearchCreditNotice = () => {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(NOTICE_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  if (dismissed) {
    return null;
  }

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(NOTICE_STORAGE_KEY, "true");
    } catch {
      // ignore storage errors
    }
    setDismissed(true);
  };

  return (
    <div
      role="status"
      className="mx-3 sm:mx-4 md:mx-6 mt-3 sm:mt-4 rounded-xl border border-[#6B8E23]/40 bg-[#F0F7E8] px-4 py-3 flex gap-3 items-start"
    >
      <FaInfoCircle className="text-[#16730F] shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0 text-sm text-[#1A3E32] leading-relaxed">
        <p className="font-semibold text-[#16730F]">Search credits apply</p>
        <p className="mt-1">
          Each search and each &ldquo;Load more&rdquo; uses one ASE search credit.
          Narrow your filters (job title, skills, location, and so on) before searching
          so you get the candidates you want and avoid using credits unnecessarily.
        </p>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 p-1 rounded-full text-[#16730F]/70 hover:text-[#16730F] hover:bg-[#16730F]/10 transition-colors"
        aria-label="Dismiss notice"
      >
        <FaTimes className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default AseSearchCreditNotice;

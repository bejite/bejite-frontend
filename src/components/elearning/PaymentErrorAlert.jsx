import React from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Reusable Payment Simulation Error Alert (matching Image 5).
 * Renders the top alert banner when a payment is declined or fails simulation.
 */
export default function PaymentErrorAlert({
  title = "Payment Simulation Unsuccessful",
  message = "The card simulation declined this transaction or network timed out. No funds were deducted and course access has not been enrolled.",
  onTryAgain,
  onReturnToCourse,
}) {
  return (
    <div className="bg-[#FFF5F5] border border-[#FCDADA] rounded-2xl p-5 space-y-3 shadow-xs">
      <div className="flex items-center gap-2.5 text-[#B91C1C]">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <h3 className="text-sm font-extrabold text-[#991B1B]">{title}</h3>
      </div>

      <p className="text-xs text-[#B91C1C] leading-relaxed pl-7">
        {message}
      </p>

      <div className="flex flex-wrap items-center gap-2.5 pl-7 pt-1">
        {onTryAgain && (
          <button
            type="button"
            onClick={onTryAgain}
            className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-xs py-2 px-4 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            Try Again Payment
          </button>
        )}

        {onReturnToCourse && (
          <button
            type="button"
            onClick={onReturnToCourse}
            className="bg-white hover:bg-[#FFF0F0] border border-[#FCDADA] text-[#991B1B] font-bold text-xs py-2 px-4 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            Return to Course Details
          </button>
        )}
      </div>
    </div>
  );
}


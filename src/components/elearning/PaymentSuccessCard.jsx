import React from "react";
import { Check, PlayCircle, GraduationCap } from "lucide-react";

/**
 * Reusable Payment Success View (matching Image 4).
 * Displays centered confirmation with Payment Confirmed badge, message,
 * and dual actions ("Start Learning" & "Go to My Learning").
 */
export default function PaymentSuccessCard({
  amount = "N50,000",
  onStartLearning,
  onGoToMyLearning,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm space-y-6">
      {/* Green Checkmark Circle */}
      <div className="w-12 h-12 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto shadow-xs">
        <Check className="w-6 h-6 stroke-[2.5]" />
      </div>

      <div className="space-y-2">
        <span className="bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
          PAYMENT CONFIRMED
        </span>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#112A20] tracking-tight">
          Payment successful. Your course is ready to access.
        </h2>

        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-md mx-auto pt-1">
          Your payment of {amount} was successfully processed in this prototype demonstration. Full course curriculum, exercises, and project review access have been granted.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onStartLearning}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#16730F] hover:bg-[#125E0C] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Start Learning</span>
        </button>

        <button
          type="button"
          onClick={onGoToMyLearning}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
        >
          <GraduationCap className="w-4 h-4 text-[#16730F]" />
          <span>Go to My Learning</span>
        </button>
      </div>
    </div>
  );
}


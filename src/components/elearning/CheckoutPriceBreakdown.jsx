import React from "react";
import { ShieldCheck, Loader2 } from "lucide-react";

/**
 * Reusable Price Breakdown & Access Guarantee Sidebar (matching Image 3 & Image 5).
 */
export default function CheckoutPriceBreakdown({
  coursePrice = "N50,000",
  onPay,
  onCancel,
  isProcessing = false,
  disabled = false,
}) {
  return (
    <div className="space-y-4">
      {/* Price Breakdown Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <h3 className="text-sm font-extrabold text-gray-900">Price Breakdown</h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-gray-600">
            <span>Course Price</span>
            <span className="font-bold text-gray-900">{coursePrice}</span>
          </div>

          <div className="flex items-center justify-between text-gray-600">
            <span>Additional Charges</span>
            <span className="font-bold text-[#16730F]">N0</span>
          </div>

          <div className="flex items-center justify-between text-gray-600">
            <span>Taxes & Processing charges</span>
            <span className="font-bold text-[#16730F]">N0</span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 space-y-1">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs font-bold text-gray-900">Total Payable Amount</p>
              <p className="text-[10px] text-gray-400">VAT & all taxes inc.</p>
            </div>
            <p className="text-2xl font-extrabold text-[#16730F] tracking-tight">
              {coursePrice}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-2 space-y-2.5">
          <button
            type="button"
            disabled={disabled || isProcessing}
            onClick={onPay}
            className="w-full bg-[#16730F] hover:bg-[#125E0C] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm py-3 px-4 rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Processing Order...</span>
              </>
            ) : (
              <span>Pay {coursePrice} now</span>
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full text-center text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer py-1"
          >
            Cancel and return
          </button>
        </div>
      </div>

      {/* Access Guarantee Card (matching Image 3 & 5) */}
      <div className="bg-[#EEF4EE] border border-[#D7E3D7] rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-[#16730F]">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <p className="text-[10px] font-extrabold uppercase tracking-wider">
            ENROLMENT & ACCESS GUARANTEE
          </p>
        </div>
        <p className="text-[11px] text-[#355246] leading-relaxed">
          Upon successful payment confirmation, full course access is granted instantly.
          You will receive an immediate confirmation receipt and direct access to curriculum lessons.
        </p>
      </div>
    </div>
  );
}


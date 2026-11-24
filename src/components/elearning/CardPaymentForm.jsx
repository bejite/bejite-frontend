import React from "react";
import { CreditCard, Lock } from "lucide-react";

/**
 * Reusable Card Payment Form (matching Image 3 & Image 5).
 * Renders Cardholder Name, Card Number, Expiry, CVV, and disclaimer checkbox.
 */
export default function CardPaymentForm({
  cardholderName,
  setCardholderName,
  cardNumber,
  setCardNumber,
  expiryDate,
  setExpiryDate,
  cvv,
  setCvv,
  agreed,
  setAgreed,
  courseTitle = "Intermediate Digital Marketing",
  priceBadge = "N50,000",
  shouldFail,
  setShouldFail,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-gray-900">Card Payment</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Visa, Mastercard, Verve</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-100 rounded-md px-2 py-1">
          <Lock className="w-3 h-3 text-[#16730F]" />
          <span>Simulated 256-Bit SSL</span>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        {/* Cardholder Name */}
        <div>
          <label className="block text-[11px] font-bold text-gray-600 mb-1">
            Cardholder Name
          </label>
          <input
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="Name on card"
            className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-[#16730F] transition-all"
          />
        </div>

        {/* Card Number */}
        <div>
          <label className="block text-[11px] font-bold text-gray-600 mb-1">
            Card Number
          </label>
          <div className="relative">
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="4242 •••• •••• 4242"
              className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3.5 pr-10 py-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-[#16730F] transition-all font-mono"
            />
            <CreditCard className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Expiry Date & CVV */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">
              Expiry Date
            </label>
            <input
              type="text"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              placeholder="MM/YY"
              className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-[#16730F] transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">
              CVV / CVC
            </label>
            <input
              type="password"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              placeholder="•••"
              maxLength={4}
              className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-[#16730F] transition-all font-mono"
            />
          </div>
        </div>

        {/* Agreement Checkbox (matching Image 3 & 5) */}
        <label className="flex items-start gap-2.5 pt-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 rounded border-gray-300 text-[#16730F] focus:ring-[#16730F] cursor-pointer"
          />
          <span className="text-[11px] text-gray-600 leading-relaxed">
            I understand this is a mock up demonstration to enroll for{" "}
            <strong className="text-gray-900">{courseTitle}</strong> at{" "}
            <strong className="text-gray-900">{priceBadge}</strong>. Course access will unlock upon simulated payment success.
          </span>
        </label>

        {/* Simulation Mode Toggle (for testing Image 4 Success vs Image 5 Error) */}
        {setShouldFail && (
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Simulation Outcome:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShouldFail(false)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                  !shouldFail
                    ? "bg-[#16730F] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Simulate Success
              </button>
              <button
                type="button"
                onClick={() => setShouldFail(true)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                  shouldFail
                    ? "bg-[#D32F2F] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Simulate Decline (Image 5)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


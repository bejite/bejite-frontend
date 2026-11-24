import React from "react";
import { Check } from "lucide-react";

const SUGGESTED_AMOUNTS = [
  { label: "₦15,000", value: "15000" },
  { label: "₦30,000", value: "30000" },
  { label: "₦50,000", value: "50000" },
  { label: "₦75,000", value: "75000" },
  { label: "₦100,000", value: "100000" },
];

/**
 * Step 6: Access & Pricing Component.
 * Matches Figma Image 1 (media_1793753142169_faf06a6d.png).
 */
export default function CoursePricingStep({
  pricing = {},
  onChangePricing,
}) {
  const isPaid = Boolean(pricing.isPaid);
  const amount = pricing.amount ?? "";

  const update = (updates) => {
    onChangePricing?.({
      ...pricing,
      ...updates,
    });
  };

  const handleAmountChange = (rawVal) => {
    // Keep only numbers or clean string
    const cleaned = rawVal.replace(/[^\d]/g, "");
    update({ amount: cleaned });
  };

  const formatDisplayAmount = (val) => {
    if (!val) return "";
    const num = Number(val);
    if (isNaN(num)) return val;
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Sage Top Banner */}
      <div className="rounded-3xl bg-[#EFF5EF] border border-[#DCE8DC] p-6 sm:p-7">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#122B20]">
          Access and Pricing
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#5A6D62]">
          Add instructional text, upload video and audio files, and manage lesson resources.
        </p>
      </div>

      {/* Main Pricing Card */}
      <div className="rounded-3xl bg-white border border-[#E6ECE8] p-5 sm:p-7 space-y-6 shadow-2xs">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-[#122B20]">
            Select Enrollment Access Model
          </h2>
          <p className="mt-0.5 text-xs text-[#6B7B73]">
            Choose how learners enroll and access the course material.
          </p>
        </div>

        {/* Dual Access Model Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Free Access Card */}
          <div
            onClick={() => update({ isPaid: false })}
            className={`p-4 sm:p-5 rounded-2xl cursor-pointer transition-all border flex flex-col justify-between gap-3 ${
              !isPaid
                ? "border-[#16730F] bg-white ring-1 ring-[#16730F] shadow-xs"
                : "border-[#E2EAE4] bg-[#FAFCFA] hover:border-[#A2C2A6]"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    !isPaid
                      ? "bg-[#16730F] text-white"
                      : "border border-gray-300 bg-white"
                  }`}
                >
                  {!isPaid && <Check className="w-3 h-3 stroke-[3]" />}
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#122B20]">
                  Free Access
                </span>
              </div>
              <span className="rounded-full bg-[#EAF5EC] text-[#16730F] text-[10px] font-extrabold px-2.5 py-0.5">
                OPEN
              </span>
            </div>

            <p className="text-xs text-[#6B7B73] leading-relaxed pl-7">
              Learners can enroll instantly without payment. Ideal for foundational training, community courses, or lead generation.
            </p>
          </div>

          {/* Paid Course Card */}
          <div
            onClick={() => update({ isPaid: true })}
            className={`p-4 sm:p-5 rounded-2xl cursor-pointer transition-all border flex flex-col justify-between gap-3 ${
              isPaid
                ? "border-[#16730F] bg-white ring-1 ring-[#16730F] shadow-xs"
                : "border-[#E2EAE4] bg-[#FAFCFA] hover:border-[#A2C2A6]"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    isPaid
                      ? "bg-[#16730F] text-white"
                      : "border border-gray-300 bg-white"
                  }`}
                >
                  {isPaid && <Check className="w-3 h-3 stroke-[3]" />}
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#122B20]">
                  Paid Course
                </span>
              </div>
              <span className="rounded-full bg-[#F1F4F2] text-[#4A5D52] text-[10px] font-extrabold px-2.5 py-0.5">
                TUITION
              </span>
            </div>

            <p className="text-xs text-[#6B7B73] leading-relaxed pl-7">
              Learners must pay tuition to access course materials, quizzes, and project review.
            </p>
          </div>
        </div>

        {/* Tuition Amount Section (Rendered when Paid Course is selected) */}
        {isPaid && (
          <div className="pt-2 space-y-4 border-t border-[#F0F4F1]">
            <div>
              <label
                htmlFor="course-tuition-amount-input"
                className="block text-xs font-bold text-[#122B20] mb-1.5"
              >
                Course Tuition Amount (NGN / ₦) <span className="text-red-500">*</span>
              </label>

              <div className="relative max-w-md">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#122B20] select-none">
                  ₦
                </span>
                <input
                  id="course-tuition-amount-input"
                  type="text"
                  value={formatDisplayAmount(amount)}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="e.g. 50,000"
                  className="w-full rounded-2xl border border-[#DCE6DF] focus:border-[#16730F] focus:ring-1 focus:ring-[#16730F]/20 pl-9 pr-4 py-3 text-xs sm:text-sm text-gray-900 outline-none transition"
                />
              </div>

              <p className="mt-1 text-[11px] text-[#718279]">
                Enter whole figures in Nigerian Naira.
              </p>
            </div>

            {/* Suggested Amounts Pills */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#5A6D62]">
                Suggested amounts:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {SUGGESTED_AMOUNTS.map((sug) => {
                  const isCurrent = String(amount) === sug.value;
                  return (
                    <button
                      key={sug.value}
                      type="button"
                      onClick={() => update({ amount: sug.value })}
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer border ${
                        isCurrent
                          ? "bg-[#16730F] text-white border-[#16730F] shadow-2xs"
                          : "bg-white hover:bg-[#F2F6F3] text-[#122B20] border-[#DCE6DF]"
                      }`}
                    >
                      {sug.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


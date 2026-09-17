import React from "react";
import { Check } from "lucide-react";
import { CTA_OPTIONS } from "../pitchModalConstants";

export default function Step5Cta({ ctaType, onSelectCta }) {
  return (
    <div className="space-y-3.5 sm:space-y-4">
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-[#1A3E32]">
          Choose Your Call to Action
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
          Select what viewers should do when they want to connect or work with you.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
        {CTA_OPTIONS.map((item) => {
          const isSelected = ctaType === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onSelectCta(item.id)}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                isSelected
                  ? "border-[#16730F] bg-green-50/30 shadow-sm ring-1 ring-[#16730F]"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#1A3E32]">
                  {item.id}
                </h4>
                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                  {item.desc}
                </p>
              </div>

              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected
                    ? "bg-[#16730F] border-[#16730F] text-white"
                    : "border-gray-300"
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from "react";
import { Check } from "lucide-react";
import Button from "../../../ui/Button";
import {
  AUDIENCE_OPTIONS,
  TARGET_INDUSTRIES,
  TARGET_ROLES,
} from "../pitchModalConstants";

export default function Step4Audience({
  selectedAudiences,
  selectedIndustries,
  selectedRoles,
  onToggleAudience,
  onToggleIndustry,
  onToggleRole,
}) {
  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-[#1A3E32]">
          Who should see this Pitch?
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
          Target your Pitch to the people most likely to respond and partner with you.
        </p>
      </div>

      <div>
        <span className="block text-[11px] sm:text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">
          AUDIENCE
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {AUDIENCE_OPTIONS.map((aud) => {
            const isSelected = selectedAudiences.includes(aud.id);
            return (
              <div
                key={aud.id}
                onClick={() => onToggleAudience(aud.id)}
                className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                  isSelected
                    ? "border-[#16730F] bg-green-50/30 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs sm:text-sm text-[#1A3E32]">
                    {aud.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                    {aud.description}
                  </p>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
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

      <div className="pt-1 sm:pt-2">
        <span className="block text-[11px] sm:text-xs font-bold text-gray-800 uppercase tracking-wide mb-2.5">
          TARGET <span className="text-gray-400 font-normal">(optional)</span>
        </span>

        <div className="mb-3.5 sm:mb-4">
          <span className="block text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 sm:mb-2">
            TARGET INDUSTRIES
          </span>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {TARGET_INDUSTRIES.map((ind) => {
              const isSelected = selectedIndustries.includes(ind);
              return (
                <Button
                  key={ind}
                  size="sm"
                  variant={isSelected ? "primary" : "outline"}
                  onClick={() => onToggleIndustry(ind)}
                  className={`font-medium ${
                    isSelected
                      ? "shadow-sm"
                      : "text-gray-700 hover:border-gray-300 font-normal"
                  }`}
                >
                  {ind}
                </Button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="block text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 sm:mb-2">
            TARGET ROLES & FUNCTIONS
          </span>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {TARGET_ROLES.map((role) => {
              const isSelected = selectedRoles.includes(role);
              return (
                <Button
                  key={role}
                  size="sm"
                  variant={isSelected ? "primary" : "outline"}
                  onClick={() => onToggleRole(role)}
                  className={`font-medium ${
                    isSelected
                      ? "shadow-sm"
                      : "text-gray-700 hover:border-gray-300 font-normal"
                  }`}
                >
                  {role}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

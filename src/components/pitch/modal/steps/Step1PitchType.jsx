import React from "react";
import { CheckCircle2 } from "lucide-react";
import { PITCH_TYPES } from "../pitchModalConstants";

export default function Step1PitchType({ pitchType, onSelectType }) {
  return (
    <div>
      <div className="mb-3.5 sm:mb-5">
        <h3 className="text-lg sm:text-xl font-bold text-[#1A3E32]">
          What do you want to Pitch?
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
          Choose what you want people to discover about you or your opportunity.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {PITCH_TYPES.map((type) => {
          const IconComp = type.icon;
          const isSelected = pitchType === type.id;
          return (
            <div
              key={type.id}
              onClick={() => onSelectType(type.id)}
              className={`relative p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "border-[#16730F] bg-green-50/40 shadow-sm ring-1 ring-[#16730F]"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <div>
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center mb-2.5 sm:mb-3 ${type.color}`}
                >
                  <IconComp className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-[#1A3E32] mb-1">
                  {type.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed">
                  {type.description}
                </p>
              </div>

              {isSelected && (
                <div className="absolute top-3 right-3 text-[#16730F]">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 fill-[#16730F] text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

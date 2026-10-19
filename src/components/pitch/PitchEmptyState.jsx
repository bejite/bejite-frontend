import React from "react";
import { Video } from "lucide-react";

export default function PitchEmptyState({ onCreatePitch }) {
  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-gray-200 min-h-[320px] sm:min-h-[460px] flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 text-center my-2 sm:my-4 shadow-xs">
      <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-50 text-[#16730F] flex items-center justify-center mb-3 sm:mb-4">
        <Video className="w-5 h-5 sm:w-7 sm:h-7" />
      </div>

      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1A3E32] mb-1.5 sm:mb-2">
        No Pitches found
      </h2>
      <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 max-w-md mx-auto leading-relaxed mb-4 sm:mb-6">
        We couldn&apos;t find a Pitch matching your current criteria. Be the first to
        showcase what you can do or adjust your discovery filters.
      </p>

      <button
        type="button"
        onClick={onCreatePitch}
        className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#16730F] hover:bg-[#125e0c] text-white text-[10px] sm:text-xs font-bold transition-all shadow-sm cursor-pointer"
      >
        Create Pitch
      </button>
    </div>
  );
}

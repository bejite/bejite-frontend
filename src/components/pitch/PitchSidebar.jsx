import React from "react";
import { Plus, Globe, Video, Clock } from "lucide-react";

export default function PitchSidebar({ activeTab, onTabChange, onCreatePitch }) {
  return (
    <aside className="w-full lg:w-[260px] shrink-0 flex flex-col gap-2.5 sm:gap-3 lg:gap-5">
      {/* Create Pitch Button */}
      <button
        type="button"
        onClick={onCreatePitch}
        className="w-full bg-[#16730F] hover:bg-[#125e0c] text-white font-bold py-2.5 sm:py-3.5 px-4 sm:px-5 rounded-full flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer text-xs sm:text-sm"
      >
        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-white flex items-center justify-center">
          <Plus className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
        </div>
        <span className="tracking-wide">Create Pitch</span>
      </button>

      {/* Pitches Menu — Segmented pill on mobile, vertical stack on desktop */}
      <div className="flex flex-row lg:flex-col gap-1 p-1 bg-gray-200/60 lg:bg-transparent rounded-full lg:rounded-none">
        <span className="hidden lg:block text-[11px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-1">
          Pitches
        </span>

        <button
          type="button"
          onClick={() => onTabChange("discover")}
          className={`flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all text-left cursor-pointer flex-1 lg:flex-none justify-center lg:justify-start ${
            activeTab === "discover"
              ? "bg-white lg:bg-[#EAF5E9] text-[#16730F] shadow-xs lg:shadow-none"
              : "text-gray-600 hover:text-gray-900 lg:text-gray-700 lg:hover:bg-gray-100"
          }`}
        >
          <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>Discover</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("my-pitches")}
          className={`flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all text-left cursor-pointer flex-1 lg:flex-none justify-center lg:justify-start ${
            activeTab === "my-pitches"
              ? "bg-white lg:bg-[#EAF5E9] text-[#16730F] shadow-xs lg:shadow-none"
              : "text-gray-600 hover:text-gray-900 lg:text-gray-700 lg:hover:bg-gray-100"
          }`}
        >
          <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>My Pitches</span>
        </button>
      </div>

      {/* 24-Hour Visibility Notice — compact sleek banner on mobile/tablet */}
      <div className="lg:hidden bg-[#163A2E] text-white rounded-xl px-3 py-2 flex items-center gap-2 text-[10px] sm:text-xs shadow-xs">
        <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <p className="text-gray-200 leading-snug">
          <span className="font-bold text-white">24h Cycle:</span> Pitches broadcast for 24h, then automatically store safely in your archive.
        </p>
      </div>

      {/* Desktop 24-Hour Visibility Card */}
      <div className="hidden lg:block bg-[#163A2E] text-white rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-2.5 mb-2 sm:mb-2.5">
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
          <h4 className="text-xs font-bold tracking-wide">
            24-Hour Visibility Cycle
          </h4>
        </div>
        <p className="text-[11px] text-gray-300 leading-relaxed">
          Pitches broadcast in live discovery for 24 hours to maximize immediate
          relevance, then automatically store safely in your archive.
        </p>
      </div>
    </aside>
  );
}

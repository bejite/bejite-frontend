import React from "react";
import { Clock, Play, CheckCircle2, Pencil } from "lucide-react";

export default function Step6Review({
  currentTypeObj,
  currentUser,
  headline,
  description,
  skills,
  ctaType,
  selectedAudiences,
  videoDurationText,
  onEditStep,
}) {
  return (
    <div>
      <div className="mb-3.5 sm:mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-[#1A3E32]">
          Review Your Pitch
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
          Make sure everything looks right before broadcasting your Pitch to the Bejite community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[210px_minmax(0,1fr)] lg:grid-cols-[230px_minmax(0,1fr)] gap-4 sm:gap-6 items-start">
        {/* VIDEO PREVIEW */}
        <div>
          <span className="block text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2">
            VIDEO PREVIEW
          </span>

          <div className="relative w-full max-w-[200px] xs:max-w-[220px] sm:max-w-[230px] mx-auto aspect-[9/16] bg-[#122A23] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-gray-800 flex flex-col justify-between p-3.5 sm:p-4 select-none">
            <div className="flex items-center justify-between gap-1 z-10">
              <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-semibold">
                <Clock className="w-3 h-3 text-emerald-400" />
                24h Live Feed
              </span>
              <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-bold">
                {currentTypeObj?.badge || "SKILL"}
              </span>
            </div>

            <div className="self-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/50 bg-black/30 flex items-center justify-center text-white z-10">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white translate-x-0.5" />
            </div>

            <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent -mx-3.5 -mb-3.5 sm:-mx-4 sm:-mb-4 p-3.5 sm:p-4 pt-5 sm:pt-6 z-10 text-white">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="relative">
                  <img
                    src={currentUser?.image || "/assets/images/photo_placeholder.png"}
                    alt=""
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-white"
                  />
                  <span className="absolute bottom-0 right-0 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 border border-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] sm:text-xs font-bold truncate">
                      {currentUser?.name || "Your name"}
                    </span>
                    <CheckCircle2 className="w-3 h-3 fill-[#16730F] text-white shrink-0" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-gray-300 block truncate">
                    {currentUser?.title ||
                      currentUser?.jobTitle ||
                      currentUser?.job_title ||
                      "Your title"}
                  </span>
                </div>
              </div>

              <p className="text-[10px] sm:text-[11px] font-bold leading-tight mb-1.5 line-clamp-2">
                {headline || "Your headline"}
              </p>

              <div className="flex flex-wrap gap-1 mb-2">
                {skills.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="px-1.5 sm:px-2 py-0.5 rounded-full bg-white/20 text-[8px] sm:text-[9px] font-medium backdrop-blur-sm"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <button
                type="button"
                className="w-full py-1.5 sm:py-2 rounded-lg bg-[#16730F] text-white font-bold text-[11px] sm:text-xs shadow-sm"
              >
                {ctaType || "Call to action"}
              </button>
            </div>
          </div>
        </div>

        {/* BREAKDOWN */}
        <div>
          <span className="block text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2">
            BREAKDOWN
          </span>

          <div className="space-y-2.5 sm:space-y-3">
            {/* 1. Video Clip */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-xs sm:text-sm text-[#1A3E32]">
                  1. Video Clip
                </h4>
                <button
                  type="button"
                  onClick={() => onEditStep(2)}
                  className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-gray-600 hover:text-[#16730F] cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {videoDurationText} · Ready to stream
              </p>
            </div>

            {/* 2. Pitch Details */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-xs sm:text-sm text-[#1A3E32]">
                  2. Pitch Details
                </h4>
                <button
                  type="button"
                  onClick={() => onEditStep(3)}
                  className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-gray-600 hover:text-[#16730F] cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
              </div>
              <p className="font-semibold text-xs text-gray-800 line-clamp-1 mb-0.5">
                {headline || "No headline yet"}
              </p>
              <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                {description || "No description yet"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-0.5 rounded-full bg-[#EAF5E9] text-[#16730F] text-[10px] sm:text-[11px] font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* 3. Audience Targeting */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-xs sm:text-sm text-[#1A3E32]">
                  3. Audience Targeting
                </h4>
                <button
                  type="button"
                  onClick={() => onEditStep(4)}
                  className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-gray-600 hover:text-[#16730F] cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
              </div>
              <p className="text-xs text-gray-500 capitalize">
                {selectedAudiences.length
                  ? selectedAudiences.join(", ")
                  : "Broad Network"}
              </p>
            </div>

            {/* 4. Call to Action */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-xs sm:text-sm text-[#1A3E32]">
                  4. Call to Action
                </h4>
                <button
                  type="button"
                  onClick={() => onEditStep(5)}
                  className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-gray-600 hover:text-[#16730F] cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
              </div>
              <p className="text-xs text-gray-800 font-semibold">
                {ctaType}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

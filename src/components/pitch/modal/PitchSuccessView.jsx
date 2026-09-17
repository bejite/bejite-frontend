import React from "react";
import { Check, Clock, Play, Share2, BarChart2 } from "lucide-react";
import Button from "../../ui/Button";

export default function PitchSuccessView({
  publishedPitchData,
  headline,
  ctaType,
  onViewInFeed,
  onShareLink,
  onGoToMyPitches,
  onClose,
}) {
  return (
    <div className="p-5 sm:p-8 md:p-10 text-center flex flex-col items-center">
      {/* Green circular checkmark */}
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-green-500 text-green-600 flex items-center justify-center mb-3 sm:mb-4">
        <Check className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-[#1A3E32] mb-1 sm:mb-1.5">
        Your Pitch is Live!
      </h2>
      <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto leading-relaxed mb-4 sm:mb-6">
        People across the Bejite professional network can now discover your skills, connect, and respond.
      </p>

      {/* Pitch Summary Box */}
      <div className="w-full max-w-sm rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 bg-gray-50/50 flex items-center gap-3 sm:gap-3.5 text-left mb-4 sm:mb-6">
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#1A3E32] shrink-0 overflow-hidden flex items-center justify-center">
          <span className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[8px] font-bold uppercase tracking-wider">
            Live
          </span>
          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white/80 text-white/80 translate-x-0.5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-[#16730F] text-[10px] sm:text-[11px] font-semibold mb-0.5">
            <Clock className="w-3 h-3" />
            <span>Expires in 23h 59m</span>
          </div>
          <h4 className="font-bold text-xs sm:text-sm text-[#1A3E32] truncate">
            {publishedPitchData?.headline || headline}
          </h4>
          <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase mt-0.5 tracking-wider">
            CTA: {publishedPitchData?.cta?.toUpperCase() || ctaType.toUpperCase()}
          </p>
        </div>
      </div>

      {/* View Pitch in Feed Button */}
      <Button
        onClick={() => {
          onViewInFeed?.(publishedPitchData);
          onClose();
        }}
        variant="primary"
        size="md"
        className="w-full max-w-sm py-3 sm:py-3.5 text-xs sm:text-sm mb-2.5 sm:mb-3"
      >
        View Pitch in Feed
      </Button>

      {/* Secondary Action Row: Share Link & My Pitches */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 w-full max-w-sm mb-3 sm:mb-4">
        <Button
          onClick={onShareLink}
          variant="gray"
          size="sm"
          icon={Share2}
          className="w-full sm:flex-1 py-2.5 px-4 text-xs font-semibold"
        >
          Share Link
        </Button>

        <Button
          onClick={() => {
            onGoToMyPitches?.();
            onClose();
          }}
          variant="gray"
          size="sm"
          icon={BarChart2}
          className="w-full sm:flex-1 py-2.5 px-4 text-xs font-semibold"
        >
          My Pitches
        </Button>
      </div>

      {/* Back to dashboard link */}
      <button
        type="button"
        onClick={onClose}
        className="text-xs text-gray-500 hover:text-gray-700 underline cursor-pointer"
      >
        back to dashboard
      </button>
    </div>
  );
}

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Video, MoreHorizontal } from "lucide-react";
// import { ArrowRight } from "lucide-react"; // pitch hub link temporarily disabled
// import { Link } from "react-router-dom"; // pitch hub link temporarily disabled
import PitchReelCard from "./PitchReelCard";

export default function PitchReelsCarousel({
  pitches = [],
  onSelectPitch,
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [pitches]);

  const handleScroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = direction === "left" ? -340 : 340;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  if (!pitches || pitches.length === 0) return null;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow rounded-2xl p-4 sm:p-5 relative overflow-hidden">
      {/* Header (Matching Facebook Reels header from screenshot) */}
      <div className="flex items-center justify-between mb-3.5 sm:mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#16730F] text-white flex items-center justify-center shadow-xs">
            <Video className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#1A3E32] leading-tight flex items-center gap-1.5">
              <span>Pitches</span>
              <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-[#16730F] border border-emerald-200">
                24h Reels
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Pitch hub temporarily disabled
          <Link
            to="/pitch"
            className="flex items-center gap-1 text-xs font-semibold text-[#16730F] hover:text-[#125e0c] hover:underline px-2.5 py-1 rounded-full hover:bg-emerald-50 transition-colors"
          >
            <span>See all</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          */}
          <button
            type="button"
            className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Carousel Track & Arrow buttons */}
      <div className="relative group/carousel">
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Scroll left"
            className="absolute -left-2 sm:left-1 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-gray-800 shadow-xl border border-gray-200/80 flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}

        {/* Right Arrow Button (Facebook circular white right button) */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Scroll right"
            className="absolute -right-2 sm:right-1 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-gray-800 shadow-xl border border-gray-200/80 flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}

        {/* Scrollable Cards Container */}
        <div
          ref={scrollRef}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1"
        >
          {pitches.map((pitch) => (
            <PitchReelCard
              key={pitch.id}
              pitch={pitch}
              onSelectPitch={onSelectPitch}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

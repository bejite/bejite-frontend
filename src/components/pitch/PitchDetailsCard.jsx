import React from "react";
import { Clock, CheckCircle, Heart, Share2 } from "lucide-react";

export default function PitchDetailsCard({
  pitch,
  onHireMe,
  onToggleLike,
  onShare,
  mobileSize = "balanced",
  onMobileActivate,
}) {
  if (!pitch) return null;

  const isDesktop = mobileSize === "desktop";
  const isCollapsed = mobileSize === "collapsed";
  const isExpanded = mobileSize === "expanded";

  const handleScrollActivate = () => {
    if (!isDesktop && onMobileActivate) onMobileActivate();
  };

  return (
    <div
      className={`w-full bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-sm flex flex-col justify-between overflow-hidden transition-all duration-300 ease-out ${
        isDesktop
          ? "max-w-[420px] p-4 sm:p-5 md:p-6 h-auto max-h-[min(86dvh,640px)]"
          : isCollapsed
            ? "max-w-full p-2.5 max-h-[96px] opacity-95"
            : isExpanded
              ? "max-w-full p-3.5 sm:p-4 flex-1 h-full min-h-0"
              : "max-w-full p-3.5 sm:p-4 flex-1 min-h-0"
      }`}
    >
      <div
        className={`min-h-0 pr-0.5 ${
          isCollapsed ? "overflow-hidden" : "overflow-y-auto nfl-scroll"
        }`}
        onScroll={handleScrollActivate}
      >
        {/* Top Badges */}
        <div
          className={`flex items-center justify-between gap-2 ${
            isCollapsed ? "mb-1.5" : "mb-2.5 sm:mb-3"
          }`}
        >
          <span className="px-2.5 sm:px-3 py-1 rounded-full bg-[#EAF5E9] text-[#16730F] text-[11px] sm:text-xs font-semibold truncate">
            {pitch.type}
          </span>
          {!isCollapsed && (
            <span className="px-2.5 sm:px-3 py-1 rounded-full bg-[#FEF3E2] text-[#B45309] text-[11px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 shrink-0">
              <Clock className="w-3.5 h-3.5 text-[#B45309]" />
              {pitch.expiresIn}
            </span>
          )}
        </div>

        {/* Creator Info */}
        <div
          className={`flex items-center gap-2.5 sm:gap-3 ${
            isCollapsed ? "mb-0" : "mb-2.5 sm:mb-3.5"
          }`}
        >
          <div className="relative shrink-0">
            <img
              src={pitch.creator.image}
              alt={pitch.creator.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/assets/images/photo_placeholder.png";
              }}
              className={`rounded-full object-cover border-2 border-white shadow-sm ${
                isCollapsed ? "w-8 h-8" : "w-10 h-10 sm:w-11 sm:h-11"
              }`}
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border-2 border-white" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <h3 className="font-bold text-sm sm:text-[15px] text-[#1A3E32] truncate">
                {pitch.creator.name}
              </h3>
              {pitch.creator.verified && (
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#16730F] text-white shrink-0" />
              )}
            </div>
            {!isCollapsed && (
              <>
                <p className="text-xs text-gray-500 font-medium truncate">
                  {pitch.creator.role}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 truncate mt-0.5">
                  {pitch.creator.location} ·{" "}
                  <span className="text-[#16730F] font-semibold">
                    {pitch.creator.availability}
                  </span>
                </p>
              </>
            )}
          </div>
        </div>

        {!isCollapsed && (
          <>
            {/* Pitch Hook Statement */}
            <blockquote
              className={`text-sm sm:text-base font-bold text-[#1A3E32] leading-snug mb-1.5 sm:mb-2 break-words ${
                isDesktop ? "" : isExpanded ? "line-clamp-4" : "line-clamp-3"
              } ${isDesktop ? "md:text-lg mb-2 sm:mb-3" : ""}`}
            >
              {pitch.headline}
            </blockquote>

            {/* Pitch Description */}
            <p
              className={`text-xs sm:text-sm text-gray-600 leading-relaxed mb-3 sm:mb-3.5 break-words ${
                isDesktop ? "mb-4 sm:mb-5" : isExpanded ? "line-clamp-5" : "line-clamp-3"
              }`}
            >
              {pitch.description}
            </p>

            {/* Core Skills */}
            <div className={isDesktop ? "mb-4 sm:mb-6" : "mb-3 sm:mb-4"}>
              <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Core Skills
              </span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {(pitch.skills || [])
                  .slice(0, isDesktop ? undefined : isExpanded ? 10 : 6)
                  .map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-[#EAF5E9] text-[#16730F]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Action & Engagement */}
      {!isCollapsed && (
        <div className="shrink-0 pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onHireMe(pitch);
            }}
            className="w-full bg-[#16730F] hover:bg-[#125e0c] text-white font-bold py-2.5 sm:py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-sm active:scale-[0.98] cursor-pointer mb-2.5"
          >
            {pitch.cta || "Hire Me"}
          </button>

          <div className="flex items-center justify-between border-t border-gray-100 pt-2 sm:pt-2.5 text-xs font-semibold text-gray-600">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike(pitch.id);
              }}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                pitch.isLiked ? "text-red-500" : "hover:text-[#16730F]"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                  pitch.isLiked ? "fill-red-500 text-red-500" : ""
                }`}
              />
              <span>Like {pitch.likes > 0 && `(${pitch.likes})`}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShare(pitch);
              }}
              className="flex items-center gap-1.5 hover:text-[#16730F] transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Share {pitch.shares > 0 && `(${pitch.shares})`}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

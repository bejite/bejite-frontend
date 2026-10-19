import React from "react";
import {
  FaGift,
  FaCheckCircle,
  FaPaperPlane,
  FaEnvelope,
} from "react-icons/fa";
import DisplayNameWithBadge from "../DisplayNameWithBadge";
import { getAuthorProfileImageUrl } from "../../utils/profileImageUtils";
import { milestoneJobSubtitle } from "../../services/milestonesApi";

export default function TodayBirthdaysHighlight({
  todayList,
  onNavigateProfile,
  onQuickWish,
  onOpenCustomModal,
}) {
  if (!todayList || todayList.length === 0) return null;

  return (
    <div className="mb-6 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-green-500/10 border border-[#16730F]/30 rounded-2xl p-4 sm:p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-3.5">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16730F] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#16730F]"></span>
        </span>
        <h2 className="text-sm sm:text-base font-bold text-[#1A3E32] flex items-center gap-2">
          <span> Today's Special Birthdays</span>
          <span className="px-2 py-0.5 bg-[#16730F] text-white text-[11px] rounded-full font-bold">
            {todayList.length}
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {todayList.map((person) => (
          <div
            key={person.id}
            className="bg-white rounded-xl p-4 border border-emerald-100/80 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                <img
                  src={getAuthorProfileImageUrl(person)}
                  alt={person.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#16730F]"
                />
                <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-[10px] p-0.5 rounded-full shadow-xs"></span>
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  className="font-bold text-[#1A3E32] text-sm truncate hover:text-[#16730F] cursor-pointer transition-colors"
                  onClick={() => onNavigateProfile(person.id)}
                >
                  <DisplayNameWithBadge user={person} fallback={person.name} />
                </h3>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {milestoneJobSubtitle(person)}
                </p>
                <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                  <FaGift className="text-yellow-500" />
                  <span>Celebrating today! 🎉</span>
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              {person.wished ? (
                <div className="flex items-center justify-center gap-2 py-2 bg-emerald-50 text-[#16730F] rounded-lg font-bold text-xs">
                  <FaCheckCircle className="h-3.5 w-3.5" />
                  <span>Wish Sent! 🎉</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onQuickWish(
                        person.id,
                        person.name,
                        "🎂 Happy Birthday! 🎉",
                      )
                    }
                    className="flex-1 py-2 px-3 bg-[#16730F] text-white rounded-lg text-xs font-bold hover:bg-[#145a0c] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FaPaperPlane className="text-[10px]" />
                    <span>Quick Wish </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenCustomModal(person)}
                    className="px-3 py-2 border border-[#16730F] text-[#16730F] hover:bg-emerald-50 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FaEnvelope className="text-[10px]" />
                    <span>Custom Note</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import { FaCalendarAlt, FaPaperPlane, FaEnvelope, FaCheckCircle } from "react-icons/fa";
import DisplayNameWithBadge from "../DisplayNameWithBadge";
import { getAuthorProfileImageUrl } from "../../utils/profileImageUtils";
import { milestoneJobSubtitle } from "../../services/milestonesApi";

const QUICK_CHIPS = [
  "🎂 Happy Birthday! 🎉",
  "🌟 Wishing you a fantastic day!",
];

export default function BirthdayCard({
  person,
  onNavigateProfile,
  onQuickWish,
  onOpenCustomModal,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 hover:shadow-md transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between h-full">
      <div>
        {/* User Info Header */}
        <div className="flex items-center gap-3 mb-3">
          <img
            src={getAuthorProfileImageUrl(person)}
            alt={person.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-emerald-600/20 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3
              className="font-bold text-[#1A3E32] text-sm truncate cursor-pointer hover:text-[#16730F] transition-colors"
              onClick={() => onNavigateProfile(person.id)}
            >
              <DisplayNameWithBadge user={person} fallback={person.name} />
            </h3>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {milestoneJobSubtitle(person)}
            </p>
          </div>
        </div>

        {/* Date Badge */}
        <div className="mb-3.5">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${
              person.category === "today"
                ? "bg-amber-50 text-amber-800 border border-amber-200"
                : person.category === "upcoming"
                  ? "bg-emerald-50 text-[#16730F] border border-emerald-200"
                  : "bg-gray-50 text-gray-600 border border-gray-200"
            }`}
          >
            <FaCalendarAlt className="text-[11px]" />
            <span>
              {person.dateFormatted} ({person.birthday})
            </span>
          </span>
        </div>

        {/* Quick Wish Preset Chips */}
        {!person.wished && (
          <div className="space-y-1.5 mb-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Quick Wishes
            </p>
            <div className="flex flex-col gap-1.5">
              {QUICK_CHIPS.map((chipText, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onQuickWish(person.id, person.name, chipText)}
                  className="text-left text-xs bg-gray-50 hover:bg-emerald-50 hover:text-[#16730F] border border-gray-200/80 hover:border-emerald-300 px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer truncate font-medium"
                >
                  {chipText}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="pt-3 border-t border-gray-100">
        {person.wished ? (
          <div className="w-full py-2 bg-emerald-50 text-[#16730F] border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
            <FaCheckCircle className="h-3.5 w-3.5" />
            <span>Wish Sent! 🎉</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                onQuickWish(person.id, person.name, "🎂 Happy Birthday! 🎉")
              }
              className="flex-1 py-2.5 px-3 bg-[#16730F] hover:bg-[#145a0c] text-white rounded-xl text-xs font-bold transition-all duration-150 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FaPaperPlane className="text-[10px]" />
              <span>Wish Happy Birthday</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenCustomModal(person)}
              className="p-2.5 border border-gray-300 hover:border-[#16730F] text-gray-600 hover:text-[#16730F] hover:bg-emerald-50 rounded-xl text-xs transition-all duration-150 flex items-center justify-center shrink-0 cursor-pointer"
              title="Custom Note"
            >
              <FaEnvelope className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

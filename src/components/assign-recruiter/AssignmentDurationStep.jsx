import React from "react";
import { Calendar } from "lucide-react";

/**
 * Step 3: Assignment Duration and Scope Note Component.
 */
export default function AssignmentDurationStep({
  durationType = "until_revoked",
  onDurationTypeChange,
  customExpiresAt = "",
  onCustomExpiresAtChange,
  minCustomDate = "",
  note = "",
  onNoteChange,
  durations = [],
}) {
  return (
    <div className="space-y-4 pt-2 border-t border-gray-100">
      <div className="flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-full bg-[#1A3E32] text-white text-xs font-bold flex items-center justify-center">
          3
        </span>
        <h3 className="text-sm font-bold text-gray-900">
          Access Duration & Handover Note
        </h3>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-semibold text-gray-700">
          Duration
        </label>
        <div className="flex flex-wrap gap-2">
          {durations.map((option) => {
            const active = durationType === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onDurationTypeChange?.(option.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  active
                    ? "bg-[#1A3E32] text-white border-[#1A3E32]"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {durationType === "custom" && (
          <div className="pt-2 max-w-xs">
            <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-[#1A3E32]" />
              Automatic expiration date
            </label>
            <input
              type="date"
              min={minCustomDate}
              value={customExpiresAt}
              onChange={(e) => onCustomExpiresAtChange?.(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-[#1A3E32] focus:ring-2 focus:ring-[#1A3E32]/15"
            />
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-gray-700">
            Handover Note{" "}
            <span className="font-normal text-gray-400">(Optional)</span>
          </label>
          <span className="text-[11px] text-gray-400">{note.length}/240</span>
        </div>
        <textarea
          rows={2}
          maxLength={240}
          value={note}
          onChange={(e) => onNoteChange?.(e.target.value)}
          placeholder="e.g. Manage Q4 engineering job postings, screen incoming CVs, and schedule interviews."
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1A3E32] focus:ring-2 focus:ring-[#1A3E32]/15 resize-none"
        />
      </div>
    </div>
  );
}


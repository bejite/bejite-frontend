import React from "react";

/** Matches BirthdayCard layout so loading → content doesn’t jump. */
export default function BirthdayCardSkeleton() {
  return (
    <div
      className="bg-white rounded-2xl shadow-xs border border-gray-200/80 p-4 sm:p-5 flex flex-col justify-between min-h-[240px] animate-pulse"
      aria-hidden="true"
    >
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 bg-gray-200 rounded-md w-3/4 max-w-[180px]" />
            <div className="h-3 bg-gray-200 rounded-md w-1/2 max-w-[120px]" />
          </div>
        </div>

        <div className="mb-3.5">
          <div className="h-7 bg-gray-200 rounded-lg w-40" />
        </div>

        <div className="space-y-1.5 mb-4">
          <div className="h-2.5 bg-gray-200 rounded-md w-16 mb-2" />
          <div className="h-8 bg-gray-200 rounded-lg w-full" />
          <div className="h-8 bg-gray-200 rounded-lg w-full" />
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
        <div className="h-10 bg-gray-200 rounded-xl flex-1" />
        <div className="h-10 w-10 bg-gray-200 rounded-xl shrink-0" />
      </div>
    </div>
  );
}

export function BirthdayTabsSkeleton() {
  return (
    <div
      className="bg-white rounded-xl shadow-xs border border-gray-200/80 p-1 mb-6 flex items-center gap-1 animate-pulse"
      aria-hidden="true"
    >
      {["All", "Today", "Upcoming", "Recent"].map((label) => (
        <div
          key={label}
          className="flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg"
        >
          <div className="h-3 bg-gray-200 rounded w-12" />
          <div className="h-4 w-6 bg-gray-100 rounded-full" />
        </div>
      ))}
    </div>
  );
}

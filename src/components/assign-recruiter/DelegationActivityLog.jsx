import React from "react";
import { History } from "lucide-react";

function formatDateTime(isoString) {
  if (!isoString) return "";
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Activity log audit trail for recruiter delegation operations.
 */
export default function DelegationActivityLog({ logs = [] }) {
  if (!Array.isArray(logs) || logs.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <History className="w-4 h-4 text-[#1A3E32]" />
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          Delegation Activity Log
        </h3>
      </div>

      <div className="divide-y divide-gray-100">
        {logs.slice(0, 8).map((entry) => (
          <div
            key={entry.id}
            className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
          >
            <span className="text-gray-700 font-medium">{entry.summary}</span>
            <span className="text-gray-400 shrink-0">
              {formatDateTime(entry.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}


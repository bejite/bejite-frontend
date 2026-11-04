import React from "react";
import {
  Building2,
  Check,
  Clock,
  PauseCircle,
  Pencil,
  PlayCircle,
  ShieldCheck,
  SlidersHorizontal,
  UserMinus,
} from "lucide-react";
import DisplayNameWithBadge from "../DisplayNameWithBadge";
import RecruiterAvatar from "./RecruiterAvatar";
import { computeEffectiveDelegationStatus } from "../../services/accountDelegationService";

function formatShortDate(isoString) {
  if (!isoString) return null;
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Reusable card displaying an active or paused recruiter assignment.
 */
export default function AssignedRecruiterCard({
  delegation,
  isEditingThis = false,
  isBusy = false,
  onEdit,
  onTogglePause,
  onRevoke,
  permissionLabelMap = {},
}) {
  const recruiter = delegation?.recruiter || {};
  const effectiveStatus = computeEffectiveDelegationStatus(delegation);
  const isFull = delegation?.accessLevel === "full";
  const expiryFormatted = formatShortDate(delegation?.expiresAt);

  return (
    <div
      className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all ${
        isEditingThis
          ? "border-[#16730F] ring-2 ring-[#16730F]/15"
          : "border-gray-100 hover:border-gray-200"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <RecruiterAvatar recruiter={recruiter} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <DisplayNameWithBadge
                user={recruiter}
                fallback={recruiter.name || "Recruiter"}
                badgeSize="xs"
                className="font-bold text-sm sm:text-base text-gray-900"
              />
              {recruiter.isCorporate && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  Corporate
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-gray-500 mt-0.5">
              {recruiter.jobTitle && <span>{recruiter.jobTitle}</span>}
              {recruiter.companyName &&
                recruiter.companyName !== recruiter.jobTitle && (
                  <span className="inline-flex items-center gap-1 text-gray-400">
                    <Building2 className="w-3 h-3 shrink-0" />
                    {recruiter.companyName}
                  </span>
                )}
              {recruiter.email && (
                <span className="text-gray-400 truncate">
                  · {recruiter.email}
                </span>
              )}
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isFull
                    ? "bg-[#1A3E32] text-white"
                    : "bg-[#EAF5E9] text-[#16730F] border border-[#16730F]/20"
                }`}
              >
                {isFull ? (
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : (
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                )}
                {isFull ? "Full Assignment" : "Partial Assignment"}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  effectiveStatus === "active"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : effectiveStatus === "paused"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-gray-100 text-gray-600 border border-gray-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    effectiveStatus === "active"
                      ? "bg-emerald-500"
                      : effectiveStatus === "paused"
                      ? "bg-amber-500"
                      : "bg-gray-400"
                  }`}
                />
                {effectiveStatus === "active"
                  ? "Active"
                  : effectiveStatus === "paused"
                  ? "Paused"
                  : "Expired"}
              </span>

              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {expiryFormatted
                  ? effectiveStatus === "expired"
                    ? `Expired ${expiryFormatted}`
                    : `Until ${expiryFormatted}`
                  : "Until revoked"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
          <button
            type="button"
            onClick={() => onEdit?.(delegation)}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-[#1A3E32]/40 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>

          {effectiveStatus !== "expired" && (
            <button
              type="button"
              onClick={() => onTogglePause?.(delegation)}
              disabled={isBusy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-amber-50/60 hover:border-amber-200 text-xs font-semibold text-gray-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              {effectiveStatus === "paused" ? (
                <>
                  <PlayCircle className="w-3.5 h-3.5 text-[#16730F]" />
                  Resume
                </>
              ) : (
                <>
                  <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                  Pause
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => onRevoke?.(delegation)}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 text-xs font-semibold text-red-600 transition-colors cursor-pointer disabled:opacity-50"
          >
            <UserMinus className="w-3.5 h-3.5" />
            Revoke
          </button>
        </div>
      </div>

      {/* Granted Scope */}
      <div className="mt-3.5 pt-3 border-t border-gray-100">
        {isFull ? (
          <div className="flex items-center gap-2 text-xs text-gray-700">
            <span className="font-semibold text-gray-800">Scope:</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#1A3E32]/10 text-[#1A3E32] text-[11px] font-semibold">
              All 6 operational modules
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-500 mr-1">
              Permissions:
            </span>
            {(delegation.permissions || []).map((permId) => (
              <span
                key={permId}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-700 text-[11px] font-medium"
              >
                <Check className="w-3 h-3 text-[#16730F]" />
                {permissionLabelMap[permId] || permId}
              </span>
            ))}
          </div>
        )}

        {delegation.note && (
          <p className="text-xs text-gray-500 italic mt-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
            "{delegation.note}"
          </p>
        )}
      </div>
    </div>
  );
}


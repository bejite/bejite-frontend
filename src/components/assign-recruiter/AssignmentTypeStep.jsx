import React from "react";
import {
  Briefcase,
  Check,
  FileText,
  GitBranch,
  Lock,
  MessageSquare,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
} from "lucide-react";

const PERMISSION_ICONS = {
  jobs_manage: Briefcase,
  applications_review: FileText,
  pipeline_manage: GitBranch,
  candidate_outreach: UserCheck,
  messaging_respond: MessageSquare,
  content_manage: Sparkles,
};

/**
 * Step 2: Assignment Type (Partial vs Full) and Permissions Selector.
 * Verbose descriptions removed for a clean, streamlined interface.
 */
export default function AssignmentTypeStep({
  accessLevel = "partial",
  onAccessLevelChange,
  selectedPermissions = [],
  onTogglePermission,
  onApplyPreset,
  permissions = [],
  presets = [],
}) {
  return (
    <div className="space-y-4 pt-2 border-t border-gray-100">
      <div className="flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-full bg-[#1A3E32] text-white text-xs font-bold flex items-center justify-center">
          2
        </span>
        <h3 className="text-sm font-bold text-gray-900">
          Choose Assignment Type
        </h3>
      </div>

      {/* Partial vs Full Radio Cards (Clean - Descriptions Removed) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Partial Assignment Card */}
        <button
          type="button"
          onClick={() => onAccessLevelChange?.("partial")}
          className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
            accessLevel === "partial"
              ? "border-[#16730F] bg-[#EAF5E9]/45 shadow-xs"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                accessLevel === "partial"
                  ? "bg-[#16730F] text-white"
                  : "bg-gray-100 text-[#1A3E32]"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1A3E32]/10 text-[#1A3E32]">
                Recommended
              </span>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  accessLevel === "partial"
                    ? "border-[#16730F] bg-[#16730F]"
                    : "border-gray-300"
                }`}
              >
                {accessLevel === "partial" && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
            </div>
          </div>

          <p className="font-bold text-gray-900 text-sm mt-3">
            Partial Assignment
          </p>
        </button>

        {/* Full Assignment Card */}
        <button
          type="button"
          onClick={() => onAccessLevelChange?.("full")}
          className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
            accessLevel === "full"
              ? "border-[#1A3E32] bg-[#1A3E32]/[0.04] shadow-xs"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                accessLevel === "full"
                  ? "bg-[#1A3E32] text-white"
                  : "bg-gray-100 text-[#1A3E32]"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                accessLevel === "full"
                  ? "border-[#1A3E32] bg-[#1A3E32]"
                  : "border-gray-300"
              }`}
            >
              {accessLevel === "full" && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
          </div>

          <p className="font-bold text-gray-900 text-sm mt-3">
            Full Assignment
          </p>
        </button>
      </div>

      {/* Scope Configuration Panel */}
      {accessLevel === "partial" ? (
        <div className="rounded-2xl border border-gray-200 p-4 space-y-3.5 bg-gray-50/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-xs font-bold text-gray-900">
              Select Allowed Permissions ({selectedPermissions.length} enabled)
            </p>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onApplyPreset?.(preset.permissions)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 hover:border-[#16730F] text-[11px] font-medium text-gray-700 transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Permissions Grid (Descriptions Removed) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {permissions.map((perm) => {
              const checked = selectedPermissions.includes(perm.id);
              const PermIcon = PERMISSION_ICONS[perm.id] || Shield;

              return (
                <button
                  key={perm.id}
                  type="button"
                  onClick={() => onTogglePermission?.(perm.id)}
                  className={`text-left p-3 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                    checked
                      ? "bg-white border-[#16730F] shadow-2xs"
                      : "bg-white/70 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      checked
                        ? "bg-[#16730F] border-[#16730F] text-white"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {checked && <Check className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    <PermIcon className="w-4 h-4 text-[#1A3E32] shrink-0" />
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {perm.label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#1A3E32]/20 bg-[#1A3E32]/[0.03] p-4 space-y-3">
          <p className="text-xs font-bold text-[#1A3E32]">
            Included in Full Assignment:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {permissions.map((perm) => (
              <div
                key={perm.id}
                className="flex items-center gap-2 text-xs text-gray-700 bg-white rounded-xl px-3 py-2 border border-gray-100"
              >
                <Check className="w-3.5 h-3.5 text-[#16730F] shrink-0" />
                <span className="font-medium">{perm.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


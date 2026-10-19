import { BadgeCheck, BadgeX } from "lucide-react";

function getVerifiedBadgeLabel(userOrRole) {
  const role =
    typeof userOrRole === "string"
      ? userOrRole
      : userOrRole?.role ?? userOrRole?.author_role ?? null;

  const normalized = String(role ?? "").toLowerCase();
  if (normalized === "recruiter" || normalized === "employer") {
    return "Verified Recruiter";
  }
  if (normalized === "jobseeker") {
    return "Verified Jobseeker";
  }
  return "Verified";
}

function userIsRecruiter(userOrRole) {
  const role =
    typeof userOrRole === "string"
      ? userOrRole
      : userOrRole?.role ?? userOrRole?.author_role ?? null;
  const normalized = String(role ?? "").toLowerCase();
  return normalized === "recruiter" || normalized === "employer";
}

/**
 * Green verified badge pill (distinct from email verification).
 */
export default function VerifiedBadge({
  size = "sm",
  showLabel = true,
  className = "",
  user = null,
  role = null,
  label = null,
  unverified = false,
}) {
  const sizes = {
    xs: {
      icon: "w-3 h-3",
      text: "text-[8px] leading-tight",
      gap: "gap-0.5",
      pad: "px-1 py-0.5",
    },
    sm: {
      icon: "w-3.5 h-3.5",
      text: "text-[10px] leading-tight",
      gap: "gap-1",
      pad: "px-1.5 py-0.5",
    },
    md: {
      icon: "w-4 h-4",
      text: "text-xs leading-tight",
      gap: "gap-1",
      pad: "px-2 py-0.5",
    },
  };
  const s = sizes[size] || sizes.sm;
  const displayLabel = unverified
    ? (label ?? "Unverified")
    : (label ?? getVerifiedBadgeLabel(role ?? user));
  const Icon = unverified ? BadgeX : BadgeCheck;
  const toneClass = unverified
    ? "bg-amber-50 text-amber-800 border-amber-200"
    : "bg-[#E8F5E9] text-[#16730F] border-[#16730F]/20";
  const iconTone = unverified ? "text-amber-700" : "text-[#16730F]";

  if (!showLabel) {
    return (
      <Icon
        className={`${s.icon} ${iconTone} shrink-0 inline-block ${className}`}
        aria-label={displayLabel}
        title={displayLabel}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center ${s.gap} ${s.pad} rounded-full ${toneClass} border font-semibold ${s.text} whitespace-nowrap shrink-0 ${className}`}
      title={displayLabel}
      aria-label={displayLabel}
    >
      <Icon className={`${s.icon} shrink-0`} aria-hidden />
      {displayLabel}
    </span>
  );
}

export { userIsRecruiter };

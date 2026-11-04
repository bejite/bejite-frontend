import React, { useState } from "react";
import { profilePhotoUrl } from "../../utils/profilePhotoUrl";

export function getInitials(name) {
  if (!name) return "R";
  const parts = String(name).trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return String(name).slice(0, 2).toUpperCase();
}

/**
 * Reusable avatar component with profile image fallback to initials.
 */
export default function RecruiterAvatar({
  recruiter,
  sizeClass = "w-11 h-11",
  textClass = "text-sm",
}) {
  const [failed, setFailed] = useState(false);
  const photoSrc = profilePhotoUrl(recruiter?.profilePhoto);

  if (photoSrc && !failed) {
    return (
      <img
        src={photoSrc}
        alt={recruiter?.name || "Recruiter"}
        onError={() => setFailed(true)}
        className={`${sizeClass} rounded-full object-cover border border-gray-200 shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-[#1A3E32] to-[#2d6a54] text-white font-bold ${textClass} flex items-center justify-center shrink-0`}
    >
      {getInitials(recruiter?.name)}
    </div>
  );
}


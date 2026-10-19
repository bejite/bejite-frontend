import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBriefcase,
  FaBuilding,
  FaCamera,
  FaMapMarkerAlt,
  FaUserFriends,
} from "react-icons/fa";
import DisplayNameWithBadge from "../DisplayNameWithBadge";
import ProfileConnectActions from "../ProfileConnectActions";
import {
  formatDisplayPersonName,
  formatRoleAndMode,
  formatDisplayHandle,
} from "../../utils/personDisplayName";
import { formatDisplayText } from "../../utils/displayFormatUtils";
import { profileAvatarSrc } from "../../utils/profilePhotoUrl";
import { formatCompactCount as formatConnectionCount } from "../../utils/formatCompactCount";

const MUTUAL_IDENTITY_PREVIEW = 3;

const formatMutualConnectionsLabel = (count, samples = []) => {
  const n = Number(count) || 0;
  if (n <= 0) return null;

  const names = (Array.isArray(samples) ? samples : [])
    .map((person) =>
      [person?.firstName, person?.lastName].filter(Boolean).join(" ").trim(),
    )
    .filter(Boolean);

  const countLabel = formatConnectionCount(n);
  if (names.length === 0) {
    return `${countLabel} mutual ${n === 1 ? "connection" : "connections"}`;
  }

  if (n === 1) return `${names[0]} is a mutual connection`;
  if (n === 2 && names.length >= 2) {
    return `${names[0]} and ${names[1]} are mutual connections`;
  }

  const shown = names.slice(0, 2);
  const remaining = Math.max(n - shown.length, 0);
  if (remaining <= 0) {
    return `${shown.join(" and ")} are mutual connections`;
  }

  return `${shown.join(", ")} and ${formatConnectionCount(remaining)} other${
    remaining === 1 ? "" : "s"
  }`;
};

const ProfileIdentitySidebar = ({
  profileData,
  isViewingOwnProfile,
  viewedRole,
  activeAvatarSrc,
  avatarCandidates = [],
  setAvatarIndex,
  onOpenPhotoViewer,
  onOpenMutualModal,
  viewedProfileId,
}) => {
  const navigate = useNavigate();

  const isRecruiterProfile = viewedRole === "recruiter";
  const displayHandle = formatDisplayHandle(profileData);
  const roleTone = isRecruiterProfile ? "#7e22ce" : "#16730F";
  const roleTint = isRecruiterProfile
    ? "bg-purple-50 text-purple-700 border-purple-200/80 shadow-2xs"
    : "bg-emerald-50 text-[#16730F] border-emerald-200/80 shadow-2xs";

  const recruiterPublicLocation = [profileData?.city, profileData?.country]
    .filter((value) => value != null && String(value).trim() !== "")
    .map((value) => formatDisplayText(value))
    .join(", ");

  return (
    <aside className="md:sticky md:top-6 mb-6 md:mb-0">
      <div className="relative bg-white rounded-sm border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_20px_40px_-25px_rgba(15,23,42,0.25)] overflow-hidden transition-all">
        {/* Deep Executive Letterhead Banner Strip */}
        <div className="relative h-20 bg-[linear-gradient(135deg,#051e06_0%,#093d07_35%,#16730F_75%,#269b1b_100%)] overflow-hidden">
          {/* Noise + Grid pattern overlays */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-emerald-400/10 blur-xl pointer-events-none" />

          {/* Role Watermark Tag */}
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 font-black text-4xl tracking-tighter select-none uppercase font-mono">
            {isRecruiterProfile ? "REC" : "JS"}
          </span>
        </div>

        <div className="px-5 pb-6 -mt-11 flex flex-col items-center text-center">
          {/* Framed Square Photo with Corner Role Badge */}
          <div
            className="relative group shrink-0 cursor-pointer"
            onClick={onOpenPhotoViewer}
            title="Click to expand photo"
          >
            <div className="w-24 h-24 rounded-lg overflow-hidden border-4 border-white shadow-[0_10px_25px_-5px_rgba(15,23,42,0.3)] bg-slate-100 -rotate-1 group-hover:rotate-0 group-hover:scale-105 transition-all duration-300">
              <img
                src={activeAvatarSrc}
                alt="Profile photo"
                className="w-full h-full object-cover"
                onError={() => {
                  if (typeof setAvatarIndex === "function") {
                    setAvatarIndex((prev) =>
                      prev < avatarCandidates.length - 1 ? prev + 1 : prev,
                    );
                  }
                }}
              />
            </div>
            {/* Corner Seal Icon */}
            <div
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-white border-2 flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-110"
              style={{ borderColor: roleTone }}
            >
              {isRecruiterProfile ? (
                <FaBuilding className="w-3 h-3" style={{ color: roleTone }} />
              ) : (
                <FaBriefcase className="w-3 h-3" style={{ color: roleTone }} />
              )}
            </div>
            {/* Hover overlay badge */}
            <div className="absolute inset-0 rounded-lg bg-slate-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 text-white text-[10px] font-bold gap-1 backdrop-blur-[1px]">
              <FaCamera className="w-3 h-3" />
              <span>View</span>
            </div>
          </div>

          {/* User Display Name */}
          <div className="mt-3.5 w-full">
            <DisplayNameWithBadge
              user={profileData}
              className=" items-center"
              badgePlacement="below"
              fallback="User"
              badgeSize="text-base sm:text-lg font-black text-slate-900 tracking-tight"
            />
          </div>

          {/* Role Badge */}
          <span
            className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-xs text-[10px] font-extrabold uppercase tracking-widest border ${roleTint}`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: roleTone }}
            />
            {formatRoleAndMode(viewedRole, profileData?.mode)}
          </span>

          {/* Company Name */}
          {isRecruiterProfile && profileData?.company_name && (
            <p className="mt-2.5 text-xs font-bold text-slate-800 flex items-center gap-1.5 justify-center break-words">
              <FaBuilding className="text-slate-400 shrink-0 text-[11px]" />
              <span>{formatDisplayText(profileData.company_name)}</span>
            </p>
          )}

          {/* Job Title / Headline */}
          {(profileData?.job_title || profileData?.title) && (
            <p className="mt-1 text-xs text-slate-600 font-medium break-words leading-snug max-w-[240px]">
              {formatDisplayText(profileData.job_title || profileData.title)}
            </p>
          )}

          {/* Mono Handle Tag */}
          {displayHandle && (
            <span className="inline-block mt-2.5 font-mono text-[10.5px] font-medium text-slate-500 bg-slate-50 border border-slate-200/90 px-2 py-0.5 rounded-xs tracking-tight">
              {displayHandle}
            </span>
          )}

          {/* Location Badge */}
          {isRecruiterProfile && recruiterPublicLocation && (
            <div className="flex items-center gap-1  text-slate-500 mt-2 font-medium">
              <FaMapMarkerAlt className="text-slate-400 shrink-0 text-[11px]" />
              <p className="break-words text-[11px]">
                {recruiterPublicLocation}
              </p>
            </div>
          )}

          {/* Connection Counter Widget */}
          <div className="w-full mt-4 pt-4 border-t border-slate-100">
            {isViewingOwnProfile ? (
              <button
                type="button"
                onClick={() => navigate("/connection")}
                className="w-full flex items-center justify-center gap-2 group/conn hover:text-[#16730F] transition-colors cursor-pointer py-1"
                title={
                  profileData?.isCorporate ||
                  (String(profileData?.role || "").toLowerCase() ===
                    "recruiter" &&
                    String(profileData?.mode || "").toLowerCase() ===
                      "corporate")
                    ? "View all your followers"
                    : "View all your connections"
                }
              >
                <span className="text-xl font-black text-slate-900 group-hover/conn:text-[#16730F] tabular-nums transition-colors">
                  {formatConnectionCount(profileData?.connectionCount)}
                </span>
                <span className="text-[10.5px] text-slate-500 group-hover/conn:text-[#16730F] font-bold uppercase tracking-wider transition-colors">
                  {profileData?.isCorporate ||
                  (String(profileData?.role || "").toLowerCase() ===
                    "recruiter" &&
                    String(profileData?.mode || "").toLowerCase() ===
                      "corporate")
                    ? Number(profileData?.connectionCount) === 1
                      ? "Follower"
                      : "Followers"
                    : Number(profileData?.connectionCount) === 1
                      ? "Connection"
                      : "Connections"}
                </span>
              </button>
            ) : (
              <div className="w-full flex items-center justify-center gap-2 py-1">
                <FaUserFriends className="text-xs text-slate-400" />
                <span className="text-base font-black text-slate-900 tabular-nums">
                  {formatConnectionCount(profileData?.connectionCount)}
                </span>
                <span className="text-[10.5px] text-slate-500 font-bold uppercase tracking-wider">
                  {profileData?.isCorporate ||
                  (String(profileData?.role || "").toLowerCase() ===
                    "recruiter" &&
                    String(profileData?.mode || "").toLowerCase() ===
                      "corporate")
                    ? Number(profileData?.connectionCount) === 1
                      ? "Follower"
                      : "Followers"
                    : Number(profileData?.connectionCount) === 1
                      ? "Connection"
                      : "Connections"}
                </span>
              </div>
            )}
          </div>

          {/* Connect Actions (Connect / Message buttons) */}
          {!isViewingOwnProfile && viewedProfileId && (
            <div className="mt-4 pt-4 border-t border-slate-100 w-full min-w-0">
              <ProfileConnectActions
                userId={viewedProfileId}
                displayName={formatDisplayPersonName(profileData, "User")}
              />
            </div>
          )}

          {/* Mutual Connections Widget */}
          {!isViewingOwnProfile &&
            Number(profileData?.mutualConnectionCount) > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 w-full text-left">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-extrabold text-slate-500 flex items-center gap-1.5 uppercase tracking-[0.16em]">
                    <FaUserFriends className="text-[#16730F]" />
                    Mutuals
                  </span>
                  <span className="text-[11px] font-bold text-[#16730F] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    {formatConnectionCount(profileData.mutualConnectionCount)}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex items-center -space-x-2.5 overflow-hidden py-1 shrink-0">
                    {(profileData.mutualConnections || [])
                      .slice(0, MUTUAL_IDENTITY_PREVIEW)
                      .map((person) => {
                        const name = [person?.firstName, person?.lastName]
                          .filter(Boolean)
                          .join(" ")
                          .trim();
                        return (
                          <button
                            key={String(person.id)}
                            type="button"
                            onClick={() =>
                              navigate(`/user-profile/${person.id}`)
                            }
                            className="relative h-7 w-7 rounded-full border-2 border-white shadow-xs overflow-hidden bg-slate-200 hover:z-10 focus:z-10 focus:outline-none transition-transform hover:scale-115 cursor-pointer"
                            title={
                              name ? `View ${name}'s profile` : "View profile"
                            }
                          >
                            <img
                              src={profileAvatarSrc(person.profile_photo)}
                              alt={name || "Mutual connection"}
                              className="h-full w-full object-cover"
                            />
                          </button>
                        );
                      })}
                    {Number(profileData.mutualConnectionCount) >
                      MUTUAL_IDENTITY_PREVIEW && (
                      <button
                        type="button"
                        onClick={onOpenMutualModal}
                        className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-100 text-[10px] font-bold text-[#16730F] shadow-xs hover:bg-emerald-200 transition-colors cursor-pointer"
                        title="See all mutual connections"
                      >
                        +
                        {formatConnectionCount(
                          Number(profileData.mutualConnectionCount) -
                            MUTUAL_IDENTITY_PREVIEW,
                        )}
                      </button>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-slate-500 leading-snug truncate font-medium">
                      {formatMutualConnectionsLabel(
                        profileData.mutualConnectionCount,
                        profileData.mutualConnections,
                      )}
                    </p>
                    {Number(profileData.mutualConnectionCount) >
                      MUTUAL_IDENTITY_PREVIEW && (
                      <button
                        type="button"
                        onClick={onOpenMutualModal}
                        className="text-[11px] font-bold text-[#16730F] hover:underline mt-0.5 inline-block cursor-pointer"
                      >
                        See all
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </aside>
  );
};

export default ProfileIdentitySidebar;

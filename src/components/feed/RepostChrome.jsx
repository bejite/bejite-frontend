import React from "react";
import { useNavigate } from "react-router-dom";
import { FaRetweet } from "react-icons/fa";
import { formatDisplayPersonName } from "../../utils/personDisplayName";
import { getAuthorSubtitle } from "../../utils/authorDisplay";
import { getAuthorProfileImageUrl } from "../../utils/profileImageUtils";
import DisplayNameWithBadge from "../DisplayNameWithBadge";
import FormattedPostBody from "./FormattedPostBody";

function formatRelativeTime(dateString) {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Just now";

  const now = new Date();
  const diffMs = date - now;
  const absMs = Math.abs(diffMs);
  const diffMins = Math.floor(absMs / 60000);
  const diffHours = Math.floor(absMs / 3600000);
  const diffDays = Math.floor(absMs / 86400000);
  const isFuture = diffMs > 0;

  if (diffMins < 1) return isFuture ? "soon" : "Just now";
  if (diffMins < 60) {
    return isFuture ? `in ${diffMins}m` : `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return isFuture ? `in ${diffHours}h` : `${diffHours}h ago`;
  }
  if (diffDays < 2) return isFuture ? "tomorrow" : "Yesterday";
  if (diffDays < 7) {
    return isFuture ? `in ${diffDays}d` : `${diffDays}d ago`;
  }

  const isThisYear = date.getFullYear() === now.getFullYear();
  const options = isThisYear
    ? { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
    : {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      };
  return date.toLocaleString("en-US", options);
}

/** Full reposter header + optional quote above the nested original. */
export function RepostIntro({
  repostedBy,
  quote,
  repostedAt,
  repostIsScheduled = false,
  currentUserId,
}) {
  const navigate = useNavigate();

  if (!repostedBy) return null;

  const isMe = String(repostedBy.id) === String(currentUserId);
  const displayName = isMe
    ? "You"
    : formatDisplayPersonName(repostedBy);
  const subtitle = getAuthorSubtitle(repostedBy, repostedBy.id);
  const photo = getAuthorProfileImageUrl(repostedBy);

  const goToProfile = () => {
    if (repostedBy.id) navigate(`/user-profile/${repostedBy.id}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={goToProfile}
          disabled={!repostedBy.id}
          className="rounded-full shrink-0 disabled:cursor-default"
          aria-label={`View ${displayName}'s profile`}
        >
          <img
            src={photo}
            alt=""
            className="rounded-full w-10 h-10 sm:w-12 sm:h-12 object-cover cursor-pointer hover:opacity-90"
          />
        </button>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={goToProfile}
            disabled={!repostedBy.id}
            className="font-semibold text-base sm:text-lg text-[#16730F] hover:underline text-left disabled:cursor-default disabled:no-underline max-w-full min-w-0"
          >
            {isMe ? (
              <span>You</span>
            ) : (
              <DisplayNameWithBadge
                user={repostedBy}
                fallback={displayName}
                badgeSize="xs"
                responsiveBadge
              />
            )}
          </button>
          <p className="text-[#1A3E32] text-xs sm:text-sm truncate">{subtitle}</p>
          <p className="flex items-center gap-1.5 text-[#1A3E32] text-xs sm:text-sm">
            <FaRetweet className="text-[#16730F] w-3 h-3 shrink-0" aria-hidden />
            <span>
              {repostIsScheduled
                ? `Scheduled for ${formatRelativeTime(repostedAt)}`
                : `Reposted · ${formatRelativeTime(repostedAt)}`}
            </span>
          </p>
        </div>
      </div>
      {quote ? (
        <FormattedPostBody
          body={quote}
          className="text-[15px] sm:text-base text-[#1A3E32] whitespace-pre-wrap break-words leading-relaxed"
        />
      ) : null}
    </div>
  );
}

/** Visually nests the original post under a quote-repost. */
export function OriginalPostNest({ active, children }) {
  if (!active) return children;

  return (
    <div className="rounded-xl border border-[#D9D9D9] bg-[#F7F8F7] overflow-hidden">
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">{children}</div>
    </div>
  );
}

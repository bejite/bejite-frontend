import React from "react";
import { formatDisplayPersonName } from "../utils/personDisplayName";
import {
  userHasVerifiedBadge,
  userShowsUnverifiedRecruiterPill,
} from "../utils/verifiedBadge";
import VerifiedBadge from "./VerifiedBadge";

/**
 * Canonical component for rendering a person's display name with verified badge.
 */
export default function PersonName({
  user,
  fallback = "Guest",
  badgeSize = "xs",
  className = "",
  nameClassName = "",
  as: Component = "span",
  showBadge,
  /** 'inline' = next to name (default); 'below' = under the name */
  badgePlacement = "inline",
  /**
   * On mobile, show icon only when the labelled pill would crowd the name row.
   * Defaults to true for inline badges; false when stacked under the name.
   */
  responsiveBadge,
  /** Whether to truncate with ellipsis (true) or allow multi-line wrapping (false) */
  truncate = true,
}) {
  const name = formatDisplayPersonName(user, fallback);
  const hasBadge = showBadge ?? userHasVerifiedBadge(user);
  const showUnverified =
    showBadge !== false &&
    !hasBadge &&
    userShowsUnverifiedRecruiterPill(user);
  const isBelow = badgePlacement === "below";
  const useResponsiveBadge = responsiveBadge ?? !isBelow;

  return (
    <Component
      className={`${
        isBelow
          ? "flex flex-col gap-0.5 w-full min-w-0 max-w-full overflow-hidden"
          : "inline-flex items-center gap-1 min-w-0 max-w-full overflow-hidden"
      } ${className}`}
    >
      <span
        className={`${
          truncate
            ? "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap block w-full max-w-full"
            : "w-full max-w-full break-words whitespace-normal block"
        } ${nameClassName}`}
        title={name}
      >
        {name}
      </span>
      {hasBadge ? (
        <VerifiedBadge
          size={badgeSize}
          user={user}
          responsiveLabel={useResponsiveBadge}
        />
      ) : showUnverified ? (
        <VerifiedBadge
          size={badgeSize}
          user={user}
          unverified
          responsiveLabel={useResponsiveBadge}
        />
      ) : null}
    </Component>
  );
}

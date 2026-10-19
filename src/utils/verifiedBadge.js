/**
 * Whether a user/candidate/author object has an active verified badge subscription.
 */
export function userHasVerifiedBadge(user) {
  if (!user || typeof user !== 'object') return false;
  return Boolean(
    user.hasVerifiedBadge ??
      user.has_verified_badge ??
      user.author_has_verified_badge,
  );
}

export function userIsRecruiter(userOrRole) {
  const role =
    typeof userOrRole === 'string'
      ? userOrRole
      : userOrRole?.role ?? userOrRole?.author_role ?? null;

  const normalized = String(role ?? '').toLowerCase().trim();
  return normalized === 'recruiter' || normalized === 'employer';
}

/**
 * Label for the verified badge pill based on account type.
 * Unknown/missing role must not default to Jobseeker.
 */
export function getVerifiedBadgeLabel(userOrRole) {
  if (userIsRecruiter(userOrRole)) {
    return 'Verified Recruiter';
  }
  const role =
    typeof userOrRole === 'string'
      ? userOrRole
      : userOrRole?.role ?? userOrRole?.author_role ?? null;
  const normalized = String(role ?? '').toLowerCase().trim();
  if (normalized === 'jobseeker') {
    return 'Verified Jobseeker';
  }
  return 'Verified';
}

export function getUnverifiedRecruiterLabel() {
  return 'Unverified';
}

export function userShowsUnverifiedRecruiterPill(user, { forceRecruiter = false } = {}) {
  if (userHasVerifiedBadge(user)) return false;
  return forceRecruiter || userIsRecruiter(user);
}

const BADGE_PAYMENT_MODAL_KEY = "bejiteBadgePaymentModal";

export function stashBadgePaymentModal(kind) {
  if (!kind || typeof window === "undefined") return;
  try {
    sessionStorage.setItem(BADGE_PAYMENT_MODAL_KEY, kind);
  } catch {
    /* ignore */
  }
}

export function readBadgePaymentModalKind() {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("pendingReview") === "1") return "pendingReview";
    if (params.get("paid") === "1") return "activated";
    return sessionStorage.getItem(BADGE_PAYMENT_MODAL_KEY);
  } catch {
    return null;
  }
}

export function clearBadgePaymentModal() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(BADGE_PAYMENT_MODAL_KEY);
  } catch {
    /* ignore */
  }
}

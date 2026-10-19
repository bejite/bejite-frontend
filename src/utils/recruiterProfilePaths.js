/**
 * Resolve recruiter employer type from auth user or localStorage fallback.
 * @param {object | null | undefined} user
 * @returns {'individual' | 'corporate' | null}
 */
export function resolveRecruiterMode(user) {
  let resolved = user;
  if (!resolved?.mode) {
    try {
      resolved = JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      resolved = {};
    }
  }

  const mode = String(resolved?.mode || '').toLowerCase();
  if (mode === 'individual' || mode === 'corporate') return mode;
  // Unknown/missing mode must not default to corporate — that incorrectly
  // switches individual recruiters onto Followers / blocked-Connect paths.
  return null;
}

/**
 * @param {object | null | undefined} user
 * @returns {boolean}
 */
export function isCorporateRecruiter(user) {
  return (
    String(user?.role || '').toLowerCase() === 'recruiter' &&
    resolveRecruiterMode(user) === 'corporate'
  );
}

/**
 * ID upload path used after recruiter verification reject / retry.
 * Unknown mode defaults to individual, matching the backend upload URL.
 * @param {object | null | undefined} user
 * @returns {string}
 */
export function getRecruiterIdUploadPath(user) {
  return resolveRecruiterMode(user) === "corporate"
    ? "/corporate/upload"
    : "/individual/upload";
}

/**
 * Entry path for editing an existing recruiter profile.
 * @param {object | null | undefined} user
 * @returns {string}
 */
export function getRecruiterEditProfilePath(user) {
  if (resolveRecruiterMode(user) === 'individual') {
    return '/edit-profile/individual/basic-details';
  }
  // Corporate and unknown (legacy) recruiters use the corporate edit flow.
  return '/edit-profile/recruiter/basic-details';
}

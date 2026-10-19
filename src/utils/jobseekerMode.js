/**
 * Canonical jobseeker UserProfile.mode values and display labels.
 * Keep aliases in sync with bejite-backend/src/shared/utils/jobseekerMode.js.
 */
export const JOBSEEKER_MODE = {
  ACTIVE: "active_jobseeker",
  FREELANCER: "freelancer",
  INACTIVE: "inactive_jobseeker",
};

const ALIASES = {
  active_member: JOBSEEKER_MODE.ACTIVE,
  active_jobseeker: JOBSEEKER_MODE.ACTIVE,
  active_job_seeker: JOBSEEKER_MODE.ACTIVE,
  freelancer: JOBSEEKER_MODE.FREELANCER,
  inactive_member: JOBSEEKER_MODE.INACTIVE,
  inactive_jobseeker: JOBSEEKER_MODE.INACTIVE,
  inactive_job_seeker: JOBSEEKER_MODE.INACTIVE,
};

export const JOBSEEKER_MODE_SHORT_LABEL = {
  [JOBSEEKER_MODE.ACTIVE]: "ACTIVE",
  [JOBSEEKER_MODE.FREELANCER]: "FREELANCE",
  [JOBSEEKER_MODE.INACTIVE]: "INACTIVE",
};

function modeKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

export function resolveJobseekerStatus(raw) {
  if (raw == null || String(raw).trim() === "") return null;
  return ALIASES[modeKey(raw)] ?? null;
}

export function formatJobseekerModeLabel(raw, fallback = "") {
  const canonical = resolveJobseekerStatus(raw);
  return canonical ? JOBSEEKER_MODE_SHORT_LABEL[canonical] : fallback;
}

export function toJobseekerStatusValue(raw, fallback = JOBSEEKER_MODE.ACTIVE) {
  return resolveJobseekerStatus(raw) || fallback;
}

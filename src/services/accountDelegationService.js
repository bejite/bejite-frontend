import axiosInstance from "../utils/axiosInstance";

export const DELEGATION_PERMISSIONS = [
  {
    id: "jobs_manage",
    label: "Job Postings & Listings",
    description:
      "Create, edit, extend, repost, and manage active job vacancies",
  },
  {
    id: "applications_review",
    label: "Applications & Resume Screening",
    description:
      "Review incoming applications, CVs, and shortlist or decline candidates",
  },
  {
    id: "pipeline_manage",
    label: "Hiring Pipeline & Interview Stages",
    description:
      "Configure interview stages, move candidates, and record stage feedback",
  },
  {
    id: "candidate_outreach",
    label: "Candidate Search & Invitations",
    description:
      "Search the talent directory and send interview invitations",
  },
  {
    id: "messaging_respond",
    label: "Recruitment Messaging",
    description:
      "Read and reply to candidate and hiring inquiries on your behalf",
  },
  {
    id: "content_manage",
    label: "Posts, Pitches & Campaigns",
    description:
      "Publish recruitment posts, 24h pitches, and ad campaign updates",
  },
];

export const ALL_PERMISSION_IDS = DELEGATION_PERMISSIONS.map((p) => p.id);

export const DELEGATION_PRESETS = [
  {
    id: "screening_pipeline",
    label: "Screening & Pipeline",
    permissions: ["applications_review", "pipeline_manage"],
  },
  {
    id: "sourcing_outreach",
    label: "Sourcing & Outreach",
    permissions: ["candidate_outreach", "messaging_respond"],
  },
  {
    id: "core_hiring",
    label: "Core Hiring Workflows",
    permissions: [
      "jobs_manage",
      "applications_review",
      "pipeline_manage",
      "candidate_outreach",
    ],
  },
];

export const DELEGATION_DURATIONS = [
  { id: "until_revoked", label: "Until Revoked", days: null },
  { id: "7d", label: "7 Days", days: 7 },
  { id: "30d", label: "30 Days", days: 30 },
  { id: "90d", label: "90 Days", days: 90 },
  { id: "custom", label: "Custom End Date", days: null },
];

export function isRecruiterAccount(user) {
  if (!user || typeof user !== "object") return false;
  const role = String(user.role || "").trim().toLowerCase();
  if (!role || role === "jobseeker") return false;
  return (
    role === "recruiter" ||
    role === "employer" ||
    role === "corporate_recruiter" ||
    role === "individual_recruiter"
  );
}

export function resolveExpiresAt(durationType, customDate) {
  if (!durationType || durationType === "until_revoked") {
    return null;
  }

  if (durationType === "custom") {
    if (!customDate) return null;
    const parsed = new Date(`${customDate}T23:59:59`);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  const preset = DELEGATION_DURATIONS.find((d) => d.id === durationType);
  if (!preset?.days) return null;

  const target = new Date();
  target.setDate(target.getDate() + preset.days);
  target.setHours(23, 59, 59, 999);
  return target.toISOString();
}

export function computeEffectiveDelegationStatus(delegation) {
  if (!delegation || delegation.status === "revoked") return "revoked";
  if (delegation.status === "pending" || delegation.status === "declined") {
    return delegation.status;
  }
  if (delegation.expiresAt) {
    const expiryMs = new Date(delegation.expiresAt).getTime();
    if (!Number.isNaN(expiryMs) && expiryMs <= Date.now()) {
      return "expired";
    }
  }
  if (delegation.status === "paused") return "paused";
  return "active";
}

export function summarizeDelegations(delegations = []) {
  const list = Array.isArray(delegations)
    ? delegations.filter((d) => d && d.status !== "revoked")
    : [];

  if (list.length === 0) {
    return {
      activeCount: 0,
      totalCount: 0,
      sublabel: "Grant partial or full account access to a trusted recruiter",
    };
  }

  const active = list.filter(
    (d) => computeEffectiveDelegationStatus(d) === "active"
  );
  const paused = list.filter(
    (d) => computeEffectiveDelegationStatus(d) === "paused"
  );
  const pending = list.filter(
    (d) => computeEffectiveDelegationStatus(d) === "pending"
  );
  const pendingSuffix =
    pending.length > 0 ? ` · ${pending.length} awaiting response` : "";

  if (active.length === 1) {
    const item = active[0];
    const recruiterName = item.recruiter?.name || "1 recruiter";
    const levelLabel =
      item.accessLevel === "full" ? "Full Access" : "Partial Access";
    return {
      activeCount: 1,
      totalCount: list.length,
      sublabel: `Assigned to ${recruiterName} (${levelLabel})${pendingSuffix}`,
    };
  }

  if (active.length > 1) {
    return {
      activeCount: active.length,
      totalCount: list.length,
      sublabel: `${active.length} recruiters assigned · Manage partial & full access${pendingSuffix}`,
    };
  }

  if (paused.length > 0) {
    return {
      activeCount: 0,
      totalCount: list.length,
      sublabel: `${paused.length} assigned recruiter${paused.length > 1 ? "s" : ""} paused · Manage access${pendingSuffix}`,
    };
  }

  if (pending.length > 0) {
    return {
      activeCount: 0,
      totalCount: list.length,
      sublabel: `${pending.length} request${pending.length > 1 ? "s" : ""} awaiting the recruiter's response`,
    };
  }

  return {
    activeCount: 0,
    totalCount: list.length,
    sublabel: `${list.length} expired recruiter assignment${list.length > 1 ? "s" : ""} · Review or renew`,
  };
}

function toApiError(error, fallback) {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    (error?.response ? fallback : "Could not reach the server. Check your connection and try again.");
  const wrapped = new Error(message);
  wrapped.status = error?.response?.status;
  wrapped.originalError = error;
  return wrapped;
}

function normalizePermissions(accessLevel, permissions) {
  if (accessLevel === "full") {
    return [...ALL_PERMISSION_IDS];
  }
  const validSet = new Set(ALL_PERMISSION_IDS);
  const filtered = Array.isArray(permissions)
    ? permissions.filter((id) => validSet.has(id))
    : [];
  return Array.from(new Set(filtered));
}

export async function getAccountDelegations() {
  try {
    const response = await axiosInstance.get("/auth/account/delegations");
    const list = response?.data?.delegations;
    return Array.isArray(list) ? list : [];
  } catch (error) {
    throw toApiError(error, "Failed to load current recruiter assignments");
  }
}

export async function getAccountDelegationLogs() {
  try {
    const response = await axiosInstance.get("/auth/account/delegations/logs");
    const logs = response?.data?.logs;
    return Array.isArray(logs) ? logs : [];
  } catch (error) {
    throw toApiError(error, "Failed to load delegation activity");
  }
}

export async function assignAccountToRecruiter({
  recruiter,
  accessLevel = "partial",
  permissions = [],
  durationType = "until_revoked",
  customExpiresAt = "",
  note = "",
}) {
  if (!recruiter?.id) {
    throw new Error("Please select a valid recruiter to assign.");
  }

  const level = accessLevel === "full" ? "full" : "partial";
  const normalizedPermissions = normalizePermissions(level, permissions);

  if (level === "partial" && normalizedPermissions.length === 0) {
    throw new Error(
      "Select at least one permission for a partial account assignment."
    );
  }

  const expiresAt = resolveExpiresAt(durationType, customExpiresAt);
  if (durationType === "custom" && !expiresAt) {
    throw new Error("Please choose a valid custom expiration date.");
  }

  try {
    const response = await axiosInstance.post("/auth/account/delegations", {
      recruiterId: recruiter.id,
      accessLevel: level,
      permissions: normalizedPermissions,
      durationType,
      expiresAt,
      note: String(note || "").trim(),
    });
    return response?.data?.delegation;
  } catch (error) {
    throw toApiError(error, "Could not save recruiter assignment.");
  }
}

export async function updateAccountDelegation(delegationId, updates = {}) {
  if (!delegationId) {
    throw new Error("Missing delegation identifier.");
  }

  const { recruiter: _recruiter, customExpiresAt, ...payload } = updates;
  if (payload.durationType !== undefined) {
    payload.expiresAt = resolveExpiresAt(payload.durationType, customExpiresAt);
    if (payload.durationType === "custom" && !payload.expiresAt) {
      throw new Error("Please choose a valid custom expiration date.");
    }
  }

  try {
    const response = await axiosInstance.patch(
      `/auth/account/delegations/${encodeURIComponent(delegationId)}`,
      payload
    );
    return response?.data?.delegation;
  } catch (error) {
    throw toApiError(error, "Could not update recruiter assignment.");
  }
}

export async function revokeAccountDelegation(delegationId) {
  if (!delegationId) {
    throw new Error("Missing delegation identifier.");
  }

  try {
    await axiosInstance.delete(
      `/auth/account/delegations/${encodeURIComponent(delegationId)}`
    );
    return { success: true };
  } catch (error) {
    throw toApiError(error, "Could not revoke recruiter access.");
  }
}

export const RECRUITER_PAGE_SIZE = 5;

export async function searchDelegationCandidates({
  query = "",
  offset = 0,
  limit = RECRUITER_PAGE_SIZE,
} = {}) {
  try {
    const response = await axiosInstance.get("/auth/account/delegations/candidates", {
      params: { q: query.trim() || undefined, limit, offset },
    });
    const data = response?.data || {};
    return {
      recruiters: Array.isArray(data.recruiters) ? data.recruiters : [],
      hasMore: Boolean(data.hasMore),
      nextOffset: Number(data.nextOffset) || 0,
    };
  } catch (error) {
    throw toApiError(error, "Failed to load recruiters");
  }
}

export async function getReceivedDelegations() {
  try {
    const response = await axiosInstance.get("/auth/account/delegations/received");
    const list = response?.data?.delegations;
    return Array.isArray(list) ? list : [];
  } catch (error) {
    throw toApiError(error, "Failed to load accounts you manage");
  }
}

async function respondToDelegation(delegationId, action, fallback) {
  if (!delegationId) {
    throw new Error("Missing delegation identifier.");
  }

  try {
    const response = await axiosInstance.post(
      `/auth/account/delegations/received/${encodeURIComponent(delegationId)}/${action}`
    );
    return response?.data?.delegation;
  } catch (error) {
    throw toApiError(error, fallback);
  }
}

export const acceptDelegation = (delegationId) =>
  respondToDelegation(delegationId, "accept", "Could not accept the request.");

export const declineDelegation = (delegationId) =>
  respondToDelegation(delegationId, "decline", "Could not decline the request.");

export const leaveDelegation = (delegationId) =>
  respondToDelegation(delegationId, "leave", "Could not leave this account.");

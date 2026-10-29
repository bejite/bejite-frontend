import axiosInstance from "../utils/axiosInstance";
import { getUser } from "../utils/tokenManager";

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

const STORAGE_PREFIX = "bejite:account-delegations";
const LOG_STORAGE_PREFIX = "bejite:account-delegation-logs";

let delegationApiUnsupported = false;

function resolveOwnerScopeKey() {
  const user = getUser();
  const id = String(user?.id || user?._id || user?.email || "default")
    .trim()
    .toLowerCase();
  return id || "default";
}

function getDelegationStorageKey() {
  return `${STORAGE_PREFIX}:${resolveOwnerScopeKey()}`;
}

function getDelegationLogStorageKey() {
  return `${LOG_STORAGE_PREFIX}:${resolveOwnerScopeKey()}`;
}

function readLocalDelegations() {
  try {
    const raw = localStorage.getItem(getDelegationStorageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalDelegations(list) {
  try {
    localStorage.setItem(getDelegationStorageKey(), JSON.stringify(list));
  } catch {
    // Ignore storage quota errors
  }
}

function readLocalDelegationLogs() {
  try {
    const raw = localStorage.getItem(getDelegationLogStorageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function appendLocalDelegationLog(entry) {
  try {
    const existing = readLocalDelegationLogs();
    const record = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    const updated = [record, ...existing].slice(0, 40);
    localStorage.setItem(getDelegationLogStorageKey(), JSON.stringify(updated));
    return record;
  } catch {
    return null;
  }
}

function isUnsupportedEndpointError(error) {
  const status = error?.response?.status;
  if (status === 404 || status === 405 || status === 501) {
    delegationApiUnsupported = true;
    return true;
  }
  if (!error?.response) {
    return true;
  }
  return false;
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

  if (active.length === 1) {
    const item = active[0];
    const recruiterName = item.recruiter?.name || "1 recruiter";
    const levelLabel =
      item.accessLevel === "full" ? "Full Assignment" : "Partial Assignment";
    return {
      activeCount: 1,
      totalCount: list.length,
      sublabel: `Assigned to ${recruiterName} (${levelLabel})`,
    };
  }

  if (active.length > 1) {
    return {
      activeCount: active.length,
      totalCount: list.length,
      sublabel: `${active.length} recruiters assigned · Manage partial & full access`,
    };
  }

  if (paused.length > 0) {
    return {
      activeCount: 0,
      totalCount: list.length,
      sublabel: `${paused.length} assigned recruiter${paused.length > 1 ? "s" : ""} paused · Manage access`,
    };
  }

  return {
    activeCount: 0,
    totalCount: list.length,
    sublabel: `${list.length} expired recruiter assignment${list.length > 1 ? "s" : ""} · Review or renew`,
  };
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

function sanitizeRecruiterSnapshot(recruiter) {
  if (!recruiter || typeof recruiter !== "object") return null;
  return {
    id: recruiter.id,
    name: recruiter.name || "Recruiter",
    firstName: recruiter.firstName || "",
    lastName: recruiter.lastName || "",
    email: recruiter.email || "",
    role: recruiter.role || "recruiter",
    jobTitle: recruiter.jobTitle || "Recruiter",
    companyName: recruiter.companyName || "",
    profilePhoto: recruiter.profilePhoto || null,
    hasVerifiedBadge: Boolean(recruiter.hasVerifiedBadge),
    isCorporate: Boolean(recruiter.isCorporate),
  };
}

export async function getAccountDelegations() {
  if (!delegationApiUnsupported) {
    try {
      const response = await axiosInstance.get("/auth/account/delegations");
      const list =
        response?.data?.delegations || response?.data?.data || response?.data;
      if (Array.isArray(list)) {
        writeLocalDelegations(list);
        return list;
      }
    } catch (error) {
      if (!isUnsupportedEndpointError(error)) {
        throw error;
      }
    }
  }

  return readLocalDelegations();
}

export async function getAccountDelegationLogs() {
  if (!delegationApiUnsupported) {
    try {
      const response = await axiosInstance.get(
        "/auth/account/delegations/logs"
      );
      const logs =
        response?.data?.logs || response?.data?.data || response?.data;
      if (Array.isArray(logs)) {
        return logs;
      }
    } catch (error) {
      if (!isUnsupportedEndpointError(error)) {
        throw error;
      }
    }
  }

  return readLocalDelegationLogs();
}

export async function assignAccountToRecruiter({
  recruiter,
  accessLevel = "partial",
  permissions = [],
  durationType = "until_revoked",
  customExpiresAt = "",
  note = "",
}) {
  const recruiterSnapshot = sanitizeRecruiterSnapshot(recruiter);
  if (!recruiterSnapshot?.id) {
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

  const payload = {
    recruiterId: recruiterSnapshot.id,
    recruiter: recruiterSnapshot,
    accessLevel: level,
    permissions: normalizedPermissions,
    durationType,
    expiresAt,
    note: String(note || "").trim(),
  };

  if (!delegationApiUnsupported) {
    try {
      const response = await axiosInstance.post(
        "/auth/account/delegations",
        payload
      );
      const saved =
        response?.data?.delegation || response?.data?.data || response?.data;
      if (saved && typeof saved === "object") {
        return saved;
      }
    } catch (error) {
      if (!isUnsupportedEndpointError(error)) {
        throw error;
      }
    }
  }

  const existing = readLocalDelegations();
  const nowIso = new Date().toISOString();
  const recruiterKey = String(recruiterSnapshot.id).trim().toLowerCase();
  const matchIdx = existing.findIndex(
    (d) =>
      String(d?.recruiter?.id || d?.recruiterId || "")
        .trim()
        .toLowerCase() === recruiterKey
  );

  let record;
  let updatedList;

  if (matchIdx >= 0) {
    record = {
      ...existing[matchIdx],
      recruiterId: recruiterSnapshot.id,
      recruiter: recruiterSnapshot,
      accessLevel: level,
      permissions: normalizedPermissions,
      durationType,
      expiresAt,
      note: payload.note,
      status: "active",
      updatedAt: nowIso,
    };
    updatedList = [...existing];
    updatedList[matchIdx] = record;
  } else {
    record = {
      id: `del_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      recruiterId: recruiterSnapshot.id,
      recruiter: recruiterSnapshot,
      accessLevel: level,
      permissions: normalizedPermissions,
      durationType,
      expiresAt,
      note: payload.note,
      status: "active",
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    updatedList = [record, ...existing];
  }

  writeLocalDelegations(updatedList);
  appendLocalDelegationLog({
    action: matchIdx >= 0 ? "updated" : "assigned",
    recruiterName: recruiterSnapshot.name,
    recruiterEmail: recruiterSnapshot.email,
    accessLevel: level,
    permissionCount: normalizedPermissions.length,
    summary:
      level === "full"
        ? `Granted Full Assignment to ${recruiterSnapshot.name}`
        : `Granted Partial Assignment (${normalizedPermissions.length} permission${normalizedPermissions.length === 1 ? "" : "s"}) to ${recruiterSnapshot.name}`,
  });

  return record;
}

export async function updateAccountDelegation(delegationId, updates = {}) {
  if (!delegationId) {
    throw new Error("Missing delegation identifier.");
  }

  if (!delegationApiUnsupported) {
    try {
      const response = await axiosInstance.patch(
        `/auth/account/delegations/${encodeURIComponent(delegationId)}`,
        updates
      );
      const saved =
        response?.data?.delegation || response?.data?.data || response?.data;
      if (saved && typeof saved === "object") {
        return saved;
      }
    } catch (error) {
      if (!isUnsupportedEndpointError(error)) {
        throw error;
      }
    }
  }

  const existing = readLocalDelegations();
  const idx = existing.findIndex((item) => item.id === delegationId);
  if (idx === -1) {
    throw new Error("Assigned recruiter record was not found.");
  }

  const current = existing[idx];
  const nextLevel =
    updates.accessLevel === "full"
      ? "full"
      : updates.accessLevel === "partial"
        ? "partial"
        : current.accessLevel;
  const nextPermissions =
    updates.permissions !== undefined || updates.accessLevel !== undefined
      ? normalizePermissions(
          nextLevel,
          updates.permissions ?? current.permissions
        )
      : current.permissions;

  if (nextLevel === "partial" && nextPermissions.length === 0) {
    throw new Error(
      "Select at least one permission for a partial account assignment."
    );
  }

  const nextDurationType = updates.durationType ?? current.durationType;
  const nextExpiresAt =
    updates.durationType !== undefined || updates.customExpiresAt !== undefined
      ? resolveExpiresAt(nextDurationType, updates.customExpiresAt)
      : updates.expiresAt !== undefined
        ? updates.expiresAt
        : current.expiresAt;

  if (nextDurationType === "custom" && !nextExpiresAt) {
    throw new Error("Please choose a valid custom expiration date.");
  }

  const nextStatus = updates.status ?? current.status;
  const updatedRecord = {
    ...current,
    ...(updates.recruiter
      ? { recruiter: sanitizeRecruiterSnapshot(updates.recruiter) }
      : {}),
    accessLevel: nextLevel,
    permissions: nextPermissions,
    durationType: nextDurationType,
    expiresAt: nextExpiresAt,
    note:
      updates.note !== undefined ? String(updates.note || "").trim() : current.note,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };

  const nextList = [...existing];
  nextList[idx] = updatedRecord;
  writeLocalDelegations(nextList);

  const recruiterName = updatedRecord.recruiter?.name || "Recruiter";
  let summary = `Updated access settings for ${recruiterName}`;
  let action = "updated";
  if (updates.status && updates.status !== current.status) {
    if (updates.status === "paused") {
      action = "paused";
      summary = `Paused account access for ${recruiterName}`;
    } else if (updates.status === "active") {
      action = "resumed";
      summary = `Resumed account access for ${recruiterName}`;
    }
  } else if (
    updates.accessLevel !== undefined ||
    updates.permissions !== undefined
  ) {
    summary =
      nextLevel === "full"
        ? `Updated ${recruiterName} to Full Assignment`
        : `Updated ${recruiterName} to Partial Assignment (${nextPermissions.length} permission${nextPermissions.length === 1 ? "" : "s"})`;
  }

  appendLocalDelegationLog({
    action,
    recruiterName,
    recruiterEmail: updatedRecord.recruiter?.email || "",
    accessLevel: nextLevel,
    permissionCount: nextPermissions.length,
    summary,
  });

  return updatedRecord;
}

export async function revokeAccountDelegation(delegationId) {
  if (!delegationId) {
    throw new Error("Missing delegation identifier.");
  }

  if (!delegationApiUnsupported) {
    try {
      await axiosInstance.delete(
        `/auth/account/delegations/${encodeURIComponent(delegationId)}`
      );
      return { success: true };
    } catch (error) {
      if (!isUnsupportedEndpointError(error)) {
        throw error;
      }
    }
  }

  const existing = readLocalDelegations();
  const target = existing.find((item) => item.id === delegationId);
  const filtered = existing.filter((item) => item.id !== delegationId);
  writeLocalDelegations(filtered);

  if (target) {
    const recruiterName = target.recruiter?.name || "Recruiter";
    appendLocalDelegationLog({
      action: "revoked",
      recruiterName,
      recruiterEmail: target.recruiter?.email || "",
      accessLevel: target.accessLevel,
      permissionCount: Array.isArray(target.permissions)
        ? target.permissions.length
        : 0,
      summary: `Revoked ${target.accessLevel === "full" ? "Full" : "Partial"} Assignment from ${recruiterName}`,
    });
  }

  return { success: true };
}


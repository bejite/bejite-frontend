import { create } from "zustand";
import { getUser } from "../utils/tokenManager";

const STORAGE_KEY = "bejite_applied_jobs_v1";

export const resolveAppliedJobsUserScope = (explicitUserKey = null) => {
  if (explicitUserKey !== null && explicitUserKey !== undefined && String(explicitUserKey).trim()) {
    return `user:${String(explicitUserKey).trim().toLowerCase()}`;
  }
  const user = getUser();
  const identity = user?.id ?? user?.userId ?? user?.sub ?? user?.email ?? null;
  if (identity !== null && identity !== undefined && String(identity).trim()) {
    return `user:${String(identity).trim().toLowerCase()}`;
  }
  return "guest";
};

const readStoredMap = () => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
};

const writeStoredMap = (map) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage quota or private-mode errors safely.
  }
};

export const hasServerAppliedFlag = (job) => {
  if (!job || typeof job !== "object") return false;
  if (
    job.hasApplied === true ||
    job.has_applied === true ||
    job.applied === true ||
    job.isApplied === true ||
    job.alreadyApplied === true ||
    job.userHasApplied === true ||
    job.user_has_applied === true
  ) {
    return true;
  }
  if (
    job.userApplication &&
    typeof job.userApplication === "object"
  ) {
    return true;
  }
  if (
    typeof job.applicationStatus === "string" &&
    job.applicationStatus.trim().length > 0
  ) {
    return true;
  }
  return false;
};

export const isAlreadyAppliedError = (error) => {
  const status = error?.response?.status;
  const message = String(
    error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "",
  ).toLowerCase();
  return (
    status === 409 ||
    /already\s+applied|duplicate\s+application|previously\s+applied/.test(message)
  );
};

const normalizeJobId = (jobOrId) => {
  const raw =
    jobOrId && typeof jobOrId === "object" ? jobOrId.id ?? jobOrId.jobId : jobOrId;
  if (raw === null || raw === undefined) return "";
  return String(raw).trim();
};

export const useAppliedJobsStore = create((set, get) => ({
  appliedByScope: readStoredMap(),

  markJobApplied: (jobOrId, metadata = {}, userKey = null) => {
    const jobId = normalizeJobId(jobOrId);
    if (!jobId) return;

    const scope = resolveAppliedJobsUserScope(userKey);
    const current = get().appliedByScope;
    const scopeRecords = current[scope] || {};
    const existing = scopeRecords[jobId];

    const nextRecord = {
      appliedAt: existing?.appliedAt || metadata?.appliedAt || new Date().toISOString(),
      ...(metadata?.applicationMethod
        ? { applicationMethod: metadata.applicationMethod }
        : existing?.applicationMethod
          ? { applicationMethod: existing.applicationMethod }
          : {}),
    };

    const next = {
      ...current,
      [scope]: {
        ...scopeRecords,
        [jobId]: nextRecord,
      },
    };

    writeStoredMap(next);
    set({ appliedByScope: next });
  },

  syncAppliedJobsFromList: (jobs, userKey = null) => {
    if (!Array.isArray(jobs) || jobs.length === 0) return;

    const appliedIds = jobs
      .filter((job) => hasServerAppliedFlag(job))
      .map((job) => normalizeJobId(job))
      .filter(Boolean);

    if (appliedIds.length === 0) return;

    const scope = resolveAppliedJobsUserScope(userKey);
    const current = get().appliedByScope;
    const scopeRecords = current[scope] || {};
    let changed = false;
    const updatedScopeRecords = { ...scopeRecords };

    for (const jobId of appliedIds) {
      if (!updatedScopeRecords[jobId]) {
        updatedScopeRecords[jobId] = {
          appliedAt: new Date().toISOString(),
        };
        changed = true;
      }
    }

    if (!changed) return;

    const next = {
      ...current,
      [scope]: updatedScopeRecords,
    };

    writeStoredMap(next);
    set({ appliedByScope: next });
  },

  hydrateFromStorage: () => {
    set({ appliedByScope: readStoredMap() });
  },
}));

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      useAppliedJobsStore.getState().hydrateFromStorage();
    }
  });
}

export const useIsJobApplied = (jobOrId, userKey = null) => {
  const jobId = normalizeJobId(jobOrId);
  const scope = resolveAppliedJobsUserScope(userKey);
  const storedRecord = useAppliedJobsStore((state) =>
    jobId ? state.appliedByScope[scope]?.[jobId] : undefined,
  );
  return Boolean(storedRecord) || hasServerAppliedFlag(jobOrId);
};

export const useAppliedJobRecord = (jobOrId, userKey = null) => {
  const jobId = normalizeJobId(jobOrId);
  const scope = resolveAppliedJobsUserScope(userKey);
  return useAppliedJobsStore((state) =>
    jobId ? state.appliedByScope[scope]?.[jobId] || null : null,
  );
};


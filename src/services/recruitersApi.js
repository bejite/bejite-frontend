import axiosInstance from "../utils/axiosInstance";
import axiosPublic from "./axiosPublic";
import { getUser } from "../utils/tokenManager";
import { filterAdminUsersFromSearch } from "../utils/filterAdminUsers";
import { formatDisplayPersonName } from "../utils/personDisplayName";

/**
 * Normalizes a raw user object into a standardized recruiter profile.
 */
function normalizeRecruiter(user) {
  if (!user || typeof user !== "object") return null;

  const firstName = user.firstName ?? user.first_name ?? "";
  const lastName = user.lastName ?? user.last_name ?? "";
  const fallbackName =
    `${firstName} ${lastName}`.trim() ||
    user.username ||
    user.email ||
    "Recruiter";
  const name = formatDisplayPersonName(user, fallbackName);

  const jobTitle =
    user.jobTitle ||
    user.job_title ||
    user.companyName ||
    user.company ||
    (user.role === "recruiter" ? "Recruiter" : user.role || "Recruiter");

  const companyName = user.companyName || user.company || "";

  const profilePhoto =
    user.profilePhoto ||
    user.profile_photo ||
    user.image ||
    user.avatar ||
    user.author_profile_photo ||
    null;

  const userId = user.id ?? user._id ?? null;

  return {
    id: userId ?? `${name}-${user.email || Math.random()}`,
    userId: userId != null ? String(userId) : null,
    name,
    firstName,
    lastName,
    email: user.email || "",
    role: user.role || "recruiter",
    jobTitle,
    companyName,
    profilePhoto,
    hasVerifiedBadge: Boolean(user.hasVerifiedBadge),
    isCorporate: Boolean(user.isCorporate || user.mode === "corporate"),
  };
}

function isRecruiterEligibleUser(user) {
  if (!user || typeof user !== "object") return false;
  if (user._fromRecruiterDiscovery) return true;
  const role = String(user.role || "").trim().toLowerCase();
  if (role === "jobseeker") return false;
  if (
    role === "recruiter" ||
    role === "employer" ||
    user.isCorporate ||
    user.mode === "corporate"
  ) {
    return true;
  }
  return !role;
}

/**
 * Fetches real recruiters from the backend API.
 * Uses available endpoints (recruiter discovery and connection discovery).
 * Excludes the currently authenticated user and non-recruiter accounts.
 * Strict: No dummy data or fake fallbacks.
 */
export async function fetchRecruiters({ query = "", limit = 50, offset = 0 } = {}) {
  const currentUser = getUser();
  const currentUserId = String(currentUser?.id || currentUser?._id || "").trim().toLowerCase();
  const currentUserEmail = String(currentUser?.email || "").trim().toLowerCase();
  const email = currentUser?.email;
  const collected = [];
  const errors = [];

  // 1. Query dedicated recruiter discovery endpoint if user email is present
  if (email) {
    try {
      const response = await axiosPublic.get("/auth/signup/discover-recruiters", {
        params: { email, limit, offset },
      });
      const list = response?.data?.users || response?.data?.data || response?.data || [];
      if (Array.isArray(list)) {
        collected.push(
          ...list.map((u) => (u && typeof u === "object" ? { ...u, _fromRecruiterDiscovery: true } : u))
        );
      }
    } catch (err) {
      errors.push(err);
    }
  }

  // 2. If a search query is provided, query connection search
  if (query && query.trim()) {
    try {
      const response = await axiosInstance.get("/api/connections/search", {
        params: { q: query.trim(), limit, offset },
      });
      const list = response?.data?.users || response?.data?.data || response?.data || [];
      if (Array.isArray(list)) {
        collected.push(...list);
      }
    } catch (err) {
      errors.push(err);
    }
  }

  // 3. Query platform discoverable users
  try {
    const response = await axiosInstance.get("/api/connections/discover", {
      params: { limit, offset, _t: Date.now() },
    });
    const list = response?.data?.users || response?.data?.data || response?.data || [];
    if (Array.isArray(list)) {
      collected.push(...list);
    }
  } catch (err) {
    errors.push(err);
  }

  // 4. Query user's accepted connections
  try {
    const response = await axiosInstance.get("/api/connections", {
      params: { page: 1, limit, ...(query ? { q: query.trim() } : {}) },
    });
    const connections = response?.data?.connections || [];
    if (Array.isArray(connections)) {
      const users = connections.map((c) => c.user).filter(Boolean);
      collected.push(...users);
    }
  } catch (err) {
    errors.push(err);
  }

  if (collected.length === 0 && errors.length > 0 && errors.every((e) => e?.response?.status >= 400)) {
    const lastError = errors[0];
    const message =
      lastError?.response?.data?.message ||
      lastError?.response?.data?.error ||
      lastError?.message ||
      "Failed to load recruiters from API";
    const errorObj = new Error(message);
    errorObj.originalError = lastError;
    throw errorObj;
  }

  // Deduplicate by user ID/email, exclude self, and keep recruiter-eligible profiles
  const seenIds = new Set();
  const uniqueUsers = [];
  for (const user of collected) {
    if (!isRecruiterEligibleUser(user)) continue;
    const rawId = String(user.id || user._id || "").trim().toLowerCase();
    const rawEmail = String(user.email || "").trim().toLowerCase();
    if (currentUserId && rawId && rawId === currentUserId) continue;
    if (currentUserEmail && rawEmail && rawEmail === currentUserEmail) continue;

    const key = rawId || rawEmail;
    if (key && !seenIds.has(key)) {
      seenIds.add(key);
      uniqueUsers.push(user);
    }
  }

  const nonAdmin = filterAdminUsersFromSearch(uniqueUsers);
  const normalized = nonAdmin.map(normalizeRecruiter).filter(Boolean);

  if (query && query.trim()) {
    const qLower = query.trim().toLowerCase();
    return normalized.filter((r) => {
      const nameMatch = r.name.toLowerCase().includes(qLower);
      const emailMatch = r.email.toLowerCase().includes(qLower);
      const titleMatch = r.jobTitle.toLowerCase().includes(qLower);
      const companyMatch = r.companyName.toLowerCase().includes(qLower);
      return nameMatch || emailMatch || titleMatch || companyMatch;
    });
  }

  return normalized;
}

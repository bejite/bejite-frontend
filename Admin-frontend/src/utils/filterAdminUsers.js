/**
 * Client-side guard: hide platform admin accounts from search UIs.
 * Works even when the API has not been redeployed yet.
 */
const ADMIN_EMAIL_MARKERS = ["@admin.bejite.local", "@admin.bejite", "super_admin@"];

function stringContainsAdminMarker(value) {
  if (value == null) return false;
  const text = String(value).trim().toLowerCase();
  if (!text) return false;
  return ADMIN_EMAIL_MARKERS.some((marker) => text.includes(marker));
}

function resolvePlatformEmail(user) {
  if (!user || typeof user !== "object") return "";

  const direct = String(user.email ?? user.Email ?? "").trim().toLowerCase();
  if (direct) return direct;

  const username = String(user.username ?? user.Username ?? "").trim().toLowerCase();
  if (username) return `${username}@admin.bejite.local`;

  return "";
}

function objectContainsAdminMarker(value, depth = 0) {
  if (depth > 4 || value == null) return false;

  if (typeof value === "string") {
    return stringContainsAdminMarker(value);
  }

  if (Array.isArray(value)) {
    return value.some((entry) => objectContainsAdminMarker(entry, depth + 1));
  }

  if (typeof value === "object") {
    return Object.values(value).some((entry) =>
      objectContainsAdminMarker(entry, depth + 1),
    );
  }

  return false;
}

export function isPlatformAdminUser(user) {
  if (!user || typeof user !== "object") return false;

  if (user.is_admin === true || user.isAdmin === true) return true;

  const role = String(user.role || "").trim().toLowerCase();
  if (role === "admin") return true;

  const email = resolvePlatformEmail(user);
  if (stringContainsAdminMarker(email)) return true;

  const name = [
    user.firstName,
    user.first_name,
    user.lastName,
    user.last_name,
    user.name,
    user.nickname,
    user.title,
    user.jobTitle,
    user.job_title,
  ]
    .filter(Boolean)
    .join(" ");

  if (stringContainsAdminMarker(name)) return true;

  return objectContainsAdminMarker(user);
}

export function isPlatformAdminSearchResult(result) {
  if (!result || typeof result !== "object") return false;
  if (isPlatformAdminUser(result)) return true;

  if (stringContainsAdminMarker(result.name)) return true;
  if (stringContainsAdminMarker(result.subtitle)) return true;

  return false;
}

export function filterAdminUsersFromSearch(users) {
  if (!Array.isArray(users)) return [];
  return users.filter((user) => !isPlatformAdminUser(user));
}

export function filterAdminSearchResults(results) {
  if (!Array.isArray(results)) return [];
  return results.filter((result) => !isPlatformAdminSearchResult(result));
}

export const ADMIN_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  ACCOUNT: "account",
};

export const ADMIN_ROLE_LABELS = {
  [ADMIN_ROLES.SUPER_ADMIN]: "Super Admin",
  [ADMIN_ROLES.ADMIN]: "Admin",
  [ADMIN_ROLES.ACCOUNT]: "Account",
};

/** Paths each role may open (super_admin has all). */
const ROLE_ALLOWED_PATHS = {
  [ADMIN_ROLES.SUPER_ADMIN]: [
    "/admin/dashboard",
    "/admin/demographics",
    "/admin/engagement",
    "/admin/recruitment",
    "/admin/revenue",
    "/admin/users",
    "/admin/admins",
    "/admin/jobs",
    "/admin/adpro",
    "/admin/email-outreach",
    "/admin/events",
    "/admin/notifications",
  ],
  [ADMIN_ROLES.ADMIN]: [
    "/admin/dashboard",
    "/admin/demographics",
    "/admin/engagement",
    "/admin/recruitment",
    "/admin/adpro",
    "/admin/email-outreach",
    "/admin/events",
    "/admin/notifications",
  ],
  [ADMIN_ROLES.ACCOUNT]: ["/admin/revenue", "/admin/notifications"],
};

export function normalizeAdminRole(role) {
  if (!role || typeof role !== "string") return null;
  const value = role.trim().toLowerCase();
  return Object.values(ADMIN_ROLES).includes(value) ? value : null;
}

export function getAllowedNavPaths(role) {
  const normalized = normalizeAdminRole(role) || ADMIN_ROLES.ADMIN;
  return ROLE_ALLOWED_PATHS[normalized] || ROLE_ALLOWED_PATHS[ADMIN_ROLES.ADMIN];
}

export function canAccessPath(role, path) {
  if (!path) return false;
  const allowed = getAllowedNavPaths(role);
  const normalizedPath = path.split("?")[0].replace(/\/+$/, "") || path;
  return allowed.some(
    (allowedPath) =>
      normalizedPath === allowedPath ||
      normalizedPath.startsWith(`${allowedPath}/`),
  );
}

export function getDefaultAdminPath(role) {
  const normalized = normalizeAdminRole(role);
  if (normalized === ADMIN_ROLES.ACCOUNT) return "/admin/revenue";
  return "/admin/dashboard";
}

export function getAdminRoleLabel(role) {
  const normalized = normalizeAdminRole(role);
  return ADMIN_ROLE_LABELS[normalized] || "Administrator";
}

import axiosInstance from "../utils/axiosInstance";

export function getViewerTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function milestoneJobSubtitle(person) {
  const title = String(person?.jobTitle || "").trim();
  if (title) return title;
  const role = String(person?.role || "").trim();
  if (!role) return "Professional";
  const accountRoles = new Set(["jobseeker", "recruiter", "employer"]);
  if (accountRoles.has(role.toLowerCase())) return "Professional";
  return role;
}

/**
 * Connection birthdays for /milestones (today, upcoming 14 days, recent 7 days).
 */
export const getMilestones = async ({ timeZone, signal } = {}) => {
  const response = await axiosInstance.get("/api/milestones", {
    params: { timeZone: timeZone || getViewerTimeZone() },
    signal,
  });
  return response.data;
};

/**
 * Send a birthday wish to a connection.
 * @param {string} userId
 * @param {string} [message]
 * @param {string} [timeZone]
 */
export const sendBirthdayWish = async (userId, message, timeZone) => {
  const response = await axiosInstance.post(
    `/api/milestones/${encodeURIComponent(String(userId))}/wish`,
    {
      ...(message ? { message } : {}),
      timeZone: timeZone || getViewerTimeZone(),
    },
  );
  return response.data;
};

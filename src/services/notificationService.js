import axiosInstance from "../utils/axiosInstance";
import { notifyNotificationsUnreadUpdated } from "../utils/headerBadgeEvents";

function buildTypesQuery(types) {
  const params = new URLSearchParams();
  if (Array.isArray(types) && types.length > 0) {
    params.set("types", types.join(","));
  } else if (typeof types === "string" && types.trim()) {
    params.set("types", types.trim());
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchNotifications({ page = 1, limit = 20, unreadOnly = false } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (unreadOnly) params.set("unread_only", "true");

  const { data } = await axiosInstance.get(`/api/notifications?${params}`);
  return data;
}

export async function fetchUnreadNotificationCount({ types } = {}) {
  const { data } = await axiosInstance.get(
    `/api/notifications/unread-count${buildTypesQuery(types)}`,
  );
  return Number(data?.unread_count) || 0;
}

export async function markNotificationRead(notificationId) {
  const { data } = await axiosInstance.put(
    `/api/notifications/${notificationId}/read`,
  );
  notifyNotificationsUnreadUpdated({ notificationId });
  return data;
}

export async function markAllNotificationsRead({ types } = {}) {
  const { data } = await axiosInstance.put(
    `/api/notifications/read-all${buildTypesQuery(types)}`,
  );
  notifyNotificationsUnreadUpdated(
    types ? { clearedTypes: types } : { clearedAll: true },
  );
  return data;
}

export async function fetchNotificationPreferences() {
  const { data } = await axiosInstance.get("/api/notifications/preferences");
  return data;
}

export async function updateNotificationPreferences(body) {
  const { data } = await axiosInstance.patch(
    "/api/notifications/preferences",
    body,
  );
  return data;
}

export function formatNotificationTime(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

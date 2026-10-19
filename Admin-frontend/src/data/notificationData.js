/**
 * Shared notification helpers for the Admin Notification Center.
 * Live items come from GET /api/admin/data/inbox.
 */

export const NOTIFICATION_CATEGORIES = {
  USERS: "users",
  ADPRO: "adpro",
  SUPPORT: "support",
};

export const NOTIFICATION_PRIORITIES = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  CRITICAL: "critical",
};

const CATEGORY_META = {
  [NOTIFICATION_CATEGORIES.USERS]: {
    label: "Verification",
    color: "#3b82f6",
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-400",
  },
  [NOTIFICATION_CATEGORIES.ADPRO]: {
    label: "AdPro",
    color: "#8b5cf6",
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-400",
  },
  [NOTIFICATION_CATEGORIES.SUPPORT]: {
    label: "Support",
    color: "#16730F",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-400",
  },
};

export function getCategoryMeta(category) {
  return (
    CATEGORY_META[category] || {
      label: "Other",
      color: "#6b7280",
      bg: "bg-gray-50",
      text: "text-gray-600",
      border: "border-gray-400",
    }
  );
}

const PRIORITY_META = {
  [NOTIFICATION_PRIORITIES.INFO]: {
    label: "Info",
    accent: "#3b82f6",
    accentClass: "border-l-blue-500",
  },
  [NOTIFICATION_PRIORITIES.SUCCESS]: {
    label: "Success",
    accent: "#16730F",
    accentClass: "border-l-green-600",
  },
  [NOTIFICATION_PRIORITIES.WARNING]: {
    label: "Warning",
    accent: "#f59e0b",
    accentClass: "border-l-amber-500",
  },
  [NOTIFICATION_PRIORITIES.CRITICAL]: {
    label: "Critical",
    accent: "#ef4444",
    accentClass: "border-l-red-500",
  },
};

export function getPriorityMeta(priority) {
  return (
    PRIORITY_META[priority] || PRIORITY_META[NOTIFICATION_PRIORITIES.INFO]
  );
}

export function relativeTime(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatFullDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  formatNotificationTime,
  markNotificationRead,
} from "../../services/notificationService";
import { getPostDetailPath } from "../../utils/postNavigation";
import { trackPartnerEventClick } from "../../services/verifiedBadgeApi";
import { getPartnerEventIdFromNotification } from "../../utils/partnerEventClick";
import {
  getPortaledMenuStyle,
  usePortaledMenu,
} from "../../hooks/usePortaledMenu";
import { getUser } from "../../utils/tokenManager";
import { getRecruiterIdUploadPath } from "../../utils/recruiterProfilePaths";
import { classifyNavigationTarget } from "../../utils/safeNavigate";

function normalizeNotificationPath(path) {
  if (!path || typeof path !== "string") return path;

  try {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      const url = new URL(path);
      if (url.pathname === "/messages" || url.pathname.startsWith("/messages/")) {
        url.pathname = url.pathname.replace(/^\/messages/, "/chats");
        return `${url.pathname}${url.search}${url.hash}`;
      }
      return path;
    }

    if (path === "/messages" || path.startsWith("/messages?") || path.startsWith("/messages/")) {
      return path.replace(/^\/messages/, "/chats");
    }
  } catch {
    /* keep original path */
  }

  return path;
}

function resolveNotificationLink(notification) {
  if (notification?.link) return normalizeNotificationPath(notification.link);

  let data = notification?.data;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      data = null;
    }
  }

  if (data?.postId) return getPostDetailPath(data.postId);
  if (data?.conversationId) {
    return `/chats?conversation=${encodeURIComponent(data.conversationId)}`;
  }
  if (data?.jobId) {
    return `/job-vacancy?jobId=${encodeURIComponent(data.jobId)}`;
  }
  if (notification?.type === "birthday") {
    return "/milestones";
  }
  if (notification?.type === "birthday_wish") {
    const senderId = data?.fromUserId || data?.userId;
    if (senderId) return `/user-profile/${encodeURIComponent(String(senderId))}`;
    return "/milestones";
  }
  if (notification?.type === "badge_approved") {
    return "/badge-holder";
  }
  if (notification?.type === "badge_rejected") {
    return getRecruiterIdUploadPath(getUser());
  }
  return "/notifications";
}

export default function NotificationDropdown({
  unreadCount = 0,
  onUnreadChange,
  onNavigate,
  variant = "default",
  isActive = false,
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { triggerRef, menuRef, menuPos } = usePortaledMenu({
    isOpen: open,
    onClose: () => setOpen(false),
    minWidth: 288,
    maxHeight: 400,
  });

  const loadPreview = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchNotifications({ page: 1, limit: 8 });
      setItems(result?.data || []);
      if (typeof onUnreadChange === "function") {
        onUnreadChange(result?.unread_count ?? unreadCount);
      }
    } catch (err) {
      console.error("NotificationDropdown load:", err);
    } finally {
      setLoading(false);
    }
  }, [onUnreadChange, unreadCount]);

  useEffect(() => {
    if (open) loadPreview();
  }, [open, loadPreview]);

  const handleItemClick = (notification) => {
    if (!notification?.is_read) {
      void markNotificationRead(notification.id)
        .then(() => {
          if (typeof onUnreadChange === "function") {
            onUnreadChange(Math.max(0, unreadCount - 1));
          }
        })
        .catch(() => {
          /* ignore */
        });
    }

    const eventId = getPartnerEventIdFromNotification(notification);
    if (eventId) {
      void trackPartnerEventClick(eventId).catch(() => {
        /* ignore analytics failures */
      });
    }

    setOpen(false);
    const path = resolveNotificationLink(notification);
    const target = classifyNavigationTarget(path);
    if (target.kind === "internal") {
      navigate(target.path);
    } else if (target.kind === "external") {
      window.location.href = target.url;
    }
    onNavigate?.();
  };

  const isHeader = variant === "header";
  const badge =
    unreadCount > 0 ? (
      <span
        className={
          isHeader
            ? "absolute -top-1.5 -right-1.5 z-10 bg-red-500 text-white font-bold rounded-full inline-flex items-center justify-center leading-none shadow-sm h-5 min-w-5 px-1 text-[10px]"
            : "absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#16730F] text-white text-[10px] font-bold"
        }
      >
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    ) : null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={
          isHeader
            ? `relative flex h-7 w-7 lg:h-8 lg:w-8 shrink-0 items-center justify-center rounded-full cursor-pointer ${
                isActive || open ? "bg-[#1A3E32]/10" : ""
              }`
            : "relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        }
        aria-label="Notifications"
        aria-expanded={open}
      >
        <img
          src="/assets/images/notifications.svg"
          alt=""
          className={isHeader ? "h-7 w-7 lg:h-8 lg:w-8 object-contain" : "w-5 h-5"}
        />
        {badge}
      </button>

      {open &&
        menuPos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
            style={getPortaledMenuStyle(menuPos)}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate("/notifications");
                }}
                className="text-xs font-medium text-[#16730F] hover:underline"
              >
                View all
              </button>
            </div>

            <div
              className="overflow-y-auto nfl-scroll"
              style={{ maxHeight: Math.min(320, menuPos.maxHeight - 56) }}
            >
              {loading && (
                <p className="px-4 py-6 text-sm text-gray-500 text-center">
                  Loading…
                </p>
              )}
              {!loading && items.length === 0 && (
                <p className="px-4 py-6 text-sm text-gray-500 text-center">
                  No notifications yet
                </p>
              )}
              {!loading &&
                items.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleItemClick(n)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors select-none [-webkit-tap-highlight-color:transparent] touch-manipulation ${
                      !n.is_read ? "bg-green-50/40" : ""
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {formatNotificationTime(n.created_at)}
                    </p>
                  </button>
                ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, UserPlus, Megaphone, Mail, ArrowRight, X } from "lucide-react";
import { toast } from "react-toastify";
import { canAccessPath } from "../../constants/adminPermissions";
import {
  NOTIFICATION_CATEGORIES,
  getCategoryMeta,
  getPriorityMeta,
  relativeTime,
  formatFullDate,
} from "../../data/notificationData";

const CATEGORY_ICONS = {
  [NOTIFICATION_CATEGORIES.USERS]: UserPlus,
  [NOTIFICATION_CATEGORIES.ADPRO]: Megaphone,
  [NOTIFICATION_CATEGORIES.SUPPORT]: Mail,
};

const NotificationDropdown = ({
  isOpen,
  onClose,
  notifications,
  unreadCount: unreadCountProp,
  triggerRef,
}) => {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const recentNotifications = notifications.slice(0, 5);
  const unreadCount =
    typeof unreadCountProp === "number" ? unreadCountProp : notifications.length;

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current?.contains(e.target)) return;
      if (triggerRef?.current?.contains(e.target)) return;
      if (e.target instanceof Element && e.target.closest("#notification-bell")) {
        return;
      }
      onClose();
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside, {
        passive: true,
      });
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleViewAll = () => {
    onClose();
    navigate("/admin/notifications");
  };

  const handleNotificationClick = (notification) => {
    onClose();
    if (
      notification?.link &&
      canAccessPath(user?.admin_role, notification.link)
    ) {
      navigate(notification.link);
      return;
    }
    if (notification?.type === "contact_message" && notification?.entityId) {
      navigate(
        `/admin/notifications?contactId=${encodeURIComponent(notification.entityId)}`,
      );
      return;
    }
    navigate("/admin/notifications");
    if (notification?.link) {
      toast.info("You do not have access to review this item.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="notif-glass fixed sm:absolute inset-x-3 sm:inset-x-auto top-[4.25rem] sm:top-full sm:mt-2 sm:right-0 sm:w-[400px] sm:max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl border border-gray-200/60 z-50 overflow-hidden flex flex-col max-h-[calc(100dvh-5.25rem)] sm:max-h-[calc(100dvh-6rem)]"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="shrink-0 flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-gray-800">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-[11px] font-bold text-white bg-red-500 rounded-full">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close notifications"
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 min-h-0 max-h-[380px] overflow-y-auto overscroll-contain nfl-scroll">
            {recentNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Bell size={20} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  No pending reviews
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  You&apos;re all caught up!
                </p>
              </div>
            ) : (
              recentNotifications.map((notification, index) => {
                const catMeta = getCategoryMeta(notification.category);
                const priMeta = getPriorityMeta(notification.priority);
                const Icon = CATEGORY_ICONS[notification.category] || Bell;

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex items-start gap-3 px-5 py-3.5 border-l-[3px] cursor-pointer transition-all duration-200 hover:bg-gray-50 group ${
                      !notification.read
                        ? `${priMeta.accentClass} bg-[#16730F]/[0.03]`
                        : "border-l-transparent"
                    }`}
                  >
                    <div
                      className={`shrink-0 mt-0.5 h-9 w-9 rounded-xl ${catMeta.bg} ${catMeta.text} flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}
                    >
                      <Icon size={16} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm leading-snug truncate ${
                            !notification.read
                              ? "font-semibold text-gray-900"
                              : "font-medium text-gray-700"
                          }`}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="shrink-0 h-2 w-2 rounded-full bg-[#16730F] notif-badge-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <p
                        className="text-[11px] text-gray-400 mt-1"
                        title={formatFullDate(notification.timestamp)}
                      >
                        {relativeTime(notification.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {recentNotifications.length > 0 && (
            <div className="border-t border-gray-100">
              <button
                onClick={handleViewAll}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-[#16730F] hover:bg-[#16730F]/5 transition-colors"
              >
                View all notifications
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;

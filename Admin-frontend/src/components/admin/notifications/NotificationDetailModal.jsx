import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Bell,
  X,
  UserPlus,
  Megaphone,
  Mail,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PRIORITIES,
  getCategoryMeta,
  formatFullDate,
} from "../../../data/notificationData";
import { resolveContactMessage } from "../../../services/adminInboxApi";

const CATEGORY_ICONS = {
  [NOTIFICATION_CATEGORIES.USERS]: UserPlus,
  [NOTIFICATION_CATEGORIES.ADPRO]: Megaphone,
  [NOTIFICATION_CATEGORIES.SUPPORT]: Mail,
};

const PRIORITY_BADGES = {
  [NOTIFICATION_PRIORITIES.CRITICAL]: {
    label: "Critical",
    color: "bg-red-100 text-red-700 border-red-200",
  },
  [NOTIFICATION_PRIORITIES.WARNING]: {
    label: "Warning",
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  [NOTIFICATION_PRIORITIES.SUCCESS]: {
    label: "Success",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  [NOTIFICATION_PRIORITIES.INFO]: {
    label: "Info",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
};

const NotificationDetailModal = ({
  notification,
  onClose,
  onReview,
  onResolved,
}) => {
  const [resolving, setResolving] = useState(false);
  const backdropMouseDownRef = useRef(false);

  useEffect(() => {
    if (!notification) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [notification, onClose]);

  const catMeta = notification ? getCategoryMeta(notification.category) : null;
  const priorityBadge = notification
    ? PRIORITY_BADGES[notification.priority] ||
      PRIORITY_BADGES[NOTIFICATION_PRIORITIES.INFO]
    : null;
  const Icon = notification
    ? CATEGORY_ICONS[notification.category] || Bell
    : Bell;
  const isContact = notification?.type === "contact_message";
  const fullMessage = notification
    ? notification.contactMessage || notification.message
    : "";

  const handleCopyDetails = async () => {
    if (!notification) return;
    const contactBlock = isContact
      ? `\nFrom: ${notification.contactName || ""}\nEmail: ${notification.contactEmail || ""}`
      : "";
    try {
      await navigator.clipboard.writeText(
        `[${String(notification.priority || "").toUpperCase()}] ${notification.title}${contactBlock}\n${fullMessage}\nDate: ${formatFullDate(notification.timestamp)}`,
      );
      toast.info("Copied notification details to clipboard");
    } catch {
      toast.error("Unable to copy notification details");
    }
  };

  const handleResolve = async () => {
    if (!notification || !isContact || resolving) return;
    setResolving(true);
    try {
      await resolveContactMessage(notification.entityId || notification.id);
      toast.success("Contact message marked as resolved");
      onResolved?.(notification);
      onClose?.();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to resolve message",
      );
    } finally {
      setResolving(false);
    }
  };

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          key={notification.id || "notification-modal"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="notification-detail-title"
          onMouseDown={(e) => {
            backdropMouseDownRef.current = e.target === e.currentTarget;
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && backdropMouseDownRef.current) {
              onClose?.();
            }
            backdropMouseDownRef.current = false;
          }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] md:max-h-[85vh] shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          >
            {/* Fixed Modal Header */}
            <div className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`shrink-0 h-10 w-10 rounded-xl ${catMeta.bg} ${catMeta.text} flex items-center justify-center font-bold`}
                >
                  <Icon size={20} />
                </div>
                <div className="min-w-0">
                  <h3
                    id="notification-detail-title"
                    className="font-bold text-gray-900 text-sm sm:text-base truncate"
                  >
                    {isContact ? "Support Message" : "Event Details"}
                  </h3>
                  <p className="text-xs text-gray-400 truncate">
                    ID: {notification.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close notification details"
                className="shrink-0 p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain nfl-scroll p-4 sm:p-6 space-y-4">
              <div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border mb-2 ${priorityBadge.color}`}
                >
                  {priorityBadge.label} priority
                </span>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug break-words">
                  {notification.title}
                </h2>
              </div>

              {isContact && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 min-w-0">
                    <span className="text-gray-400 font-medium block">From</span>
                    <span className="font-bold text-gray-800 mt-0.5 block break-words">
                      {notification.contactName || "—"}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 min-w-0">
                    <span className="text-gray-400 font-medium block">
                      Email
                    </span>
                    {notification.contactEmail ? (
                      <a
                        href={`mailto:${notification.contactEmail}`}
                        className="font-bold text-[#16730F] mt-0.5 block break-all hover:underline"
                      >
                        {notification.contactEmail}
                      </a>
                    ) : (
                      <span className="font-bold text-gray-800 mt-0.5 block">
                        —
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-2xl p-3.5 sm:p-4 border border-gray-100">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                  {fullMessage}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 min-w-0">
                  <span className="text-gray-400 font-medium block">
                    Category
                  </span>
                  <span className="font-bold text-gray-800 capitalize mt-0.5 block">
                    {catMeta.label}
                  </span>
                </div>
                <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 min-w-0">
                  <span className="text-gray-400 font-medium block">
                    Occurred At
                  </span>
                  <span className="font-bold text-gray-800 mt-0.5 block break-words">
                    {formatFullDate(notification.timestamp)}
                  </span>
                </div>
              </div>
            </div>

            {/* Fixed Modal Footer */}
            <div className="shrink-0 flex flex-wrap items-center justify-end gap-2 px-4 sm:px-6 py-3.5 sm:py-4 bg-gray-50 border-t border-gray-100">
              <button
                type="button"
                onClick={handleCopyDetails}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-xs cursor-pointer"
              >
                Copy Details
              </button>
              {isContact && (
                <button
                  type="button"
                  onClick={handleResolve}
                  disabled={resolving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#16730F] rounded-xl hover:bg-[#125a0c] transition-all shadow-xs cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 size={14} />
                  {resolving ? "Resolving..." : "Mark resolved"}
                </button>
              )}
              {!isContact && onReview && notification.link && (
                <button
                  type="button"
                  onClick={() => {
                    onReview(notification);
                    onClose?.();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#16730F] rounded-xl hover:bg-[#125a0c] transition-all shadow-xs cursor-pointer"
                >
                  Review
                  <ArrowRight size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationDetailModal;

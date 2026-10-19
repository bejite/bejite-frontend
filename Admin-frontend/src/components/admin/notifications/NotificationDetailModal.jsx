import { useState } from "react";
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

  if (!notification) return null;

  const catMeta = getCategoryMeta(notification.category);
  const priorityBadge =
    PRIORITY_BADGES[notification.priority] ||
    PRIORITY_BADGES[NOTIFICATION_PRIORITIES.INFO];
  const Icon = CATEGORY_ICONS[notification.category] || Bell;
  const isContact = notification.type === "contact_message";
  const fullMessage = notification.contactMessage || notification.message;

  const handleCopyDetails = () => {
    const contactBlock = isContact
      ? `\nFrom: ${notification.contactName || ""}\nEmail: ${notification.contactEmail || ""}`
      : "";
    navigator.clipboard.writeText(
      `[${String(notification.priority || "").toUpperCase()}] ${notification.title}${contactBlock}\n${fullMessage}\nDate: ${formatFullDate(notification.timestamp)}`,
    );
    toast.info("Copied notification details to clipboard");
  };

  const handleResolve = async () => {
    if (!isContact || resolving) return;
    setResolving(true);
    try {
      await resolveContactMessage(notification.entityId || notification.id);
      toast.success("Contact message marked as resolved");
      onResolved?.(notification);
      onClose();
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-xl ${catMeta.bg} ${catMeta.text} flex items-center justify-center font-bold`}
              >
                <Icon size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  {isContact ? "Support Message" : "Event Details"}
                </h3>
                <p className="text-xs text-gray-400">ID: {notification.id}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border mb-2 ${priorityBadge.color}`}
              >
                {priorityBadge.label} priority
              </span>
              <h2 className="text-lg font-bold text-gray-900 leading-snug">
                {notification.title}
              </h2>
            </div>

            {isContact && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                  <span className="text-gray-400 font-medium block">From</span>
                  <span className="font-bold text-gray-800 mt-0.5 block break-words">
                    {notification.contactName || "—"}
                  </span>
                </div>
                <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                  <span className="text-gray-400 font-medium block">Email</span>
                  <a
                    href={`mailto:${notification.contactEmail}`}
                    className="font-bold text-[#16730F] mt-0.5 block break-all hover:underline"
                  >
                    {notification.contactEmail || "—"}
                  </a>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {fullMessage}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                <span className="text-gray-400 font-medium block">Category</span>
                <span className="font-bold text-gray-800 capitalize mt-0.5 block">
                  {catMeta.label}
                </span>
              </div>
              <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                <span className="text-gray-400 font-medium block">
                  Occurred At
                </span>
                <span className="font-bold text-gray-800 mt-0.5 block">
                  {formatFullDate(notification.timestamp)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100">
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
                  onClose();
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
      </div>
    </AnimatePresence>
  );
};

export default NotificationDetailModal;

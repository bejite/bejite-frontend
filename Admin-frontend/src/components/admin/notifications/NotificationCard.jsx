import { motion } from "framer-motion";
import {
  Bell,
  Clock,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  UserPlus,
  Megaphone,
  Mail,
  ArrowRight,
} from "lucide-react";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PRIORITIES,
  getCategoryMeta,
  relativeTime,
  formatFullDate,
} from "../../../data/notificationData";

const CATEGORY_ICONS = {
  [NOTIFICATION_CATEGORIES.USERS]: UserPlus,
  [NOTIFICATION_CATEGORIES.ADPRO]: Megaphone,
  [NOTIFICATION_CATEGORIES.SUPPORT]: Mail,
};

const PRIORITY_BADGES = {
  [NOTIFICATION_PRIORITIES.CRITICAL]: {
    label: "Critical",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: AlertCircle,
  },
  [NOTIFICATION_PRIORITIES.WARNING]: {
    label: "Warning",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: AlertTriangle,
  },
  [NOTIFICATION_PRIORITIES.SUCCESS]: {
    label: "Success",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircle2,
  },
  [NOTIFICATION_PRIORITIES.INFO]: {
    label: "Info",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Info,
  },
};

const NotificationCard = ({
  notification,
  index = 0,
  onClick,
  onReview,
}) => {
  const catMeta = getCategoryMeta(notification.category);
  const priorityBadge =
    PRIORITY_BADGES[notification.priority] ||
    PRIORITY_BADGES[NOTIFICATION_PRIORITIES.INFO];
  const Icon = CATEGORY_ICONS[notification.category] || Bell;
  const PriorityIcon = priorityBadge.icon || Info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, height: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      onClick={() => onClick && onClick(notification)}
      className={`group relative bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 hover:shadow-md cursor-pointer ${
        !notification.read
          ? "border-emerald-200/70 bg-emerald-50/[0.04] shadow-xs"
          : "border-gray-100 hover:border-gray-200"
      }`}
    >
      <div
        className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full ${
          notification.priority === NOTIFICATION_PRIORITIES.CRITICAL
            ? "bg-red-500"
            : notification.priority === NOTIFICATION_PRIORITIES.WARNING
            ? "bg-amber-500"
            : notification.priority === NOTIFICATION_PRIORITIES.SUCCESS
            ? "bg-emerald-600"
            : "bg-blue-500"
        }`}
      />

      <div className="flex items-start gap-3 sm:gap-4 pl-1">
        <div
          className={`shrink-0 h-11 w-11 rounded-2xl ${catMeta.bg} ${catMeta.text} flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs`}
        >
          <Icon size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={`text-sm font-bold truncate ${
                  !notification.read
                    ? "text-gray-950 font-extrabold"
                    : "text-gray-800"
                }`}
              >
                {notification.title}
              </h3>
              {!notification.read && (
                <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#16730F] text-white">
                  New
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${priorityBadge.color}`}
              >
                <PriorityIcon size={11} />
                {priorityBadge.label}
              </span>

              <span
                className="text-xs text-gray-400 flex items-center gap-1"
                title={formatFullDate(notification.timestamp)}
              >
                <Clock size={12} />
                {relativeTime(notification.timestamp)}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2">
            {notification.message}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-gray-50">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${catMeta.bg} ${catMeta.text}`}
            >
              {catMeta.label}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReview && onReview(notification);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-white bg-[#16730F] rounded-lg hover:bg-[#125a0c] transition-colors cursor-pointer"
            >
              {notification.type === "contact_message" ? "View" : "Review"}
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationCard;

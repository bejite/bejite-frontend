import { Search, X, UserPlus, Megaphone, Mail } from "lucide-react";
import RecruiterSelect from "../RecruiterSelect";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PRIORITIES,
} from "../../../data/notificationData";

const CATEGORY_TABS = [
  { key: "all", label: "All" },
  { key: NOTIFICATION_CATEGORIES.USERS, label: "Verification", icon: UserPlus },
  { key: NOTIFICATION_CATEGORIES.ADPRO, label: "AdPro", icon: Megaphone },
  { key: NOTIFICATION_CATEGORIES.SUPPORT, label: "Support", icon: Mail },
];

const PRIORITY_OPTIONS = [
  { value: "all", label: "All Priorities" },
  { value: NOTIFICATION_PRIORITIES.CRITICAL, label: "Critical" },
  { value: NOTIFICATION_PRIORITIES.WARNING, label: "Warning" },
  { value: NOTIFICATION_PRIORITIES.SUCCESS, label: "Success" },
  { value: NOTIFICATION_PRIORITIES.INFO, label: "Info" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "priority", label: "Highest Priority" },
];

const NotificationFilters = ({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  activePriority,
  onPriorityChange,
  statusFilter,
  onStatusChange,
  sortOrder,
  onSortChange,
  notifications,
  counts,
  totalCount,
  unreadCount,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 space-y-4">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search verification, AdPro, or support alerts..."
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16730F]/20 focus:border-[#16730F] transition-all placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-full sm:w-[155px]">
            <RecruiterSelect
              id="notification-priority-filter"
              value={activePriority}
              onChange={(e) => onPriorityChange(e.target.value)}
              options={PRIORITY_OPTIONS}
              placeholder="Priority"
              closeBtn={false}
            />
          </div>

          <div className="w-full sm:w-[155px]">
            <RecruiterSelect
              id="notification-sort-filter"
              value={sortOrder}
              onChange={(e) => onSortChange(e.target.value)}
              options={SORT_OPTIONS}
              placeholder="Sort by"
              closeBtn={false}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1.5 overflow-x-auto nfl-scroll pb-1">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = activeCategory === tab.key;
            const count =
              tab.key === "all"
                ? counts?.total ?? notifications.length
                : tab.key === NOTIFICATION_CATEGORIES.USERS
                  ? counts?.verification ??
                    notifications.filter((n) => n.category === tab.key).length
                  : tab.key === NOTIFICATION_CATEGORIES.ADPRO
                    ? counts?.adpro ??
                      notifications.filter((n) => n.category === tab.key).length
                    : tab.key === NOTIFICATION_CATEGORIES.SUPPORT
                      ? counts?.contact ??
                        notifications.filter((n) => n.category === tab.key)
                          .length
                      : notifications.filter((n) => n.category === tab.key)
                          .length;

            return (
              <button
                type="button"
                key={tab.key}
                onClick={() => onCategoryChange(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#16730F] text-white shadow-xs"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.icon && <tab.icon size={13} />}
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl shrink-0 self-start lg:self-auto text-xs font-semibold text-gray-600">
          <button
            type="button"
            onClick={() => onStatusChange("all")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-white text-gray-900 shadow-xs"
                : "hover:text-gray-900"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => onStatusChange("unread")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              statusFilter === "unread"
                ? "bg-white text-[#16730F] font-bold shadow-xs"
                : "hover:text-gray-900"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationFilters;

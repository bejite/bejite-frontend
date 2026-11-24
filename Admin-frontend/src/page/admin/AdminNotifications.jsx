import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Loader from "../../components/ui/Loader";
import { canAccessPath } from "../../constants/adminPermissions";
import { useAdminInbox } from "../../context/useAdminInbox";
import { NOTIFICATION_CATEGORIES } from "../../data/notificationData";
import {
  NotificationHeader,
  NotificationStats,
  NotificationFilters,
  NotificationCard,
  NotificationDetailModal,
  NotificationEmptyState,
  NotificationPagination,
} from "../../components/admin/notifications";

const AdminNotifications = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);
  const { notifications, counts, unreadCount, loading, error, refresh } =
    useAdminInbox();

  const [activeCategory, setActiveCategory] = useState("all");
  const [activePriority, setActivePriority] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const contactIdParam = searchParams.get("contactId");
  const deepLinkNotification = useMemo(() => {
    if (!contactIdParam || loading) return null;
    return (
      notifications.find(
        (n) =>
          n.type === "contact_message" &&
          (String(n.entityId) === String(contactIdParam) ||
            n.id === `contact-${contactIdParam}` ||
            n.id === contactIdParam),
      ) ?? null
    );
  }, [contactIdParam, notifications, loading]);

  const isDeepLinking = Boolean(contactIdParam && deepLinkNotification);
  const effectiveCategory = isDeepLinking
    ? NOTIFICATION_CATEGORIES.SUPPORT
    : activeCategory;
  const effectiveStatusFilter = isDeepLinking ? "all" : statusFilter;
  const modalNotification = selectedNotification ?? deepLinkNotification;

  const handleCategoryChange = (value) => {
    setActiveCategory(value);
    setCurrentPage(1);
  };
  const handlePriorityChange = (value) => {
    setActivePriority(value);
    setCurrentPage(1);
  };
  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };
  const handleSortChange = (value) => {
    setSortOrder(value);
    setCurrentPage(1);
  };

  const clearContactDeepLink = () => {
    if (!searchParams.has("contactId")) return;
    const next = new URLSearchParams(searchParams);
    next.delete("contactId");
    setSearchParams(next, { replace: true });
  };

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((n) => {
        if (effectiveCategory !== "all" && n.category !== effectiveCategory) {
          return false;
        }
        if (activePriority !== "all" && n.priority !== activePriority) {
          return false;
        }
        if (effectiveStatusFilter === "unread" && n.read) return false;
        if (
          effectiveStatusFilter === "verification" &&
          n.category !== NOTIFICATION_CATEGORIES.USERS
        ) {
          return false;
        }
        if (
          effectiveStatusFilter === "adpro" &&
          n.category !== NOTIFICATION_CATEGORIES.ADPRO
        ) {
          return false;
        }
        if (
          effectiveStatusFilter === "support" &&
          n.category !== NOTIFICATION_CATEGORIES.SUPPORT
        ) {
          return false;
        }

        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = String(n.title || "").toLowerCase().includes(query);
          const matchMsg = String(n.message || "").toLowerCase().includes(query);
          const matchEmail = String(n.contactEmail || "")
            .toLowerCase()
            .includes(query);
          const matchName = String(n.contactName || "")
            .toLowerCase()
            .includes(query);
          const matchCategory = String(n.category || "")
            .toLowerCase()
            .includes(query);
          return (
            matchTitle ||
            matchMsg ||
            matchEmail ||
            matchName ||
            matchCategory
          );
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === "newest") {
          return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
        }
        if (sortOrder === "oldest") {
          return new Date(a.timestamp || 0) - new Date(b.timestamp || 0);
        }
        if (sortOrder === "priority") {
          const order = { critical: 4, warning: 3, success: 2, info: 1 };
          return (order[b.priority] || 0) - (order[a.priority] || 0);
        }
        return 0;
      });
  }, [
    notifications,
    effectiveCategory,
    activePriority,
    effectiveStatusFilter,
    searchQuery,
    sortOrder,
  ]);

  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredNotifications.slice(startIndex, startIndex + pageSize);
  }, [filteredNotifications, currentPage, pageSize]);

  const openNotification = (notification) => {
    if (notification?.type === "contact_message") {
      setSelectedNotification(notification);
      return;
    }
    if (
      notification?.link &&
      canAccessPath(user?.admin_role, notification.link)
    ) {
      navigate(notification.link);
      return;
    }
    setSelectedNotification(notification);
    if (notification?.link) {
      toast.info("You do not have access to review this item.");
    }
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      setCurrentPage(1);
      toast.info("Notifications refreshed");
    } catch {
      toast.error("Failed to refresh notifications");
    }
  };

  const handleExportCsv = () => {
    const headers = [
      "ID",
      "Category",
      "Priority",
      "Title",
      "Message",
      "Status",
      "Date",
    ];
    const rows = filteredNotifications.map((n) => [
      n.id,
      n.category,
      n.priority,
      `"${String(n.title || "").replace(/"/g, '""')}"`,
      `"${String(n.message || "").replace(/"/g, '""')}"`,
      n.read ? "Read" : "Unread",
      n.timestamp,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bejite-admin-notifications-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Notifications exported to CSV");
  };

  const handleResetFilters = () => {
    setActiveCategory("all");
    setActivePriority("all");
    setStatusFilter("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleStatFilterClick = (filterType) => {
    if (filterType === "all" || filterType === "unread") {
      setStatusFilter(filterType === "unread" ? "unread" : "all");
      setActiveCategory("all");
      setActivePriority("all");
    } else if (filterType === "verification") {
      setActiveCategory(NOTIFICATION_CATEGORIES.USERS);
      setStatusFilter("all");
    } else if (filterType === "adpro") {
      setActiveCategory(NOTIFICATION_CATEGORIES.ADPRO);
      setStatusFilter("all");
    } else if (filterType === "support") {
      setActiveCategory(NOTIFICATION_CATEGORIES.SUPPORT);
      setStatusFilter("all");
    }
    setCurrentPage(1);
  };

  const isFiltered =
    effectiveCategory !== "all" ||
    activePriority !== "all" ||
    effectiveStatusFilter !== "all" ||
    Boolean(searchQuery.trim());

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6 pb-12 font-sans">
      <NotificationHeader
        unreadCount={unreadCount}
        onRefresh={handleRefresh}
        onExportCsv={handleExportCsv}
      />

      <NotificationStats
        totalCount={counts.total}
        unreadCount={unreadCount}
        verificationCount={counts.verification}
        adproCount={counts.adpro}
        contactCount={counts.contact}
        onFilterClick={handleStatFilterClick}
      />

      <NotificationFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        activeCategory={effectiveCategory}
        onCategoryChange={handleCategoryChange}
        activePriority={activePriority}
        onPriorityChange={handlePriorityChange}
        statusFilter={effectiveStatusFilter}
        onStatusChange={handleStatusChange}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        notifications={notifications}
        counts={counts}
        totalCount={counts.total}
        unreadCount={unreadCount}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between px-2 text-xs text-gray-500 font-medium">
          <span>
            Showing {paginatedNotifications.length} of{" "}
            {filteredNotifications.length} pending alerts
          </span>

          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[#16730F] hover:underline font-semibold cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {loading ? (
            <Loader fullscreen={false} description="Loading notifications..." />
          ) : (
            <AnimatePresence mode="popLayout">
              {error && notifications.length === 0 ? (
                <NotificationEmptyState isError onRetry={handleRefresh} />
              ) : filteredNotifications.length === 0 ? (
                <NotificationEmptyState
                  isFiltered={isFiltered}
                  onResetFilters={handleResetFilters}
                />
              ) : (
                paginatedNotifications.map((notification, index) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    index={index}
                    onClick={openNotification}
                    onReview={openNotification}
                  />
                ))
              )}
            </AnimatePresence>
          )}
        </div>

        <NotificationPagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredNotifications.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </div>

      <NotificationDetailModal
        notification={modalNotification}
        onClose={() => {
          setSelectedNotification(null);
          clearContactDeepLink();
        }}
        onReview={openNotification}
        onResolved={async () => {
          await refresh();
        }}
      />
    </div>
  );
};

export default AdminNotifications;

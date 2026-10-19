import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { canAccessPath } from "../../constants/adminPermissions";
import { useAdminInbox } from "../../context/AdminInboxContext";
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

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activePriority, statusFilter, searchQuery, sortOrder]);

  // Deep-link from bell / Support item: /admin/notifications?contactId=<uuid>
  useEffect(() => {
    const contactId = searchParams.get("contactId");
    if (!contactId || loading) return;

    const match = notifications.find(
      (n) =>
        n.type === "contact_message" &&
        (String(n.entityId) === String(contactId) ||
          n.id === `contact-${contactId}` ||
          n.id === contactId),
    );

    if (!match) return;

    setActiveCategory(NOTIFICATION_CATEGORIES.SUPPORT);
    setStatusFilter("all");
    setSelectedNotification(match);

    const next = new URLSearchParams(searchParams);
    next.delete("contactId");
    setSearchParams(next, { replace: true });
  }, [searchParams, notifications, loading, setSearchParams]);

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((n) => {
        if (activeCategory !== "all" && n.category !== activeCategory) {
          return false;
        }
        if (activePriority !== "all" && n.priority !== activePriority) {
          return false;
        }
        if (statusFilter === "unread" && n.read) return false;
        if (
          statusFilter === "verification" &&
          n.category !== NOTIFICATION_CATEGORIES.USERS
        ) {
          return false;
        }
        if (
          statusFilter === "adpro" &&
          n.category !== NOTIFICATION_CATEGORIES.ADPRO
        ) {
          return false;
        }
        if (
          statusFilter === "support" &&
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
    activeCategory,
    activePriority,
    statusFilter,
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
    activeCategory !== "all" ||
    activePriority !== "all" ||
    statusFilter !== "all" ||
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
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        activePriority={activePriority}
        onPriorityChange={setActivePriority}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
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
            <div className="flex items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#16730F]" />
            </div>
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
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onReview={openNotification}
        onResolved={async () => {
          await refresh();
        }}
      />
    </div>
  );
};

export default AdminNotifications;

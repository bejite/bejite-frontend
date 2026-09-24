import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaRegSmileBeam } from "react-icons/fa";
import { toast } from "react-toastify";
import BirthdayBanner from "./BirthdayBanner";
import TodayBirthdaysHighlight from "./TodayBirthdaysHighlight";
import BirthdayCard from "./BirthdayCard";
import BirthdayCardSkeleton, {
  BirthdayTabsSkeleton,
} from "./BirthdayCardSkeleton";
import BirthdayTabs from "./BirthdayTabs";
import BirthdayWishModal from "./BirthdayWishModal";
import BirthdayPagination from "./BirthdayPagination";
import {
  getMilestones,
  getViewerTimeZone,
  milestoneJobSubtitle,
  sendBirthdayWish,
} from "../../services/milestonesApi";

const DEFAULT_WISH = "🎂 Happy Birthday! 🎉";

function isCanceled(err, signal) {
  return (
    signal?.aborted ||
    err?.name === "CanceledError" ||
    err?.name === "AbortError" ||
    err?.code === "ERR_CANCELED"
  );
}

export default function BirthdaysMiddle() {
  const navigate = useNavigate();
  const inFlightRef = useRef(new Set());
  const [birthdayList, setBirthdayList] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [loading, setLoading] = useState(true);

  const [selectedUserForModal, setSelectedUserForModal] = useState(null);
  const [customMessage, setCustomMessage] = useState("");
  const [sendingWish, setSendingWish] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    const timeZone = getViewerTimeZone();

    (async () => {
      setLoading(true);
      try {
        const data = await getMilestones({ timeZone, signal: ac.signal });
        if (ac.signal.aborted) return;
        setBirthdayList(Array.isArray(data?.milestones) ? data.milestones : []);
      } catch (err) {
        if (isCanceled(err, ac.signal)) return;
        console.error("Error fetching milestones:", err);
        toast.error(
          err.response?.data?.error || "Failed to load connection birthdays",
        );
        setBirthdayList([]);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  const markWished = (userId, wished = true) => {
    setBirthdayList((prev) =>
      prev.map((item) =>
        String(item.id) === String(userId) ? { ...item, wished } : item,
      ),
    );
  };

  const sendWish = async (userId, userName, message, { successToast } = {}) => {
    if (inFlightRef.current.has(userId)) return false;
    const current = birthdayList.find(
      (item) => String(item.id) === String(userId),
    );
    if (!current || current.wished) return false;

    inFlightRef.current.add(userId);
    markWished(userId, true);
    try {
      await sendBirthdayWish(userId, message, getViewerTimeZone());
      toast.success(successToast);
      return true;
    } catch (err) {
      if (err.response?.status === 409) {
        markWished(userId, true);
        toast.info(`You already wished ${userName} this year`);
        return true;
      }
      markWished(userId, false);
      toast.error(
        err.response?.data?.error ||
          `Failed to send birthday wish to ${userName}`,
      );
      return false;
    } finally {
      inFlightRef.current.delete(userId);
    }
  };

  const handleQuickWish = (userId, userName, message = DEFAULT_WISH) => {
    void sendWish(userId, userName, message, {
      successToast: `Birthday wish sent to ${userName}! 🎉`,
    });
  };

  const handleOpenWishModal = (user) => {
    if (sendingWish) return;
    setSelectedUserForModal(user);
    const first = String(user.name || "")
      .split(" ")
      .filter(Boolean)[0];
    setCustomMessage(
      first
        ? `Happy Birthday ${first}! Wishing you all the best on your special day! 🎂`
        : DEFAULT_WISH,
    );
  };

  const handleSendCustomWish = async (e) => {
    e.preventDefault();
    if (!selectedUserForModal || !customMessage.trim() || sendingWish) return;

    const user = selectedUserForModal;
    setSendingWish(true);
    try {
      const ok = await sendWish(user.id, user.name, customMessage.trim(), {
        successToast: `Personal wish sent to ${user.name}! 🎂`,
      });
      if (ok) {
        setSelectedUserForModal(null);
        setCustomMessage("");
      }
    } finally {
      setSendingWish(false);
    }
  };

  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return birthdayList.filter((item) => {
      const matchesSearch =
        String(item.name || "")
          .toLowerCase()
          .includes(q) ||
        milestoneJobSubtitle(item).toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (activeTab === "today") return item.category === "today";
      if (activeTab === "upcoming") return item.category === "upcoming";
      if (activeTab === "recent") return item.category === "recent";
      return true;
    });
  }, [birthdayList, activeTab, searchQuery]);

  const todayCount = useMemo(
    () => birthdayList.filter((i) => i.category === "today").length,
    [birthdayList],
  );
  const upcomingCount = useMemo(
    () => birthdayList.filter((i) => i.category === "upcoming").length,
    [birthdayList],
  );
  const recentCount = useMemo(
    () => birthdayList.filter((i) => i.category === "recent").length,
    [birthdayList],
  );

  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  const handleTabChange = (tabId) => {
    if (loading) return;
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const todayList = useMemo(
    () => birthdayList.filter((item) => item.category === "today"),
    [birthdayList],
  );

  const tabsConfig = [
    { id: "all", label: "All", count: birthdayList.length },
    { id: "today", label: "Today", count: todayCount },
    { id: "upcoming", label: "Upcoming", count: upcomingCount },
    { id: "recent", label: "Recent", count: recentCount },
  ];

  return (
    <div
      className="min-h-[100dvh] bg-[#F5F5F5] w-full min-w-0 pb-12"
      aria-busy={loading}
    >
      <div className="w-full min-w-0 max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <BirthdayBanner />

        {!loading && activeTab !== "recent" && (
          <TodayBirthdaysHighlight
            todayList={todayList}
            onNavigateProfile={(id) => navigate(`/user-profile/${id}`)}
            onQuickWish={handleQuickWish}
            onOpenCustomModal={handleOpenWishModal}
          />
        )}

        <div className="mb-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name or role..."
              value={searchQuery}
              onChange={handleSearchChange}
              disabled={loading}
              className="w-full border-2 border-[#16730F] p-2.5 pl-4 pr-10 rounded-xl focus:outline-none text-sm bg-white shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <FaSearch className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1A3E32] h-4 w-4 pointer-events-none" />
          </div>
        </div>

        {loading ? (
          <BirthdayTabsSkeleton />
        ) : (
          <BirthdayTabs
            tabs={tabsConfig}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        )}

        {loading ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            role="status"
            aria-label="Loading birthdays"
          >
            {Array.from({ length: pageSize }).map((_, idx) => (
              <BirthdayCardSkeleton key={idx} />
            ))}
          </div>
        ) : paginatedItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 py-12 px-4 text-center">
            <FaRegSmileBeam className="h-14 w-14 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-700 mb-1">
              No Birthdays Found
            </h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              {searchQuery
                ? `No people matching "${searchQuery}" in this section.`
                : "No network birthdays in this selected view."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedItems.map((person) => (
              <BirthdayCard
                key={person.id}
                person={person}
                onNavigateProfile={(id) => navigate(`/user-profile/${id}`)}
                onQuickWish={handleQuickWish}
                onOpenCustomModal={handleOpenWishModal}
              />
            ))}
          </div>
        )}

        {!loading && (
          <BirthdayPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalCount={filteredList.length}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <BirthdayWishModal
        selectedUser={selectedUserForModal}
        customMessage={customMessage}
        setCustomMessage={setCustomMessage}
        sending={sendingWish}
        onClose={() => {
          if (sendingWish) return;
          setSelectedUserForModal(null);
        }}
        onSubmit={handleSendCustomWish}
      />
    </div>
  );
}

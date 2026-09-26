// Mailbox (1-on-1 recruiter mail) temporarily disabled via App.jsx / AdminLayout.
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Mail, Send } from "lucide-react";

import {
  MAIL_FOLDERS,
  getStoredThreads,
  saveStoredThreads,
  fetchRecruitersDirectory,
  sendAdminMessage,
} from "../../services/recruiterMailService";

import { RecruiterMailSidebar } from "../../components/admin/recruiterMail/RecruiterMailSidebar";
import { RecruiterMailToolbar } from "../../components/admin/recruiterMail/RecruiterMailToolbar";
import { RecruiterThreadList } from "../../components/admin/recruiterMail/RecruiterThreadList";
import { RecruiterThreadView } from "../../components/admin/recruiterMail/RecruiterThreadView";
import { DockedComposer } from "../../components/admin/recruiterMail/DockedComposer";
import { DeleteConfirmModal } from "../../components/modal/DeleteConfirmModal";

const AdminRecruiterMail = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);

  const [threads, setThreads] = useState([]);
  const [recruitersDirectory, setRecruitersDirectory] = useState([]);
  const [activeFolder, setActiveFolder] = useState(
    searchParams.get("folder") || MAIL_FOLDERS.INBOX,
  );
  const [selectedThreadId, setSelectedThreadId] = useState(
    searchParams.get("threadId") || null,
  );
  const [selectedThreadIds, setSelectedThreadIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // "all" | "unread"

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeInitialData, setComposeInitialData] = useState({
    recruiter: null,
    subject: "",
    body: "",
  });

  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Load threads and directory
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const stored = getStoredThreads();
      setThreads(stored);
      const directory = await fetchRecruitersDirectory();
      setRecruitersDirectory(directory);
    } catch (err) {
      console.error("Failed to load mailbox data:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Deep linking: ?composeTo=<email> or ?threadId=<id>
  useEffect(() => {
    const composeEmail = searchParams.get("composeTo");
    if (composeEmail) {
      setComposeInitialData({
        recruiter: {
          name: composeEmail.split("@")[0],
          email: composeEmail,
        },
        subject: searchParams.get("subject") || "",
        body: "",
      });
      setIsComposeOpen(true);
    }

    const tId = searchParams.get("threadId");
    if (tId) {
      setSelectedThreadId(tId);
    }
  }, [searchParams]);

  // Keyboard shortcut: Press 'C' to compose, 'Esc' to close/back
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA");

      if (e.key === "c" || e.key === "C") {
        if (!isInput && !isComposeOpen) {
          e.preventDefault();
          setComposeInitialData({ recruiter: null, subject: "", body: "" });
          setIsComposeOpen(true);
        }
      }

      if (e.key === "Escape") {
        if (isComposeOpen) {
          setIsComposeOpen(false);
        } else if (selectedThreadId) {
          handleBackToList();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isComposeOpen, selectedThreadId]);

  // Calculate folder counts
  const counts = useMemo(() => {
    let inboxUnread = 0;
    let sent = 0;

    threads.forEach((t) => {
      if (t.folder === MAIL_FOLDERS.INBOX && !t.isRead) inboxUnread++;
      if (t.folder === MAIL_FOLDERS.SENT) sent++;
    });

    return { inboxUnread, sent };
  }, [threads]);

  // Filter threads based on active folder, search, and filterType
  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      // Folder filter
      if (t.folder !== activeFolder) {
        return false;
      }

      // Filter unread
      if (filterType === "unread" && t.isRead) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const contactName = (t.contact?.name || t.recruiter?.name || "").toLowerCase();
        const contactEmail = (t.contact?.email || t.recruiter?.email || "").toLowerCase();
        const matchSubject = t.subject?.toLowerCase().includes(q);
        const matchBody = t.messages?.some((m) =>
          m.body?.toLowerCase().includes(q),
        );

        if (
          !contactName.includes(q) &&
          !contactEmail.includes(q) &&
          !matchSubject &&
          !matchBody
        ) {
          return false;
        }
      }

      return true;
    });
  }, [threads, activeFolder, filterType, searchQuery]);

  const selectedThread = useMemo(() => {
    return threads.find((t) => t.id === selectedThreadId) || null;
  }, [threads, selectedThreadId]);

  // Thread selection
  const handleSelectThread = (thread) => {
    setSelectedThreadId(thread.id);
    const next = new URLSearchParams(searchParams);
    next.set("threadId", thread.id);
    setSearchParams(next, { replace: true });

    // Mark as read immediately when opened
    if (!thread.isRead) {
      handleMarkRead(thread.id, true);
    }
  };

  const handleBackToList = () => {
    setSelectedThreadId(null);
    const next = new URLSearchParams(searchParams);
    next.delete("threadId");
    setSearchParams(next, { replace: true });
  };

  // Thread Operations
  const handleMarkRead = (threadId, isRead) => {
    const updated = threads.map((t) =>
      t.id === threadId ? { ...t, isRead } : t,
    );
    setThreads(updated);
    saveStoredThreads(updated);
  };

  const handleDeleteThread = (threadId) => {
    const updated = threads.filter((t) => t.id !== threadId);
    setThreads(updated);
    saveStoredThreads(updated);
    setSelectedThreadIds((prev) => prev.filter((id) => id !== threadId));
    if (selectedThreadId === threadId) {
      handleBackToList();
    }
    toast.success("Message deleted");
  };

  // Reusable Delete Confirmation State
  const [deleteModalConfig, setDeleteModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const requestDeleteThread = (threadId) => {
    const target = threads.find((t) => t.id === threadId);
    const contactName =
      target?.contact?.name || target?.recruiter?.name || "this contact";

    setDeleteModalConfig({
      isOpen: true,
      title: "Delete Conversation",
      message: `Are you sure you want to delete this conversation with ${contactName}? This action cannot be undone.`,
      onConfirm: () => {
        handleDeleteThread(threadId);
        setDeleteModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const requestBulkDelete = () => {
    const count = selectedThreadIds.length;
    if (count === 0) return;

    setDeleteModalConfig({
      isOpen: true,
      title: `Delete ${count} Conversation${count > 1 ? "s" : ""}`,
      message: `Are you sure you want to delete ${count} selected conversation${count > 1 ? "s" : ""}? This action cannot be undone.`,
      onConfirm: () => {
        handleBulkDelete();
        setDeleteModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Bulk Operations
  const allSelectedState = useMemo(() => {
    if (filteredThreads.length === 0) return "none";
    const selectedInCurrent = filteredThreads.filter((t) =>
      selectedThreadIds.includes(t.id),
    );
    if (selectedInCurrent.length === 0) return "none";
    if (selectedInCurrent.length === filteredThreads.length) return "all";
    return "some";
  }, [filteredThreads, selectedThreadIds]);

  const handleToggleSelectAll = () => {
    if (allSelectedState === "all") {
      setSelectedThreadIds([]);
    } else {
      setSelectedThreadIds(filteredThreads.map((t) => t.id));
    }
  };

  const handleToggleCheckThread = (threadId) => {
    setSelectedThreadIds((prev) =>
      prev.includes(threadId)
        ? prev.filter((id) => id !== threadId)
        : [...prev, threadId],
    );
  };

  const handleBulkMarkRead = (isRead) => {
    const updated = threads.map((t) =>
      selectedThreadIds.includes(t.id) ? { ...t, isRead } : t,
    );
    setThreads(updated);
    saveStoredThreads(updated);
    setSelectedThreadIds([]);
    toast.success(
      `Marked ${selectedThreadIds.length} emails as ${isRead ? "read" : "unread"}`,
    );
  };

  const handleBulkDelete = () => {
    const updated = threads.filter((t) => !selectedThreadIds.includes(t.id));
    setThreads(updated);
    saveStoredThreads(updated);
    const count = selectedThreadIds.length;
    setSelectedThreadIds([]);
    if (selectedThreadId && selectedThreadIds.includes(selectedThreadId)) {
      handleBackToList();
    }
    toast.success(`Deleted ${count} emails`);
  };

  // Send Message from Composer
  const handleSendMessage = async ({
    toEmail,
    toName,
    subject,
    body,
    attachments,
  }) => {
    await sendAdminMessage({
      toEmail,
      toName,
      subject,
      body,
      attachments,
      adminUser: user,
    });
    // Refresh threads and switch to sent folder
    const fresh = getStoredThreads();
    setThreads(fresh);
    setActiveFolder(MAIL_FOLDERS.SENT);
  };

  // Send Reply from Thread View
  const handleSendReply = async ({ threadId, body, attachments }) => {
    setIsSendingReply(true);
    try {
      await sendAdminMessage({
        threadId,
        body,
        attachments,
        adminUser: user,
      });
      const fresh = getStoredThreads();
      setThreads(fresh);
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <div
      style={{ fontFamily: "NunitoSemi" }}
      className="w-full max-w-[1540px] mx-auto flex flex-col h-[calc(100dvh-4rem)] sm:h-[calc(100dvh-5.5rem)] lg:h-[calc(100dvh-7.5rem)] font-sans overflow-hidden"
    >
      {/* Top Application Header */}
      <div
        className={`bg-white px-3 sm:px-5 py-2.5 sm:py-3 sm:rounded-2xl shadow-xs border-b sm:border border-slate-200/80 mb-0 sm:mb-3 shrink-0 ${
          selectedThread ? "hidden md:flex" : "flex"
        } items-center justify-between gap-3`}
      >
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-tr from-[#16730F] to-[#125e0c] text-white rounded-xl flex items-center justify-center shadow-xs shrink-0">
            <Mail size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1
                style={{ fontFamily: "NunitoBold" }}
                className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 tracking-tight"
              >
                Mailbox
              </h1>
              {counts.inboxUnread > 0 && (
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-bold">
                  {counts.inboxUnread} unread
                </span>
              )}
            </div>
            <p className="text-slate-500 text-xs mt-0.5 hidden sm:block">
              Send, receive, and manage messages with users and external contacts.
            </p>
          </div>
        </div>

        {/* Right: Primary Compose Action */}
        <button
          onClick={() => {
            setComposeInitialData({
              recruiter: null,
              subject: "",
              body: "",
            });
            setIsComposeOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#16730F] to-[#10540b] hover:from-[#13610d] hover:to-[#0c4008] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer group"
        >
          <Send
            size={13}
            className="group-hover:translate-x-0.5 transition-transform"
          />
          <span>Compose</span>
        </button>
      </div>

      {/* Main Mailbox Workspace (2-Column Layout) */}
      <div className="flex-1 bg-white sm:rounded-2xl sm:shadow-xs sm:border sm:border-slate-200/80 flex overflow-hidden min-h-0 relative w-full max-w-full">
        {/* Left Sidebar */}
        <RecruiterMailSidebar
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          activeFolder={activeFolder}
          setActiveFolder={(folder) => {
            setActiveFolder(folder);
            handleBackToList();
          }}
          onOpenCompose={() => {
            setComposeInitialData({ recruiter: null, subject: "", body: "" });
            setIsComposeOpen(true);
          }}
          counts={counts}
          isThreadSelected={!!selectedThread}
        />

        {/* Center / Main Pane */}
        <div className="flex-1 flex flex-col min-w-0 h-full bg-white overflow-hidden">
          {selectedThread ? (
            <RecruiterThreadView
              thread={selectedThread}
              onBack={handleBackToList}
              onTrash={requestDeleteThread}
              onMarkUnread={handleMarkRead}
              onSendReply={handleSendReply}
              isSendingReply={isSendingReply}
              adminUser={user}
            />
          ) : (
            <>
              {/* Toolbar */}
              <RecruiterMailToolbar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterType={filterType}
                setFilterType={setFilterType}
                selectedThreadIds={selectedThreadIds}
                onToggleSelectAll={handleToggleSelectAll}
                allSelectedState={allSelectedState}
                onBulkMarkRead={handleBulkMarkRead}
                onBulkMarkUnread={(isRead) => handleBulkMarkRead(isRead)}
                onBulkTrash={requestBulkDelete}
                onRefresh={loadData}
                isRefreshing={isRefreshing}
                activeFolder={activeFolder}
                totalCount={filteredThreads.length}
                unreadCount={counts.inboxUnread}
                onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
              />

              {/* Thread List */}
              <RecruiterThreadList
                threads={filteredThreads}
                selectedThreadId={selectedThreadId}
                onSelectThread={handleSelectThread}
                selectedThreadIds={selectedThreadIds}
                onToggleCheckThread={handleToggleCheckThread}
                onMarkRead={handleMarkRead}
                onTrash={requestDeleteThread}
                searchQuery={searchQuery}
                activeFolder={activeFolder}
                onOpenCompose={() => {
                  setComposeInitialData({
                    recruiter: null,
                    subject: "",
                    body: "",
                  });
                  setIsComposeOpen(true);
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Floating Action Button for Compose on Mobile */}
      {!selectedThread && (
        <button
          onClick={() => {
            setComposeInitialData({ recruiter: null, subject: "", body: "" });
            setIsComposeOpen(true);
          }}
          className="md:hidden fixed bottom-6 right-5 z-30 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#16730F] to-[#10540b] hover:from-[#13610d] hover:to-[#0c4008] text-white rounded-full font-bold text-xs shadow-xl shadow-[#16730F]/30 active:scale-95 transition-all cursor-pointer"
          title="Compose email"
        >
          <Send size={15} />
          <span>Compose</span>
        </button>
      )}

      {/* Clean Email Composer */}
      <DockedComposer
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSend={handleSendMessage}
        recruitersDirectory={recruitersDirectory}
        adminUser={user}
        initialToRecruiter={composeInitialData.recruiter}
        initialSubject={composeInitialData.subject}
        initialBody={composeInitialData.body}
      />

      {/* Reusable Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalConfig.isOpen}
        onClose={() => setDeleteModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={deleteModalConfig.onConfirm}
        title={deleteModalConfig.title}
        message={deleteModalConfig.message}
      />
    </div>
  );
};

export default AdminRecruiterMail;

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Mail,
  Send,
  Users,
  Sparkles,
  Inbox,
  ArrowRight,
  RefreshCw,
  Megaphone,
  Radio,
  Layers,
} from "lucide-react";

import {
  MAIL_FOLDERS,
  getStoredThreads,
  saveStoredThreads,
  fetchRecruitersDirectory,
  sendRecruiterMessage,
  simulateRecruiterReply,
} from "../../services/recruiterMailService";

import { RecruiterMailSidebar } from "../../components/admin/recruiterMail/RecruiterMailSidebar";
import { RecruiterMailToolbar } from "../../components/admin/recruiterMail/RecruiterMailToolbar";
import { RecruiterThreadList } from "../../components/admin/recruiterMail/RecruiterThreadList";
import { RecruiterThreadView } from "../../components/admin/recruiterMail/RecruiterThreadView";
import { RecruiterProfileDrawer } from "../../components/admin/recruiterMail/RecruiterProfileDrawer";
import { DockedComposer } from "../../components/admin/recruiterMail/DockedComposer";
import { SimulateReplyModal } from "../../components/admin/recruiterMail/SimulateReplyModal";

const AdminRecruiterMail = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);

  const [threads, setThreads] = useState([]);
  const [recruitersDirectory, setRecruitersDirectory] = useState([]);
  const [activeFolder, setActiveFolder] = useState(
    searchParams.get("folder") || MAIL_FOLDERS.INBOX,
  );
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedThreadId, setSelectedThreadId] = useState(
    searchParams.get("threadId") || null,
  );
  const [selectedThreadIds, setSelectedThreadIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // "all" | "unread" | "starred" | "attachments"

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeInitialData, setComposeInitialData] = useState({
    recruiter: null,
    subject: "",
    body: "",
  });

  const [showProfileDrawer, setShowProfileDrawer] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1280;
    }
    return false;
  });
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Load threads and recruiter directory
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const stored = getStoredThreads();
      setThreads(stored);
      const directory = await fetchRecruitersDirectory();
      setRecruitersDirectory(directory);
    } catch (err) {
      console.error("Failed to load recruiter mailbox data:", err);
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
    if (composeEmail && recruitersDirectory.length > 0) {
      const matched = recruitersDirectory.find(
        (r) => r.email.toLowerCase() === composeEmail.toLowerCase(),
      );
      setComposeInitialData({
        recruiter: matched || {
          name: composeEmail.split("@")[0],
          email: composeEmail,
          company: "Recruiter",
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
  }, [searchParams, recruitersDirectory]);

  // Global Keyboard Shortcuts (Press 'C' to compose, 'Esc' to close/back)
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

  // Calculate counts for sidebar badges
  const counts = useMemo(() => {
    let inboxUnread = 0;
    let sent = 0;
    let starred = 0;
    let drafts = 0;
    let archive = 0;
    let trash = 0;
    const categories = {
      active_hiring: 0,
      candidate_review: 0,
      partnership: 0,
      follow_up: 0,
    };

    threads.forEach((t) => {
      if (t.folder === MAIL_FOLDERS.INBOX && !t.isRead) inboxUnread++;
      if (t.folder === MAIL_FOLDERS.SENT) sent++;
      if (t.isStarred && t.folder !== MAIL_FOLDERS.TRASH) starred++;
      if (t.folder === MAIL_FOLDERS.DRAFTS) drafts++;
      if (t.folder === MAIL_FOLDERS.ARCHIVE) archive++;
      if (t.folder === MAIL_FOLDERS.TRASH) trash++;

      if (
        t.category &&
        categories[t.category] !== undefined &&
        t.folder !== MAIL_FOLDERS.TRASH
      ) {
        categories[t.category]++;
      }
    });

    return { inboxUnread, sent, starred, drafts, archive, trash, categories };
  }, [threads]);

  // Filter threads based on active folder, category, search, and filterType
  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      // Category filter takes precedence if active
      if (activeCategory) {
        if (t.category !== activeCategory || t.folder === MAIL_FOLDERS.TRASH) {
          return false;
        }
      } else {
        // Folder filter
        if (activeFolder === MAIL_FOLDERS.STARRED) {
          if (!t.isStarred || t.folder === MAIL_FOLDERS.TRASH) return false;
        } else if (t.folder !== activeFolder) {
          return false;
        }
      }

      // Filter pills
      if (filterType === "unread" && t.isRead) return false;
      if (filterType === "starred" && !t.isStarred) return false;
      if (filterType === "attachments") {
        const hasAtt = t.messages?.some(
          (m) => m.attachments && m.attachments.length > 0,
        );
        if (!hasAtt) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchRecruiter = t.recruiter?.name?.toLowerCase().includes(q);
        const matchEmail = t.recruiter?.email?.toLowerCase().includes(q);
        const matchCompany = t.recruiter?.company?.toLowerCase().includes(q);
        const matchSubject = t.subject?.toLowerCase().includes(q);
        const matchBody = t.messages?.some((m) =>
          m.body?.toLowerCase().includes(q),
        );

        if (
          !matchRecruiter &&
          !matchEmail &&
          !matchCompany &&
          !matchSubject &&
          !matchBody
        ) {
          return false;
        }
      }

      return true;
    });
  }, [threads, activeFolder, activeCategory, filterType, searchQuery]);

  const selectedThread = useMemo(() => {
    return threads.find((t) => t.id === selectedThreadId) || null;
  }, [threads, selectedThreadId]);

  // Update URL params when thread is selected
  const handleSelectThread = (thread) => {
    setSelectedThreadId(thread.id);
    const next = new URLSearchParams(searchParams);
    next.set("threadId", thread.id);
    setSearchParams(next, { replace: true });

    // Mark as read immediately when viewed
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
  const handleToggleStar = (threadId) => {
    const updated = threads.map((t) =>
      t.id === threadId ? { ...t, isStarred: !t.isStarred } : t,
    );
    setThreads(updated);
    saveStoredThreads(updated);
  };

  const handleMarkRead = (threadId, isRead) => {
    const updated = threads.map((t) =>
      t.id === threadId ? { ...t, isRead } : t,
    );
    setThreads(updated);
    saveStoredThreads(updated);
  };

  const handleArchive = (threadId) => {
    const updated = threads.map((t) =>
      t.id === threadId ? { ...t, folder: MAIL_FOLDERS.ARCHIVE } : t,
    );
    setThreads(updated);
    saveStoredThreads(updated);
    if (selectedThreadId === threadId) {
      handleBackToList();
    }
    toast.success("Conversation moved to Archive");
  };

  const handleTrash = (threadId) => {
    const updated = threads.map((t) =>
      t.id === threadId ? { ...t, folder: MAIL_FOLDERS.TRASH } : t,
    );
    setThreads(updated);
    saveStoredThreads(updated);
    if (selectedThreadId === threadId) {
      handleBackToList();
    }
    toast.info("Conversation moved to Trash");
  };

  const handleUpdateCategory = (threadId, category) => {
    const updated = threads.map((t) =>
      t.id === threadId ? { ...t, category } : t,
    );
    setThreads(updated);
    saveStoredThreads(updated);
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
      `Marked ${selectedThreadIds.length} threads as ${isRead ? "read" : "unread"}`,
    );
  };

  const handleBulkStar = () => {
    const updated = threads.map((t) =>
      selectedThreadIds.includes(t.id) ? { ...t, isStarred: true } : t,
    );
    setThreads(updated);
    saveStoredThreads(updated);
    setSelectedThreadIds([]);
    toast.success(`Starred ${selectedThreadIds.length} threads`);
  };

  const handleBulkArchive = () => {
    const updated = threads.map((t) =>
      selectedThreadIds.includes(t.id)
        ? { ...t, folder: MAIL_FOLDERS.ARCHIVE }
        : t,
    );
    setThreads(updated);
    saveStoredThreads(updated);
    setSelectedThreadIds([]);
    toast.success(`Archived ${selectedThreadIds.length} threads`);
  };

  const handleBulkTrash = () => {
    const updated = threads.map((t) =>
      selectedThreadIds.includes(t.id)
        ? { ...t, folder: MAIL_FOLDERS.TRASH }
        : t,
    );
    setThreads(updated);
    saveStoredThreads(updated);
    setSelectedThreadIds([]);
    toast.info(`Moved ${selectedThreadIds.length} threads to Trash`);
  };

  // Send Message from Composer
  const handleSendMessage = async ({
    toEmail,
    toName,
    company,
    subject,
    body,
    attachments,
  }) => {
    await sendRecruiterMessage({
      toEmail,
      toName,
      company,
      subject,
      body,
      attachments,
      adminUser: user,
    });
    // Refresh threads
    const fresh = getStoredThreads();
    setThreads(fresh);
    // Switch to sent folder so admin immediately sees their email
    setActiveFolder(MAIL_FOLDERS.SENT);
    setActiveCategory(null);
  };

  // Send Inline Reply from Thread View
  const handleSendReply = async ({ threadId, body, attachments }) => {
    setIsSendingReply(true);
    try {
      await sendRecruiterMessage({
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

  // Trigger Simulated Recruiter Reply
  const handleExecuteSimulation = (threadId, replyText) => {
    const result = simulateRecruiterReply(threadId, replyText);
    if (result) {
      const fresh = getStoredThreads();
      setThreads(fresh);

      // Show instant browser notification toast
      toast.success(
        ` New reply from ${result.thread.recruiter.name} (${result.thread.recruiter.company})!`,
        { autoClose: 5000 },
      );

      // If user is currently looking at this thread, keep it open; otherwise switch to inbox
      if (selectedThreadId !== threadId) {
        setActiveFolder(MAIL_FOLDERS.INBOX);
        setActiveCategory(null);
        setSelectedThreadId(threadId);
      }
    }
  };

  return (
    <div
      style={{ fontFamily: "NunitoSemi" }}

      className="w-full max-w-[1540px] mx-auto flex flex-col h-[calc(100dvh-4rem)] sm:h-[calc(100dvh-5.5rem)] lg:h-[calc(100dvh-7.5rem)] font-sans overflow-hidden"
    >
      {/* Top Application Header (Hidden on mobile when reading a thread to give 100% focus to the email) */}
      <div
        className={`bg-white px-3 sm:px-5 py-2 sm:py-3 sm:rounded-2xl shadow-xs border-b sm:border border-slate-200/80 mb-0 sm:mb-3 shrink-0 ${
          selectedThread ? "hidden md:flex" : "flex"
        } flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-3`}
      >
        {/* Mobile Header Bar (< md) */}
        <div className="flex md:hidden items-center justify-between w-full">
          {/* Folders Drawer Trigger Button */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
            title="Browse folders"
          >
            <span className="text-slate-600 font-normal">📁</span>
            <span className="capitalize">{activeFolder || "Inbox"}</span>
            {counts.inboxUnread > 0 && activeFolder === MAIL_FOLDERS.INBOX && (
              <span className="px-1.5 py-0.2 bg-[#16730F] text-white rounded-full text-[10px] font-bold">
                {counts.inboxUnread}
              </span>
            )}
          </button>

          {/* Center Brand Title */}
          <div className="flex items-center gap-1.5">
            <span
              style={{ fontFamily: "NunitoBold" }}
              className="text-sm font-extrabold text-slate-900 tracking-tight"
            >
              Mailbox
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          {/* Quick Header Tools (Campaigns & Simulator) */}
          <div className="flex items-center gap-1">
            <Link
              to="/admin/email-outreach"
              className="p-1.5 text-slate-600 hover:text-[#16730F] hover:bg-emerald-50 rounded-xl transition-colors"
              title="Bulk Campaigns"
            >
              <Megaphone size={16} />
            </Link>
            <button
              onClick={() => setShowSimulateModal(true)}
              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
              title="Simulate Inbound Reply"
            >
              <Sparkles size={16} />
            </button>
          </div>
        </div>

        {/* Desktop Header Content (md:+) */}
        <div className="hidden md:flex items-center justify-between w-full">
          {/* Left: Brand & Mode Info */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-tr from-[#16730F] to-[#125e0c] text-white rounded-xl flex items-center justify-center shadow-xs shrink-0">
              <Mail size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  style={{ fontFamily: "NunitoBold" }}
                  className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight"
                >
                  Recruiter Mailbox
                </h1>
                <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live 1-on-1 Client
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">
                Direct personal emailing with recruiters, delivery tracking, and
                threaded conversations.
              </p>
            </div>
          </div>

          {/* Right: Quick Switcher & Primary Actions */}
          <div className="flex items-center gap-2">
            <Link
              to="/admin/email-outreach"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all shadow-2xs group"
              title="Switch to bulk campaigns builder"
            >
              <Megaphone
                size={13}
                className="text-[#16730F] group-hover:scale-110 transition-transform"
              />
              <span>Bulk Outreach</span>
              <ArrowRight size={12} className="text-slate-400" />
            </Link>

            <button
              onClick={() => setShowSimulateModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-amber-900 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs group"
              title="Simulate receiving a reply from a recruiter"
            >
              <Sparkles
                size={13}
                className="text-amber-600 group-hover:rotate-12 transition-transform"
              />
              <span>Test Inbound Reply</span>
            </button>

            <button
              onClick={() => {
                setComposeInitialData({
                  recruiter: null,
                  subject: "",
                  body: "",
                });
                setIsComposeOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#16730F] to-[#10540b] hover:from-[#13610d] hover:to-[#0c4008] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer group"
            >
              <Send
                size={13}
                className="group-hover:translate-x-0.5 transition-transform"
              />
              <span>Compose</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Mailbox Workspace (Responsive Split Layout) */}
      <div className="flex-1 bg-white sm:rounded-2xl sm:shadow-xs sm:border sm:border-slate-200/80 flex overflow-hidden min-h-0 relative w-full max-w-full">
        {/* Left Sidebar (Desktop in-flow, Mobile off-canvas drawer) */}
        <RecruiterMailSidebar
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          activeFolder={activeFolder}
          setActiveFolder={(folder) => {
            setActiveFolder(folder);
            handleBackToList();
          }}
          activeCategory={activeCategory}
          setActiveCategory={(cat) => {
            setActiveCategory(cat);
            handleBackToList();
          }}
          onOpenCompose={() => {
            setComposeInitialData({ recruiter: null, subject: "", body: "" });
            setIsComposeOpen(true);
          }}
          counts={counts}
          onTriggerSimulation={() => setShowSimulateModal(true)}
          isThreadSelected={!!selectedThread}
        />

        {/* Center Pane: Thread List OR Thread Details View */}
        <div className="flex-1 flex flex-col min-w-0 h-full border-r border-slate-200/80 bg-white overflow-hidden">
          {selectedThread ? (
            <RecruiterThreadView
              thread={selectedThread}
              onBack={handleBackToList}
              onToggleStar={handleToggleStar}
              onArchive={handleArchive}
              onTrash={handleTrash}
              onMarkUnread={handleMarkRead}
              onUpdateCategory={handleUpdateCategory}
              onSendReply={handleSendReply}
              onSimulateReply={(tId) => setShowSimulateModal(true)}
              isSendingReply={isSendingReply}
              adminUser={user}
              showProfileDrawer={showProfileDrawer}
              setShowProfileDrawer={setShowProfileDrawer}
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
                onBulkMarkUnread={handleBulkMarkRead}
                onBulkStar={handleBulkStar}
                onBulkArchive={handleBulkArchive}
                onBulkTrash={handleBulkTrash}
                onRefresh={loadData}
                isRefreshing={isRefreshing}
                activeFolder={activeFolder}
                activeCategory={activeCategory}
                totalCount={filteredThreads.length}
                onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
              />

              {/* Thread List */}
              <RecruiterThreadList
                threads={filteredThreads}
                selectedThreadId={selectedThreadId}
                onSelectThread={handleSelectThread}
                selectedThreadIds={selectedThreadIds}
                onToggleCheckThread={handleToggleCheckThread}
                onToggleStar={handleToggleStar}
                onMarkRead={handleMarkRead}
                onArchive={handleArchive}
                onTrash={handleTrash}
                searchQuery={searchQuery}
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

        {/* Right Drawer: Recruiter Context Details */}
        {selectedThread && showProfileDrawer && (
          <>
            {/* Backdrop on < xl */}
            <div
              className="fixed inset-0 bg-black/40 z-40 xl:hidden backdrop-blur-2xs transition-opacity"
              onClick={() => setShowProfileDrawer(false)}
            />

            {/* Slide-over Drawer on < xl, in-flow column on xl+ */}
            <div className="fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] shadow-2xl xl:shadow-none xl:static xl:z-auto xl:w-80 shrink-0 h-full bg-white flex flex-col transition-transform duration-300">
              <RecruiterProfileDrawer
                recruiter={selectedThread.recruiter}
                totalMessagesCount={selectedThread.messages?.length || 1}
                onClose={() => setShowProfileDrawer(false)}
              />
            </div>
          </>
        )}
      </div>

      {/* Mobile Floating Action Button for Compose (Visible only in Inbox list view) */}
      {!selectedThread && (
        <button
          onClick={() => {
            setComposeInitialData({ recruiter: null, subject: "", body: "" });
            setIsComposeOpen(true);
          }}
          className="md:hidden fixed bottom-6 right-5 z-30 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#16730F] to-[#10540b] hover:from-[#13610d] hover:to-[#0c4008] text-white rounded-full font-bold text-xs shadow-xl shadow-[#16730F]/30 active:scale-95 transition-all cursor-pointer"
          id="btn-mobile-fab-compose"
          title="Compose new email"
        >
          <Send size={15} />
          <span>Compose</span>
        </button>
      )}

      {/* Floating Gmail-Style Dockable Composer */}
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

      {/* Simulation Modal for Real-time Inbound Replies */}
      <SimulateReplyModal
        isOpen={showSimulateModal}
        onClose={() => setShowSimulateModal(false)}
        threads={threads}
        onExecuteSimulation={handleExecuteSimulation}
      />
    </div>
  );
};

export default AdminRecruiterMail;

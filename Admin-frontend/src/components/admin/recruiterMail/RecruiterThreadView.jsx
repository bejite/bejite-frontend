import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Star,
  Archive,
  Trash2,
  Mail,
  Reply,
  Forward,
  Paperclip,
  Send,
  Sparkles,
  CheckCircle,
  Building,
  User,
  Clock,
  Download,
  Copy,
  Check,
  Tag,
  Info,
  X,
  FileText,
  Bold,
  Italic,
  List,
  Quote,
  CornerDownLeft,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import {
  RECRUITER_CATEGORIES,
  DEFAULT_TEMPLATES,
} from "../../../services/recruiterMailService";
import { toast } from "react-toastify";

export const RecruiterThreadView = ({
  thread,
  onBack,
  onToggleStar,
  onArchive,
  onTrash,
  onMarkUnread,
  onUpdateCategory,
  onSendReply,
  onSimulateReply,
  isSendingReply,
  adminUser,
  showProfileDrawer,
  setShowProfileDrawer,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [replyAttachments, setReplyAttachments] = useState([]);
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const fileInputRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const moreMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target)) {
        setShowCategoryMenu(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!thread) return null;

  const messages = thread.messages || [];
  const recruiter = thread.recruiter || {};
  const currentCategory = RECRUITER_CATEGORIES.find((c) => c.id === thread.category);

  const handleCopyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    toast.info("Message text copied to clipboard");
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleAddAttachment = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newAttachments = files.map((f) => ({
      name: f.name,
      size: `${(f.size / 1024).toFixed(1)} KB`,
      type: f.name.split(".").pop(),
    }));

    setReplyAttachments((prev) => [...prev, ...newAttachments]);
  };

  const handleRemoveAttachment = (idx) => {
    setReplyAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleInsertTemplate = (tpl) => {
    const recName = recruiter.name ? recruiter.name.split(" ")[0] : "there";
    const compName = recruiter.company || "your company";
    const admName = adminUser?.firstName || "Bejite Team";

    let customized = tpl.body
      .replace(/{{recruiter_name}}/g, recName)
      .replace(/{{company_name}}/g, compName)
      .replace(/{{admin_name}}/g, admName);

    setReplyBody((prev) => (prev ? `${prev}\n\n${customized}` : customized));
    setShowTemplateMenu(false);
    setIsReplying(true);
    toast.success(`Loaded template: "${tpl.title}"`);
  };

  // Quick 1-click quick suggestion pills
  const QUICK_REPLIES = [
    { label: "Send Candidate Profiles", text: `Hi ${recruiter.name?.split(" ")[0] || "there"},\n\nI have gathered 3 top-tier verified candidate summaries with their technical scores. Would you like me to share their profiles here or over a quick 10-minute briefing?` },
    { label: "Schedule Call", text: `Hi ${recruiter.name?.split(" ")[0] || "there"},\n\nI'd be happy to discuss your hiring goals and candidate requirements directly. What day this week works best for a quick 15-min call?` },
    { label: "Badge Verification", text: `Hello ${recruiter.name?.split(" ")[0] || "there"},\n\nWe can expedite the verification of your recruiter profile and activate your verified badge today. Could you confirm your official company website and primary contact number?` },
  ];

  const handleQuickInsert = (text) => {
    setReplyBody((prev) => (prev ? `${prev}\n\n${text}` : text));
    setIsReplying(true);
  };

  const handleSubmitReply = async (e) => {
    if (e) e.preventDefault();
    if (!replyBody.trim()) {
      toast.warn("Please write your reply before sending");
      return;
    }

    try {
      await onSendReply({
        threadId: thread.id,
        body: replyBody.trim(),
        attachments: replyAttachments,
      });
      setReplyBody("");
      setReplyAttachments([]);
      setIsReplying(false);
      toast.success(`Reply sent to ${recruiter.name}!`);
    } catch (err) {
      toast.error("Failed to send reply");
    }
  };

  const formatMessageDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const timeStr = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    if (isToday) return `Today, ${timeStr}`;
    return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${timeStr}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden min-h-0 w-full max-w-full">
      {/* Top Action Bar */}
      <div className="bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-3 sm:px-4 py-2 sm:py-2.5 shrink-0 flex items-center justify-between gap-1.5 sm:gap-2 select-none w-full max-w-full relative z-20">
        {/* Left: Back Button */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-700 bg-slate-100 hover:text-slate-900 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-all cursor-pointer text-xs font-bold shrink-0"
            title="Return to thread list"
          >
            <ArrowLeft size={15} />
            <span>Inbox</span>
          </button>

          {/* Desktop-only Quick Actions Divider */}
          <div className="hidden sm:block h-4 w-px bg-slate-200 mx-1"></div>

          {/* Desktop-only action items */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => onArchive(thread.id)}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="Archive conversation"
            >
              <Archive size={16} />
            </button>
            <button
              onClick={() => onTrash(thread.id)}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Move to trash"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => onMarkUnread(thread.id, false)}
              className="p-1.5 text-slate-500 hover:text-[#16730F] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              title="Mark as unread"
            >
              <Mail size={16} />
            </button>
            <button
              onClick={() => onToggleStar(thread.id)}
              className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
              title={thread.isStarred ? "Starred" : "Star conversation"}
            >
              <Star
                size={16}
                className={
                  thread.isStarred
                    ? "text-amber-500 fill-amber-500"
                    : "text-slate-400"
                }
              />
            </button>

            {/* Category Dropdown (Desktop) */}
            <div className="relative" ref={categoryMenuRef}>
              <button
                type="button"
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                  currentCategory
                    ? `${currentCategory.color}`
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
                title="Assign category tag"
              >
                <Tag size={13} className={currentCategory ? "" : "text-slate-400"} />
                <span>{currentCategory ? currentCategory.label : "Label"}</span>
                <ChevronDown size={11} className={currentCategory ? "" : "text-slate-400"} />
              </button>

              {showCategoryMenu && (
                <div className="absolute left-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-fadeIn">
                  <div className="px-3 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1 mb-1">
                    <span>Select Category</span>
                    {thread.category && (
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateCategory(thread.id, null);
                          setShowCategoryMenu(false);
                          toast.info("Category removed");
                        }}
                        className="text-[10px] text-rose-600 hover:underline font-bold capitalize cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {RECRUITER_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        const newCat = thread.category === cat.id ? null : cat.id;
                        onUpdateCategory(thread.id, newCat);
                        setShowCategoryMenu(false);
                        if (newCat) {
                          toast.success(`Tagged as ${cat.label}`);
                        } else {
                          toast.info("Category removed");
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-slate-50 cursor-pointer ${
                        thread.category === cat.id ? "text-[#16730F] font-bold bg-emerald-50/50" : "text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            cat.id === "active_hiring"
                              ? "bg-emerald-500"
                              : cat.id === "candidate_review"
                              ? "bg-blue-500"
                              : cat.id === "partnership"
                              ? "bg-purple-500"
                              : "bg-amber-500"
                          }`}
                        />
                        <span>{cat.label}</span>
                      </div>
                      {thread.category === cat.id && <Check size={14} className="text-[#16730F]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Mobile Clean Icon Bar OR Desktop Full Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile Action Icons (< sm) */}
          <div className="flex sm:hidden items-center gap-0.5">
            <button
              onClick={() => onToggleStar(thread.id)}
              className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg"
              title="Star"
            >
              <Star
                size={16}
                className={thread.isStarred ? "text-amber-500 fill-amber-500" : ""}
              />
            </button>
            <button
              onClick={() => onArchive(thread.id)}
              className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg"
              title="Archive"
            >
              <Archive size={16} />
            </button>
            <button
              onClick={() => onTrash(thread.id)}
              className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>

            {/* Mobile More Options Dropdown */}
            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer"
                title="More actions"
              >
                <MoreVertical size={16} />
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fadeIn divide-y divide-slate-100">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        onMarkUnread(thread.id, false);
                        setShowMoreMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <Mail size={14} className="text-slate-400" />
                      <span>Mark as Unread</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSimulateReply(thread.id);
                        setShowMoreMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-900 bg-amber-50/50 hover:bg-amber-100/60 font-semibold cursor-pointer"
                    >
                      <Sparkles size={14} className="text-amber-600" />
                      <span>Simulate Reply</span>
                    </button>
                  </div>
                  <div className="py-1">
                    <div className="px-3 py-1 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Assign Label</span>
                      {thread.category && (
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateCategory(thread.id, null);
                            setShowMoreMenu(false);
                            toast.info("Category removed");
                          }}
                          className="text-[10px] text-rose-600 hover:underline font-bold capitalize cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {RECRUITER_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          const newCat = thread.category === cat.id ? null : cat.id;
                          onUpdateCategory(thread.id, newCat);
                          setShowMoreMenu(false);
                          if (newCat) {
                            toast.success(`Tagged as ${cat.label}`);
                          } else {
                            toast.info("Category removed");
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs cursor-pointer ${
                          thread.category === cat.id ? "text-[#16730F] font-bold bg-emerald-50/50" : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              cat.id === "active_hiring"
                                ? "bg-emerald-500"
                                : cat.id === "candidate_review"
                                ? "bg-blue-500"
                                : cat.id === "partnership"
                                ? "bg-purple-500"
                                : "bg-amber-500"
                            }`}
                          />
                          <span>{cat.label}</span>
                        </div>
                        {thread.category === cat.id && (
                          <Check size={13} className="text-[#16730F]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Quick Simulator Trigger */}
          <button
            onClick={() => onSimulateReply(thread.id)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200/80 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-2xs"
            title="Simulate recruiter sending an instant reply to this thread"
          >
            <Sparkles size={13} className="text-amber-600" />
            <span>Simulate Reply</span>
          </button>

          {/* Recruiter Profile Panel Toggle */}
          <button
            onClick={() => setShowProfileDrawer(!showProfileDrawer)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              showProfileDrawer
                ? "bg-[#16730F]/10 text-[#16730F] border-[#16730F]/30"
                : "text-slate-600 hover:bg-slate-100 border-slate-200 bg-white"
            }`}
            title="View recruiter information and private notes"
          >
            <Info size={14} />
            <span className="hidden sm:inline">Recruiter Info</span>
          </button>
        </div>
      </div>

      {/* Thread Content Scroll Area */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden nfl-scroll p-3.5 sm:p-5 md:p-6 space-y-4 sm:space-y-5 pb-24 sm:pb-16 w-full max-w-full">
        {/* Subject Header & Recruiter Identity Bar */}
        <div className="border-b border-slate-100 pb-3.5 sm:pb-4 w-full max-w-full">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {currentCategory && (
              <span
                className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold border ${currentCategory.color}`}
              >
                {currentCategory.label}
              </span>
            )}
            <span className="text-[11px] text-slate-400 font-medium">
              {messages.length} {messages.length === 1 ? "message" : "messages"}
            </span>
          </div>

          <h1 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 tracking-tight break-words leading-snug mb-2">
            {thread.subject}
          </h1>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
            <span className="font-bold text-slate-900">{recruiter.name}</span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
              <Building size={11} className="text-slate-400" />
              {recruiter.company}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400 truncate max-w-[170px] sm:max-w-xs">{recruiter.email}</span>
          </div>
        </div>

        {/* Message Chronological Stack */}
        <div className="space-y-4">
          {messages.map((msg, index) => {
            const isAdmin = msg.senderType === "admin";
            return (
              <div
                key={msg.id || index}
                className={`rounded-2xl border transition-all ${
                  isAdmin
                    ? "bg-white border-slate-200 shadow-2xs"
                    : "bg-emerald-50/20 border-emerald-200/70 shadow-2xs"
                }`}
              >
                {/* Professional Responsive Message Header */}
                <div className="p-3.5 sm:p-4 md:px-5 border-b border-slate-100/90">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    {/* Avatar */}
                    <div className="shrink-0">
                      {isAdmin ? (
                        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-tr from-[#16730F] to-[#10540b] text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs">
                          B
                        </div>
                      ) : recruiter.avatar ? (
                        <img
                          src={recruiter.avatar}
                          alt={recruiter.name}
                          className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover border border-emerald-300"
                        />
                      ) : (
                        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs">
                          {recruiter.name?.[0]?.toUpperCase() || "R"}
                        </div>
                      )}
                    </div>

                    {/* Sender Details & Timestamp (Never wraps awkwardly) */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {msg.senderName}
                          </span>
                          <span
                            className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                              isAdmin
                                ? "bg-slate-100 text-slate-700"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {isAdmin ? "Admin" : "Recruiter"}
                          </span>
                        </div>

                        {/* Timestamp on far right */}
                        <span className="text-[10px] sm:text-xs text-slate-400 font-medium shrink-0">
                          {formatMessageDate(msg.timestamp)}
                        </span>
                      </div>

                      {/* Recipient & Status Sub-line */}
                      <div className="flex items-center justify-between gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span className="truncate">
                          to {isAdmin ? (recruiter.name || recruiter.email) : "admin@bejite.com"}
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {msg.deliveryStatus && (
                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle size={10} />
                              <span>{msg.deliveryStatus}</span>
                            </span>
                          )}
                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.body)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title="Copy email body"
                          >
                            {copiedMsgId === msg.id ? (
                              <Check size={12} className="text-emerald-600" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Body Content */}
                <div className="p-3.5 sm:p-5 md:p-6 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-sans select-text break-words">
                  {msg.body}
                </div>

                {/* Attachments Section */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="px-3.5 sm:px-5 pb-3.5 pt-2 border-t border-slate-100 bg-slate-50/50">
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Paperclip size={12} />
                      <span>Attached Files ({msg.attachments.length})</span>
                    </p>
                    <div className="flex flex-wrap gap-2 max-w-full overflow-hidden">
                      {msg.attachments.map((att, i) => {
                        const isPdf = att.name.toLowerCase().endsWith(".pdf");
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-700 transition-all shadow-2xs group cursor-pointer max-w-full"
                          >
                            <div
                              className={`p-1 rounded-lg shrink-0 ${
                                isPdf ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-[#16730F]"
                              }`}
                            >
                              <FileText size={15} />
                            </div>
                            <div className="flex flex-col min-w-0 max-w-[150px] sm:max-w-[220px]">
                              <span className="font-semibold text-slate-800 truncate">
                                {att.name}
                              </span>
                              <span className="text-[10px] text-slate-400">{att.size}</span>
                            </div>
                            <Download
                              size={13}
                              className="text-slate-400 group-hover:text-slate-700 ml-1 shrink-0"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="w-full max-w-full min-w-0 overflow-hidden pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full max-w-full">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 select-none mr-0.5">
              Suggestions:
            </span>
            {QUICK_REPLIES.map((qr, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickInsert(qr.text)}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-50/70 hover:bg-emerald-100/90 text-[#16730F] rounded-full border border-emerald-200/70 transition-all shrink-0 cursor-pointer flex items-center gap-1 active:scale-95"
              >
                <span className="text-emerald-600 font-bold">+</span>
                <span>{qr.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Inline Reply Trigger Box */}
        {!isReplying ? (
          <div
            onClick={() => setIsReplying(true)}
            className="flex items-center justify-between p-3 sm:p-3.5 bg-slate-50 hover:bg-white border border-slate-200/90 hover:border-[#16730F]/40 rounded-xl cursor-pointer text-slate-500 hover:text-slate-800 hover:shadow-2xs transition-all duration-150 group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-[#16730F]/10 text-[#16730F] flex items-center justify-center font-bold shrink-0 group-hover:bg-[#16730F] group-hover:text-white transition-colors">
                <Reply size={14} />
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-600 truncate">
                Reply to <strong className="text-slate-900">{recruiter.name}</strong>...
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                Press R to reply
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden animate-fadeIn">
              {/* Reply Header */}
              <div className="px-5 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Reply size={15} className="text-[#16730F]" />
                  <span>
                    Replying to: <strong>{recruiter.email}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setIsReplying(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50"
                  title="Close reply"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Editor Textarea */}
              <div className="p-4">
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder={`Hi ${recruiter.name ? recruiter.name.split(" ")[0] : "there"}, write your message here...`}
                  rows={6}
                  className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-y leading-relaxed font-sans"
                  autoFocus
                />

                {/* Attached Files List */}
                {replyAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 mt-2">
                    {replyAttachments.map((att, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium"
                      >
                        <Paperclip size={12} />
                        <span className="max-w-[150px] truncate">{att.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(idx)}
                          className="hover:text-rose-600 cursor-pointer ml-0.5"
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Formatting & Action Toolbar */}
              <div className="px-3 sm:px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 w-full max-w-full">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {/* File Attachment Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAddAttachment}
                    multiple
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                    title="Attach file"
                  >
                    <Paperclip size={16} />
                  </button>

                  {/* Pre-made Templates Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowTemplateMenu(!showTemplateMenu)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                      title="Insert pre-made template"
                    >
                      <Sparkles size={13} className="text-[#16730F]" />
                      <span>Template</span>
                    </button>

                    {showTemplateMenu && (
                      <div className="fixed sm:absolute inset-x-3 bottom-14 sm:inset-x-auto sm:left-0 sm:bottom-full mb-2 w-auto sm:w-72 max-h-60 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-fadeIn">
                        <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Recruiter Templates
                        </p>
                        {DEFAULT_TEMPLATES.map((tpl) => (
                          <button
                            key={tpl.id}
                            type="button"
                            onClick={() => handleInsertTemplate(tpl)}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer text-slate-700"
                          >
                            <div className="font-bold text-slate-900 truncate">
                              {tpl.title}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {tpl.subject}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Send and Discard Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsReplying(false);
                      setReplyBody("");
                      setReplyAttachments([]);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitReply}
                    disabled={isSendingReply || !replyBody.trim()}
                    className="flex items-center gap-2 px-5 py-2 bg-[#16730F] hover:bg-[#125e0c] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    {isSendingReply ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Reply</span>
                        <Send size={13} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

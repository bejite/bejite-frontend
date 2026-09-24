import React from "react";
import {
  Star,
  Paperclip,
  CheckSquare,
  Square,
  Mail,
  MailOpen,
  Archive,
  Trash2,
  Inbox,
  Send,
  Building,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { RECRUITER_CATEGORIES } from "../../../services/recruiterMailService";

export const RecruiterThreadList = ({
  threads,
  selectedThreadId,
  onSelectThread,
  selectedThreadIds,
  onToggleCheckThread,
  onToggleStar,
  onMarkRead,
  onArchive,
  onTrash,
  searchQuery,
  onOpenCompose,
}) => {
  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  if (!threads || threads.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 text-center bg-white min-h-[350px]">
        <div className="h-16 w-16 bg-emerald-50 text-[#16730F] rounded-2xl flex items-center justify-center mb-4 border border-emerald-100 shadow-xs">
          <Inbox size={30} />
        </div>
        <h3 className="text-sm font-bold text-slate-800 mb-1">
          {searchQuery ? "No matching conversations" : "Mailbox is clear"}
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mb-5 leading-relaxed">
          {searchQuery
            ? `No emails match "${searchQuery}". Check for typos or clear your search query.`
            : "No recruiter emails in this view. Reach out to recruiters to start a conversation."}
        </p>
        <button
          onClick={onOpenCompose}
          className="flex items-center gap-2 px-4 py-2 bg-[#16730F] hover:bg-[#125e0c] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Send size={13} />
          <span>New Outreach Email</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto nfl-scroll bg-white divide-y divide-slate-100 select-none">
      {threads.map((thread) => {
        const isChecked = selectedThreadIds.includes(thread.id);
        const isCurrentActive = selectedThreadId === thread.id;
        const lastMsg = thread.messages?.[thread.messages.length - 1] || {};
        const isUnread = !thread.isRead;
        const hasAttachments = thread.messages?.some(
          (m) => m.attachments && m.attachments.length > 0
        );

        const isAwaitingAdmin = lastMsg.senderType === "recruiter";
        const messageCount = thread.messages?.length || 1;
        const categoryObj = RECRUITER_CATEGORIES.find((c) => c.id === thread.category);

        return (
          <div
            key={thread.id}
            onClick={() => onSelectThread(thread)}
            className={`group relative flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-3.5 py-3 sm:py-2.5 cursor-pointer transition-all duration-150 border-l-4 w-full max-w-full overflow-hidden ${
              isCurrentActive
                ? "bg-[#16730F]/10 border-[#16730F]"
                : isUnread
                ? "bg-emerald-50/25 hover:bg-emerald-50/40 border-emerald-500"
                : "hover:bg-slate-50/80 bg-white border-transparent"
            }`}
          >
            {/* Top row on Mobile / Left items on Desktop */}
            <div className="flex items-center justify-between sm:justify-start gap-2.5 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                {/* Checkbox */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCheckThread(thread.id);
                  }}
                  className="text-slate-300 hover:text-slate-700 p-0.5 rounded cursor-pointer shrink-0 transition-colors"
                >
                  {isChecked ? (
                    <CheckSquare size={17} className="text-[#16730F]" />
                  ) : (
                    <Square size={17} className="group-hover:text-slate-400" />
                  )}
                </div>

                {/* Star Toggle */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(thread.id);
                  }}
                  className="text-slate-300 hover:text-amber-500 p-0.5 rounded cursor-pointer shrink-0 transition-colors"
                  title={thread.isStarred ? "Starred" : "Star message"}
                >
                  <Star
                    size={17}
                    className={
                      thread.isStarred
                        ? "text-amber-500 fill-amber-500"
                        : "group-hover:text-slate-400"
                    }
                  />
                </div>

                {/* Recruiter Avatar */}
                <div className="relative shrink-0">
                  {thread.recruiter?.avatar ? (
                    <img
                      src={thread.recruiter.avatar}
                      alt={thread.recruiter.name}
                      className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-tr from-[#16730F] to-[#125e0c] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      {thread.recruiter?.name?.[0]?.toUpperCase() || "R"}
                    </div>
                  )}
                  {thread.recruiter?.verified && (
                    <span
                      className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-2xs"
                      title="Verified Recruiter"
                    >
                      <CheckCircle size={10} className="text-emerald-600 fill-emerald-100" />
                    </span>
                  )}
                </div>

                {/* Recruiter Name & Company */}
                <div className="min-w-0 sm:w-36 md:w-44 lg:w-48 shrink-0 pr-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className={`text-xs truncate ${
                        isUnread ? "font-bold text-slate-900" : "font-medium text-slate-800"
                      }`}
                    >
                      {thread.recruiter?.name}
                    </span>
                    {messageCount > 1 && (
                      <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                        ({messageCount})
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                    <Building size={10} className="text-slate-400 shrink-0" />
                    <span className="truncate">{thread.recruiter?.company || "Recruiter"}</span>
                  </div>
                </div>
              </div>

              {/* Time display on mobile (hidden on desktop, handled in right column) */}
              <div className="sm:hidden flex items-center gap-1.5 shrink-0">
                {isAwaitingAdmin && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                )}
                <span
                  className={`text-[11px] ${
                    isUnread ? "font-bold text-[#16730F]" : "text-slate-400"
                  }`}
                >
                  {formatTime(thread.lastActivity)}
                </span>
              </div>
            </div>

            {/* Subject Line & Content Snippet Preview */}
            <div className="flex-1 min-w-0 flex items-center gap-2 pl-9 sm:pl-0 w-full">
              <div className="truncate text-xs min-w-0 flex-1">
                <span
                  className={`${
                    isUnread ? "font-bold text-slate-900" : "font-medium text-slate-700"
                  }`}
                >
                  {thread.subject}
                </span>
                <span className="text-slate-300 font-normal mx-1 hidden sm:inline">•</span>
                <span className="text-slate-400 font-normal truncate block sm:inline mt-0.5 sm:mt-0">
                  {lastMsg.body?.replace(/\n/g, " ").slice(0, 95) || "No preview content"}
                </span>
              </div>

              {/* Category Tag (Desktop) */}
              {categoryObj && (
                <span
                  className={`hidden xl:inline-flex items-center text-[10px] px-2 py-0.5 rounded-md font-semibold shrink-0 border ${categoryObj.color}`}
                >
                  {categoryObj.label}
                </span>
              )}

              {/* Status Indicator Badges (Desktop) */}
              {isAwaitingAdmin ? (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Needs Reply
                </span>
              ) : messageCount > 2 ? (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                  <MessageSquare size={10} />
                  In Dialogue
                </span>
              ) : null}

              {/* Attachments Indicator */}
              {hasAttachments && (
                <Paperclip size={13} className="text-slate-400 shrink-0" title="Has attachments" />
              )}
            </div>

            {/* Desktop Timestamp & Hover Action Strip */}
            <div className="hidden sm:flex shrink-0 items-center justify-end pl-2">
              {/* Normal Time (hidden when row hovered) */}
              <span
                className={`text-[11px] group-hover:hidden transition-all ${
                  isUnread ? "font-bold text-[#16730F]" : "text-slate-400"
                }`}
              >
                {formatTime(thread.lastActivity)}
              </span>

              {/* Floating Action Strip on Hover */}
              <div className="hidden group-hover:flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-lg border border-slate-200/80 shadow-xs animate-fadeIn">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkRead(thread.id, !thread.isRead);
                  }}
                  className="p-1 text-slate-400 hover:text-[#16730F] hover:bg-emerald-50 rounded-md transition-colors"
                  title={thread.isRead ? "Mark as unread" : "Mark as read"}
                >
                  {thread.isRead ? <Mail size={15} /> : <MailOpen size={15} />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(thread.id);
                  }}
                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Archive thread"
                >
                  <Archive size={15} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTrash(thread.id);
                  }}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  title="Move to trash"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

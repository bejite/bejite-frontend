import React from "react";
import {
  CheckSquare,
  Square,
  Mail,
  MailOpen,
  Trash2,
  Inbox,
  Send,
  Paperclip,
} from "lucide-react";
import { getThreadContact } from "../../../services/recruiterMailService";

export const RecruiterThreadList = ({
  threads = [],
  selectedThreadId,
  onSelectThread,
  selectedThreadIds = [],
  onToggleCheckThread,
  onMarkRead,
  onTrash,
  searchQuery = "",
  onOpenCompose,
  activeFolder = "inbox",
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
    const isSent = activeFolder === "sent";
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 text-center bg-white min-h-[350px]">
        <div className="h-16 w-16 bg-emerald-50 text-[#16730F] rounded-2xl flex items-center justify-center mb-4 border border-emerald-100 shadow-xs">
          {isSent ? <Send size={28} /> : <Inbox size={28} />}
        </div>
        <h3 className="text-sm font-bold text-slate-800 mb-1">
          {searchQuery
            ? "No matching emails found"
            : isSent
            ? "No sent messages"
            : "Your inbox is empty"}
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mb-5 leading-relaxed">
          {searchQuery
            ? `No emails match "${searchQuery}". Check for typos or clear your search query.`
            : isSent
            ? "Emails you send to users or external recipients will appear here."
            : "Incoming messages from users and external contacts will appear here."}
        </p>
        <button
          type="button"
          onClick={onOpenCompose}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#16730F] hover:bg-[#125e0c] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Send size={13} />
          <span>Compose New Email</span>
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
          (m) => m.attachments && m.attachments.length > 0,
        );
        const contact = getThreadContact(thread);
        const messageCount = thread.messages?.length || 1;

        // Initials for avatar
        const initials = (contact.name || contact.email || "U")
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();

        return (
          <div
            key={thread.id}
            onClick={() => onSelectThread(thread)}
            className={`group relative flex items-center gap-3 px-3.5 py-3 cursor-pointer transition-all duration-150 border-l-4 w-full max-w-full overflow-hidden ${
              isCurrentActive
                ? "bg-[#16730F]/10 border-[#16730F]"
                : isUnread
                ? "bg-emerald-50/30 hover:bg-emerald-50/50 border-emerald-500"
                : "hover:bg-slate-50/80 bg-white border-transparent"
            }`}
          >
            {/* Checkbox */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                onToggleCheckThread(thread.id);
              }}
              className="text-slate-300 hover:text-slate-700 p-1 rounded cursor-pointer shrink-0 transition-colors"
            >
              {isChecked ? (
                <CheckSquare size={17} className="text-[#16730F]" />
              ) : (
                <Square size={17} className="group-hover:text-slate-400" />
              )}
            </div>

            {/* Contact Avatar Circle */}
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#16730F] to-[#125e0c] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              {initials}
            </div>

            {/* Contact Name & Subject */}
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              {/* Row 1: Contact Name and Time */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className={`text-xs truncate ${
                      isUnread
                        ? "font-bold text-slate-900"
                        : "font-semibold text-slate-700"
                    }`}
                  >
                    {activeFolder === "sent" ? `To: ${contact.name}` : contact.name}
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal truncate hidden sm:inline">
                    &lt;{contact.email}&gt;
                  </span>
                  {messageCount > 1 && (
                    <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                      ({messageCount})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {hasAttachments && (
                    <Paperclip size={13} className="text-slate-400" />
                  )}
                  <span
                    className={`text-[11px] ${
                      isUnread
                        ? "font-bold text-[#16730F]"
                        : "text-slate-400 font-medium"
                    }`}
                  >
                    {formatTime(thread.lastActivity)}
                  </span>
                  {isUnread && (
                    <span className="w-2 h-2 rounded-full bg-[#16730F] shrink-0" />
                  )}
                </div>
              </div>

              {/* Row 2: Subject & Message Snippet */}
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <p className="text-xs text-slate-500 truncate min-w-0">
                  <span
                    className={`font-medium ${
                      isUnread ? "text-slate-900 font-bold" : "text-slate-700"
                    }`}
                  >
                    {thread.subject || "No Subject"}
                  </span>
                  <span className="mx-1.5 text-slate-300">•</span>
                  <span className="text-slate-400">
                    {lastMsg.body?.replace(/\n+/g, " ") || "No message content"}
                  </span>
                </p>

                {/* Hover Quick Actions */}
                <div
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onMarkRead(thread.id, isUnread)}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
                    title={isUnread ? "Mark as read" : "Mark as unread"}
                  >
                    {isUnread ? <MailOpen size={14} /> : <Mail size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => onTrash(thread.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title="Delete email"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

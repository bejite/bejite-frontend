import React, { useState, useRef } from "react";
import {
  ArrowLeft,
  Trash2,
  Mail,
  Send,
  Paperclip,
  X,
  FileText,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "react-toastify";
import { getThreadContact } from "../../../services/recruiterMailService";
import { filesToMailboxAttachments } from "../../../utils/mailboxAttachments";

export const RecruiterThreadView = ({
  thread,
  onBack,
  onTrash,
  onMarkUnread,
  onSendReply,
  isSendingReply = false,
  adminUser: _adminUser,
}) => {
  const [replyBody, setReplyBody] = useState("");
  const [replyAttachmentFiles, setReplyAttachmentFiles] = useState([]);
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const fileInputRef = useRef(null);

  if (!thread) return null;

  const messages = thread.messages || [];
  const contact = getThreadContact(thread);

  const handleCopyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    toast.info("Message copied to clipboard");
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleAddAttachment = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setReplyAttachmentFiles((prev) => {
      const next = [...prev, ...files].slice(0, 3);
      if (prev.length + files.length > 3) {
        toast.warning("You can attach at most 3 files.");
      }
      return next;
    });
    e.target.value = "";
  };

  const handleRemoveAttachment = (idx) => {
    setReplyAttachmentFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleExecuteReply = async (e) => {
    e.preventDefault();
    if (!replyBody.trim() && replyAttachmentFiles.length === 0) {
      toast.warning("Please type a message to reply");
      return;
    }

    try {
      const attachments = await filesToMailboxAttachments(replyAttachmentFiles);
      const result = await onSendReply({
        threadId: thread.id,
        body: replyBody.trim(),
        attachments,
      });
      setReplyBody("");
      setReplyAttachmentFiles([]);
      if (result?.delivered === false) {
        toast.warning(
          result.deliveryMessage || "Reply saved, but it was not delivered.",
        );
      } else {
        toast.success(`Reply sent to ${contact.name}`);
      }
    } catch (err) {
      console.error("Failed to send reply:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to send reply. Please try again.",
      );
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 overflow-hidden min-w-0">
      {/* Top Action Bar */}
      <div className="bg-white border-b border-slate-200/80 px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-2 shrink-0">
        {/* Left: Back button & Subject */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
            title="Back to email list"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <h2
            className="text-xs sm:text-sm font-extrabold text-slate-900 truncate"
            title={thread.subject}
          >
            {thread.subject || "No Subject"}
          </h2>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onMarkUnread(thread.id, false)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors"
            title="Mark as unread"
          >
            <Mail size={16} />
          </button>

          <button
            type="button"
            onClick={() => onTrash(thread.id)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium transition-colors"
            title="Delete conversation"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 min-h-0 overflow-y-auto nfl-scroll p-3 sm:p-5 space-y-4">
        {messages.map((msg, idx) => {
          const isAdmin = msg.senderType === "admin";
          const senderInitials = (msg.senderName || msg.senderEmail || "U")
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return (
            <div
              key={msg.id || idx}
              className={`rounded-2xl p-4 sm:p-5 transition-all shadow-xs border ${
                isAdmin
                  ? "bg-white border-slate-200/80 ml-0 sm:ml-6"
                  : "bg-emerald-50/20 border-emerald-200/60 mr-0 sm:mr-6"
              }`}
            >
              {/* Message Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-2xs ${
                      isAdmin
                        ? "bg-gradient-to-tr from-[#16730F] to-[#125e0c]"
                        : "bg-gradient-to-tr from-slate-700 to-slate-900"
                    }`}
                  >
                    {senderInitials}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {msg.senderName || msg.senderEmail}
                      </span>
                      {isAdmin && (
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-[#16730F] rounded text-[10px] font-bold">
                          Admin
                        </span>
                      )}
                      {isAdmin && msg.deliveryStatus === "sent" && (
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                          Delivered
                        </span>
                      )}
                      {isAdmin &&
                        (msg.deliveryStatus === "failed" ||
                          msg.deliveryStatus === "skipped") && (
                          <span
                            className="px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-bold"
                            title={msg.deliveryError || undefined}
                          >
                            Not delivered
                          </span>
                        )}
                      {isAdmin && msg.deliveryStatus === "pending" && (
                        <span className="px-1.5 py-0.5 bg-sky-50 text-sky-800 rounded text-[10px] font-bold">
                          Sending…
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      From: {msg.senderEmail || "contact@bejite.com"}
                      {" · "}
                      To: {msg.to || contact.email}
                    </div>
                    {isAdmin &&
                      msg.deliveryError &&
                      (msg.deliveryStatus === "failed" ||
                        msg.deliveryStatus === "skipped") && (
                        <div className="text-[11px] text-amber-700 mt-0.5">
                          {msg.deliveryError}
                        </div>
                      )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {formatDate(msg.timestamp)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyMessage(msg.id || idx, msg.body)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors"
                    title="Copy message text"
                  >
                    {copiedMsgId === (msg.id || idx) ? (
                      <Check size={13} className="text-emerald-600" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </div>
              </div>

              {/* Message Body */}
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                {msg.body}
              </div>

              {/* Attachments (if any) */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                  {msg.attachments.map((att, aIdx) => (
                    <div
                      key={aIdx}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                    >
                      <FileText size={14} className="text-slate-500" />
                      <span className="font-medium truncate max-w-[180px]">
                        {att.name}
                      </span>
                      {att.size && (
                        <span className="text-[10px] text-slate-400">
                          ({att.size})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Inline Reply Form */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200/80 shrink-0">
        <form onSubmit={handleExecuteReply} className="space-y-3">
          {/* Attachment list if files selected */}
          {replyAttachmentFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
              {replyAttachmentFiles.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                >
                  <FileText size={12} className="text-slate-500" />
                  <span className="truncate max-w-[140px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(idx)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Reply Textarea */}
          <div className="relative">
            <textarea
              rows={3}
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder={`Reply to ${contact.name} (${contact.email})...`}
              className="w-full text-xs sm:text-sm p-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#16730F] focus:ring-1 focus:ring-[#16730F] rounded-xl outline-hidden resize-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Bottom Bar: Attachments & Send */}
          <div className="flex items-center justify-between">
            <div>
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
                className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Paperclip size={14} />
                <span>Attach Files</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {replyBody && (
                <button
                  type="button"
                  onClick={() => {
                    setReplyBody("");
                    setReplyAttachmentFiles([]);
                  }}
                  className="px-3 py-1.5 text-slate-400 hover:text-slate-700 text-xs font-semibold"
                >
                  Clear
                </button>
              )}

              <button
                type="submit"
                disabled={
                  isSendingReply ||
                  (!replyBody.trim() && replyAttachmentFiles.length === 0)
                }
                className="flex items-center gap-2 px-4 py-2 bg-[#16730F] hover:bg-[#125e0c] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Send size={13} />
                <span>{isSendingReply ? "Sending..." : "Send Reply"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

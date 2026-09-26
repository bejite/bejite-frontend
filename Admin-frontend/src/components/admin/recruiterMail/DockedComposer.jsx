import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Minus,
  Maximize2,
  Minimize2,
  Send,
  Paperclip,
  Trash2,
  FileText,
} from "lucide-react";
import { toast } from "react-toastify";

export const DockedComposer = ({
  isOpen,
  onClose,
  onSend,
  recruitersDirectory = [],
  adminUser: _adminUser,
  initialToRecruiter = null,
  initialSubject = "",
  initialBody = "",
}) => {
  const [windowState, setWindowState] = useState("normal"); // "normal" | "minimized" | "maximized"
  const isMaximized = windowState === "maximized";
  const [toInput, setToInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef(null);
  const toFieldRef = useRef(null);

  // Initialize with initial props if provided
  useEffect(() => {
    if (initialToRecruiter) {
      setToInput(initialToRecruiter.email || "");
    }
    if (initialSubject) setSubject(initialSubject);
    if (initialBody) setBody(initialBody);
  }, [initialToRecruiter, initialSubject, initialBody]);

  // Click outside listener for suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (toFieldRef.current && !toFieldRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Filter contact suggestions if user is typing
  const filteredContacts = recruitersDirectory
    .filter((c) => {
      const q = toInput.toLowerCase().trim();
      if (!q) return false;
      return (
        c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
      );
    })
    .slice(0, 5);

  const handleSelectContact = (contact) => {
    setToInput(contact.email);
    setShowSuggestions(false);
  };

  const handleAddAttachment = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newAttachments = files.map((f) => ({
      name: f.name,
      size: `${(f.size / 1024).toFixed(1)} KB`,
      type: f.name.split(".").pop(),
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const handleRemoveAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const cleanTo = toInput.trim();
    if (!cleanTo) {
      toast.warning("Please specify a recipient email address");
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanTo)) {
      toast.warning("Please enter a valid email address");
      return;
    }

    if (!subject.trim()) {
      toast.warning("Please enter a subject");
      return;
    }

    if (!body.trim() && attachments.length === 0) {
      toast.warning("Please enter a message body");
      return;
    }

    setIsSending(true);
    try {
      await onSend({
        toEmail: cleanTo,
        toName: cleanTo.split("@")[0],
        subject: subject.trim(),
        body: body.trim(),
        attachments,
      });

      toast.success(`Email sent to ${cleanTo}`);
      // Reset form
      setToInput("");
      setSubject("");
      setBody("");
      setAttachments([]);
      onClose();
    } catch (err) {
      console.error("Failed to send email:", err);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleDiscard = () => {
    if (
      toInput ||
      subject ||
      body ||
      attachments.length > 0
    ) {
      if (window.confirm("Discard unsaved message?")) {
        setToInput("");
        setSubject("");
        setBody("");
        setAttachments([]);
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Minimized floating strip view
  if (windowState === "minimized") {
    return (
      <div className="fixed bottom-0 right-4 sm:right-6 z-50 w-72 bg-slate-900 text-white rounded-t-xl shadow-2xl border border-slate-700 p-3 flex items-center justify-between cursor-pointer animate-slideUp">
        <div
          className="flex items-center gap-2 truncate flex-1"
          onClick={() => setWindowState("normal")}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-xs font-bold truncate">
            {subject ? subject : "New Message"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setWindowState("normal")}
            className="p-1 hover:bg-slate-800 rounded text-slate-300"
          >
            <Maximize2 size={13} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded text-slate-300"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed z-50 transition-all duration-200 flex flex-col bg-white shadow-2xl border border-slate-300 ${
        isMaximized
          ? "inset-0 sm:inset-4 rounded-none sm:rounded-2xl"
          : "bottom-0 right-0 sm:right-6 w-full sm:w-[560px] md:w-[620px] max-h-[90vh] h-[540px] rounded-t-2xl sm:rounded-2xl"
      }`}
    >
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shrink-0 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold tracking-tight">
            New Message
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setWindowState("minimized")}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Minimize"
          >
            <Minus size={14} />
          </button>
          <button
            type="button"
            onClick={() =>
              setWindowState(isMaximized ? "normal" : "maximized")
            }
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={isMaximized ? "Restore window" : "Maximize window"}
          >
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            type="button"
            onClick={handleDiscard}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Form Area */}
      <form onSubmit={handleSend} className="flex-1 flex flex-col min-h-0 bg-white">
        {/* "To" Field */}
        <div
          ref={toFieldRef}
          className="relative px-4 py-2 border-b border-slate-200/80 flex items-center gap-3 shrink-0"
        >
          <span className="text-xs font-bold text-slate-400 w-12 shrink-0">
            To:
          </span>
          <input
            type="text"
            value={toInput}
            onChange={(e) => {
              setToInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Recipient email address (e.g. user@gmail.com, partner@company.com)..."
            className="flex-1 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-hidden bg-transparent"
          />

          {/* Autocomplete Suggestions (if any match) */}
          {showSuggestions && filteredContacts.length > 0 && (
            <div className="absolute left-16 right-4 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {filteredContacts.map((c, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectContact(c)}
                  className="px-3 py-2 hover:bg-emerald-50/50 cursor-pointer flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-800">{c.name}</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {c.email}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* "Subject" Field */}
        <div className="px-4 py-2 border-b border-slate-200/80 flex items-center gap-3 shrink-0">
          <span className="text-xs font-bold text-slate-400 w-12 shrink-0">
            Subject:
          </span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject..."
            className="flex-1 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-hidden bg-transparent"
          />
        </div>

        {/* Attachment List */}
        {attachments.length > 0 && (
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200/80 flex flex-wrap gap-2 shrink-0">
            {attachments.map((att, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700"
              >
                <FileText size={12} className="text-slate-500" />
                <span className="truncate max-w-[140px]">{att.name}</span>
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

        {/* Body Textarea */}
        <div className="flex-1 p-4 min-h-0">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message here..."
            className="w-full h-full text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-hidden resize-none leading-relaxed"
          />
        </div>

        {/* Bottom Action Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isSending}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#16730F] hover:bg-[#125e0c] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Send size={13} />
              <span>{isSending ? "Sending..." : "Send"}</span>
            </button>

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
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              title="Attach files"
            >
              <Paperclip size={17} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleDiscard}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title="Discard message"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

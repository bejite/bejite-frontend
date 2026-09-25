import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Minus,
  Maximize2,
  Minimize2,
  Send,
  Paperclip,
  Sparkles,
  Trash2,
  Building,
  CheckCircle,
  FileText,
  Clock,
  ChevronDown,
  Tag,
  Check,
} from "lucide-react";
import { DEFAULT_TEMPLATES, RECRUITER_CATEGORIES } from "../../../services/recruiterMailService";
import { toast } from "react-toastify";

export const DockedComposer = ({
  isOpen,
  onClose,
  onSend,
  recruitersDirectory = [],
  adminUser,
  initialToRecruiter = null,
  initialSubject = "",
  initialBody = "",
}) => {
  const [windowState, setWindowState] = useState("normal"); // "normal" | "minimized" | "maximized"
  const isMaximized = windowState === "maximized";
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [toInput, setToInput] = useState("");
  const [showRecruiterSuggestions, setShowRecruiterSuggestions] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("active_hiring");
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [showTemplatesMenu, setShowTemplatesMenu] = useState(false);
  const [showScheduleMenu, setShowScheduleMenu] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [ccInput, setCcInput] = useState("");

  const fileInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const toFieldRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const templatesMenuRef = useRef(null);
  const scheduleMenuRef = useRef(null);

  // Initialize with initial props if provided
  useEffect(() => {
    if (initialToRecruiter) {
      setSelectedRecruiter(initialToRecruiter);
      setToInput(initialToRecruiter.email);
    }
    if (initialSubject) setSubject(initialSubject);
    if (initialBody) setBody(initialBody);
  }, [initialToRecruiter, initialSubject, initialBody]);

  // Click outside listener for all floating menus
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (toFieldRef.current && !toFieldRef.current.contains(e.target)) {
        setShowRecruiterSuggestions(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target)) {
        setShowCategoryMenu(false);
      }
      if (templatesMenuRef.current && !templatesMenuRef.current.contains(e.target)) {
        setShowTemplatesMenu(false);
      }
      if (scheduleMenuRef.current && !scheduleMenuRef.current.contains(e.target)) {
        setShowScheduleMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Filter recruiter suggestions based on toInput
  const filteredRecruiters = recruitersDirectory.filter((r) => {
    const q = toInput.toLowerCase().trim();
    if (!q) return true;
    return (
      r.name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.company?.toLowerCase().includes(q)
    );
  }).slice(0, 6);

  const handleSelectRecruiter = (recruiter) => {
    setSelectedRecruiter(recruiter);
    setToInput(recruiter.email);
    setShowRecruiterSuggestions(false);
  };

  const handleInsertTemplate = (tpl) => {
    const recName = selectedRecruiter?.name ? selectedRecruiter.name.split(" ")[0] : "there";
    const compName = selectedRecruiter?.company || "your company";
    const admName = adminUser?.firstName || "Bejite Team";

    const customSubject = tpl.subject
      .replace(/{{recruiter_name}}/g, recName)
      .replace(/{{company_name}}/g, compName)
      .replace(/{{admin_name}}/g, admName);

    const customBody = tpl.body
      .replace(/{{recruiter_name}}/g, recName)
      .replace(/{{company_name}}/g, compName)
      .replace(/{{admin_name}}/g, admName);

    setSubject(customSubject);
    setBody(customBody);
    setShowTemplatesMenu(false);
    toast.success(`Loaded template: "${tpl.title}"`);
  };

  const handleInsertVariable = (varTag) => {
    const recName = selectedRecruiter?.name ? selectedRecruiter.name.split(" ")[0] : "Recruiter";
    const compName = selectedRecruiter?.company || "Company";
    const admName = adminUser?.firstName || "Admin";

    let val = varTag;
    if (varTag === "{{recruiter_name}}") val = recName;
    if (varTag === "{{company_name}}") val = compName;
    if (varTag === "{{admin_name}}") val = admName;

    setBody((prev) => (prev ? `${prev} ${val}` : val));
  };

  const handleFileChange = (e) => {
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

  const handleSend = async (isScheduled = false, scheduleTime = null) => {
    const finalToEmail = selectedRecruiter?.email || toInput.trim();
    if (!finalToEmail) {
      toast.warn("Please enter a recipient email address");
      return;
    }
    if (!subject.trim()) {
      toast.warn("Please add a subject for your email");
      return;
    }
    if (!body.trim()) {
      toast.warn("Please type your email message");
      return;
    }

    try {
      setIsSending(true);
      await onSend({
        toEmail: finalToEmail,
        toName: selectedRecruiter?.name || finalToEmail.split("@")[0],
        company: selectedRecruiter?.company || "Partner Company",
        subject: subject.trim(),
        body: body.trim(),
        attachments,
        category,
        scheduled: isScheduled ? scheduleTime : null,
      });

      toast.success(
        isScheduled
          ? `Email scheduled to send ${scheduleTime}!`
          : `Outreach email sent to ${finalToEmail}!`
      );
      onClose();
    } catch (err) {
      toast.error("Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  // Minimized state: sleek floating taskbar pill
  if (windowState === "minimized") {
    return (
      <div className="fixed bottom-0 right-6 z-50 w-72 bg-slate-900 text-white rounded-t-xl shadow-2xl border border-slate-700 flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-slate-800 transition-colors animate-slideUp">
        <div
          onClick={() => setWindowState("normal")}
          className="flex-1 flex items-center gap-2 truncate text-xs font-bold"
        >
          <Send size={13} className="text-[#16730F]" />
          <span className="truncate">
            {selectedRecruiter ? `Draft to ${selectedRecruiter.name}` : "New Outreach Message"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWindowState("normal")}
            className="p-1 text-slate-400 hover:text-white"
            title="Restore"
          >
            <Maximize2 size={13} />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  const containerClasses = isMaximized
    ? "fixed inset-0 sm:inset-6 md:inset-10 z-50 bg-white sm:rounded-2xl shadow-2xl border-0 sm:border border-slate-200 flex flex-col overflow-hidden animate-fadeIn"
    : "fixed inset-x-0 bottom-0 sm:inset-x-auto sm:right-6 md:right-8 z-50 w-full sm:max-w-[580px] h-[88dvh] sm:h-[550px] max-h-[92dvh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-slideUp";

  return (
    <>
      {/* Backdrop when maximized or on mobile */}
      {(isMaximized || windowState === "normal") && (
        <div
          className={`fixed inset-0 bg-black/40 z-40 backdrop-blur-xs transition-opacity ${
            isMaximized ? "block" : "block sm:hidden"
          }`}
          onClick={() => {
            if (isMaximized) setWindowState("normal");
            else onClose();
          }}
        />
      )}

      <div className={containerClasses} id="docked-composer">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-4 py-2.5 sm:py-3 flex flex-col shrink-0 select-none border-b border-slate-800">
          <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-1.5 sm:hidden" />
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1 bg-[#16730F] text-white rounded-md shrink-0">
                <Send size={13} />
              </div>
              <span className="text-xs sm:text-sm font-bold truncate">
                {selectedRecruiter
                  ? `Outreach to ${selectedRecruiter.name} (${selectedRecruiter.company})`
                  : "New Outreach Message"}
              </span>
            </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setWindowState("minimized")}
              className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
              title="Minimize window"
            >
              <Minus size={15} />
            </button>
            <button
              onClick={() => setWindowState(isMaximized ? "normal" : "maximized")}
              className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
              title={isMaximized ? "Restore window" : "Maximize window"}
            >
              {isMaximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
              title="Save draft and close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

        {/* Recipients & Meta Fields */}
        <div className="border-b border-slate-100 bg-white">
          {/* TO Field with Autocomplete */}
          <div className="relative flex items-center px-4 py-2 border-b border-slate-100 text-xs" ref={toFieldRef}>
            <span className="text-slate-400 font-bold w-12 shrink-0">To:</span>

            {selectedRecruiter ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-full font-semibold max-w-[calc(100%-3rem)] min-w-0">
                <span className="truncate max-w-[110px] sm:max-w-none">{selectedRecruiter.name}</span>
                <span className="text-emerald-700 font-normal truncate max-w-[120px] sm:max-w-none">
                  &lt;{selectedRecruiter.email}&gt;
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRecruiter(null);
                    setToInput("");
                  }}
                  className="hover:text-rose-600 ml-1 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <input
                type="text"
                value={toInput}
                onChange={(e) => {
                  setToInput(e.target.value);
                  setShowRecruiterSuggestions(true);
                }}
                onFocus={() => setShowRecruiterSuggestions(true)}
                onClick={() => setShowRecruiterSuggestions(true)}
                placeholder="Search recruiter name, company, or type work email..."
                className="flex-1 py-1 focus:outline-none text-xs text-slate-800 placeholder-slate-400"
              />
            )}

            {!showCc && (
              <button
                type="button"
                onClick={() => setShowCc(true)}
                className="text-[11px] text-slate-400 hover:text-slate-700 font-bold ml-2"
              >
                Cc
              </button>
            )}

            {/* Recruiter Autocomplete Dropdown */}
            {showRecruiterSuggestions && !selectedRecruiter && (
              <div
                ref={suggestionsRef}
                className="absolute left-2 sm:left-14 right-2 sm:right-auto top-full mt-1 w-auto sm:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 divide-y divide-slate-50"
              >
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Platform Recruiters</span>
                  <span>{filteredRecruiters.length} available</span>
                </div>
                {filteredRecruiters.length > 0 ? (
                  filteredRecruiters.map((r) => (
                    <div
                      key={r.id || r.email}
                      onClick={() => handleSelectRecruiter(r)}
                      className="px-3 py-2 hover:bg-emerald-50/70 cursor-pointer flex items-center gap-2.5 transition-colors"
                    >
                      <div className="h-7 w-7 rounded-full bg-[#16730F]/15 text-[#16730F] flex items-center justify-center font-bold text-xs shrink-0">
                        {r.name?.[0]?.toUpperCase() || "R"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {r.name}
                          </span>
                          {r.verified && (
                            <CheckCircle size={11} className="text-emerald-600 fill-emerald-100" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                          <Building size={10} className="text-slate-400" />
                          <span>{r.company}</span>
                          <span>•</span>
                          <span>{r.email}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-slate-400">
                    No registered recruiter matched. You can still type an external email address.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CC Field if active */}
          {showCc && (
            <div className="flex items-center px-4 py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-400 font-bold w-12 shrink-0">Cc:</span>
              <input
                type="text"
                value={ccInput}
                onChange={(e) => setCcInput(e.target.value)}
                placeholder="Optional CC emails separated by comma..."
                className="flex-1 py-1 focus:outline-none text-xs text-slate-800 placeholder-slate-400"
              />
              <button
                onClick={() => {
                  setShowCc(false);
                  setCcInput("");
                }}
                className="text-slate-400 hover:text-slate-700 p-0.5"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Subject Field */}
          <div className="flex items-center px-4 py-2 border-b border-slate-100 text-xs">
            <span className="text-slate-400 font-bold w-12 shrink-0">Subject:</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Talent Partnerships / Senior Engineering Candidate Shortlist"
              className="flex-1 py-1 focus:outline-none text-xs font-bold text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Category Dropdown Row */}
          <div
            className="relative flex items-center justify-between px-4 py-2 border-b border-slate-100 text-xs"
            ref={categoryMenuRef}
          >
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold w-12 shrink-0 flex items-center gap-1">
                <Tag size={12} />
                Tag:
              </span>
              {(() => {
                const currentCat = RECRUITER_CATEGORIES.find((c) => c.id === category);
                return (
                  <button
                    type="button"
                    onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      currentCat ? currentCat.color : "text-slate-700 bg-slate-50 border-slate-200"
                    }`}
                    title="Select email category tag"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        category === "active_hiring"
                          ? "bg-emerald-500"
                          : category === "candidate_review"
                          ? "bg-blue-500"
                          : category === "partnership"
                          ? "bg-purple-500"
                          : "bg-amber-500"
                      }`}
                    />
                    <span>{currentCat?.label || "Select Category"}</span>
                    <ChevronDown size={11} className="text-slate-400 ml-0.5" />
                  </button>
                );
              })()}
            </div>

            {showCategoryMenu && (
              <div className="absolute left-16 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fadeIn">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1 mb-1">
                  Mail Category
                </div>
                {RECRUITER_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      setShowCategoryMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-slate-50 cursor-pointer ${
                      category === cat.id ? "text-[#16730F] font-bold bg-emerald-50/50" : "text-slate-700"
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
                    {category === cat.id && <Check size={14} className="text-[#16730F]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Variable Insertion Pills */}
          <div className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-slate-50/70 overflow-x-auto no-scrollbar border-b border-slate-100 w-full max-w-full shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 select-none">
              Variables:
            </span>
            <button
              type="button"
              onClick={() => handleInsertVariable("{{recruiter_name}}")}
              className="px-2 py-0.5 text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:border-[#16730F] hover:text-[#16730F] rounded-md transition-colors shrink-0 cursor-pointer"
            >
              + Recruiter Name
            </button>
            <button
              type="button"
              onClick={() => handleInsertVariable("{{company_name}}")}
              className="px-2 py-0.5 text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:border-[#16730F] hover:text-[#16730F] rounded-md transition-colors shrink-0 cursor-pointer"
            >
              + Company Name
            </button>
            <button
              type="button"
              onClick={() => handleInsertVariable("{{admin_name}}")}
              className="px-2 py-0.5 text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:border-[#16730F] hover:text-[#16730F] rounded-md transition-colors shrink-0 cursor-pointer"
            >
              + Admin Name
            </button>
          </div>
        </div>

        {/* Message Body Area */}
        <div className="flex-1 p-4 overflow-y-auto nfl-scroll flex flex-col bg-white">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your email here... (Use the Templates button below for pre-approved outreach messages)"
            className="w-full flex-1 min-h-[170px] text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none leading-relaxed font-sans"
          />

          {/* Attached Files List */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 mt-2">
              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium"
                >
                  <FileText size={14} className="text-[#16730F]" />
                  <span className="max-w-[160px] truncate">{att.name}</span>
                  <span className="text-[10px] text-slate-400">{att.size}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(idx)}
                    className="hover:text-rose-600 cursor-pointer ml-1"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Toolbar & Action Buttons */}
        <div className="px-3 sm:px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-1.5 sm:gap-2 shrink-0 w-full select-none">
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            {/* Send Button Group with Schedule Dropdown (Fixed clipping by keeping dropdown outside overflow-hidden) */}
            <div className="relative shrink-0" ref={scheduleMenuRef}>
              <div className="flex items-center rounded-xl overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleSend(false)}
                  disabled={isSending}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gradient-to-r from-[#16730F] to-[#10540b] hover:from-[#125e0c] hover:to-[#0c4008] text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSending ? (
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="hidden sm:inline">Send Message</span>
                      <span className="sm:hidden">Send</span>
                      <Send size={13} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowScheduleMenu(!showScheduleMenu)}
                  className="px-1.5 sm:px-2 py-2 bg-[#10540b] hover:bg-[#0c4008] text-white border-l border-white/20 transition-colors cursor-pointer"
                  title="Schedule email"
                >
                  <ChevronDown size={13} />
                </button>
              </div>

              {/* Schedule Menu */}
              {showScheduleMenu && (
                <div className="fixed sm:absolute inset-x-3 bottom-14 sm:inset-x-auto sm:left-0 sm:bottom-full mb-2 w-auto sm:w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-fadeIn">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Clock size={11} />
                    Schedule Send Time
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowScheduleMenu(false);
                      handleSend(true, "Tomorrow at 9:00 AM");
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer flex justify-between"
                  >
                    <span>Tomorrow morning</span>
                    <span className="text-slate-400 font-medium">9:00 AM</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowScheduleMenu(false);
                      handleSend(true, "Tomorrow at 2:00 PM");
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer flex justify-between"
                  >
                    <span>Tomorrow afternoon</span>
                    <span className="text-slate-400 font-medium">2:00 PM</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowScheduleMenu(false);
                      handleSend(true, "Monday at 8:00 AM");
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer flex justify-between"
                  >
                    <span>Monday morning</span>
                    <span className="text-slate-400 font-medium">8:00 AM</span>
                  </button>
                </div>
              )}
            </div>

            {/* Attach File Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Attach files"
            >
              <Paperclip size={16} />
            </button>

            {/* Recruiter Template Selector Button */}
            <div className="relative shrink-0" ref={templatesMenuRef}>
              <button
                type="button"
                onClick={() => setShowTemplatesMenu(!showTemplatesMenu)}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-emerald-50 hover:bg-emerald-100 text-[#16730F] rounded-xl text-xs font-semibold sm:font-bold transition-colors cursor-pointer border border-emerald-200 shrink-0"
                title="Choose an email template"
              >
                <Sparkles size={12} className="text-[#16730F]" />
                <span>Templates</span>
              </button>

              {showTemplatesMenu && (
                <div className="fixed sm:absolute inset-x-3 bottom-14 sm:inset-x-auto sm:left-0 sm:bottom-full mb-2 w-auto sm:w-80 max-h-72 overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-fadeIn divide-y divide-slate-100">
                  <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Recruiter Templates
                  </div>
                  {DEFAULT_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleInsertTemplate(tpl)}
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-emerald-50/50 cursor-pointer text-slate-700 transition-colors"
                    >
                      <div className="font-bold text-slate-900 leading-tight">
                        {tpl.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {tpl.subject}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Action: Discard Draft */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[11px] text-slate-400 hidden sm:inline mr-1">
              Draft
            </span>
            <button
              type="button"
              onClick={() => {
                toast.info("Draft discarded");
                onClose();
              }}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Discard draft"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

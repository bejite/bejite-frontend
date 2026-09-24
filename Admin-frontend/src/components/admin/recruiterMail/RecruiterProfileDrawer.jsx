import React, { useState, useEffect } from "react";
import {
  X,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  Briefcase,
  ExternalLink,
  Save,
  FileText,
  Copy,
  Check,
} from "lucide-react";
import {
  getRecruiterNotes,
  saveRecruiterNotes,
} from "../../../services/recruiterMailService";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export const RecruiterProfileDrawer = ({
  recruiter,
  totalMessagesCount,
  onClose,
}) => {
  const [noteText, setNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    if (recruiter?.email) {
      setNoteText(getRecruiterNotes(recruiter.email));
    }
  }, [recruiter?.email]);

  if (!recruiter) return null;

  const handleCopy = (field, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.info(`Copied ${field} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveNote = () => {
    if (!recruiter.email) return;
    setIsSavingNote(true);
    saveRecruiterNotes(recruiter.email, noteText);
    setTimeout(() => {
      setIsSavingNote(false);
      toast.success("Recruiter internal note saved!");
    }, 200);
  };

  return (
    <aside className="w-full md:w-80 bg-slate-50/50 border-l border-slate-200/80 flex flex-col h-full shrink-0 select-none overflow-y-auto nfl-scroll">
      {/* Header */}
      <div className="p-3.5 px-4 border-b border-slate-200/80 flex items-center justify-between bg-white">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Recruiter Intelligence
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          title="Close panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* Recruiter Card */}
      <div className="p-5 flex flex-col items-center text-center border-b border-slate-200/80 bg-white">
        <div className="relative mb-3">
          {recruiter.avatar ? (
            <img
              src={recruiter.avatar}
              alt={recruiter.name}
              className="h-18 w-18 rounded-full object-cover border-2 border-emerald-500/30 shadow-xs"
            />
          ) : (
            <div className="h-18 w-18 rounded-full bg-gradient-to-tr from-[#16730F] to-[#10540b] text-white flex items-center justify-center font-bold text-xl shadow-xs">
              {recruiter.name?.[0]?.toUpperCase() || "R"}
            </div>
          )}
          {recruiter.verified && (
            <span
              className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-xs border border-emerald-100"
              title="Verified Recruiter"
            >
              <CheckCircle size={16} className="text-emerald-600 fill-emerald-100" />
            </span>
          )}
        </div>

        <h2 className="text-base font-bold text-slate-900 leading-tight">
          {recruiter.name}
        </h2>
        <p className="text-xs font-medium text-slate-500 mt-0.5">
          {recruiter.role || "Talent Acquisition Partner"}
        </p>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-[#16730F] rounded-full text-xs font-bold mt-2 border border-emerald-200/80">
          <Building size={12} />
          <span>{recruiter.company}</span>
        </div>
      </div>

      {/* Contact Details with 1-Click Copy */}
      <div className="p-4 space-y-2.5 border-b border-slate-200/80 bg-white text-xs text-slate-600">
        <div className="flex items-center justify-between group p-1.5 rounded-lg hover:bg-slate-50">
          <div className="flex items-center gap-2.5 min-w-0">
            <Mail size={14} className="text-slate-400 shrink-0" />
            <span className="truncate select-text">{recruiter.email}</span>
          </div>
          <button
            onClick={() => handleCopy("email", recruiter.email)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded"
            title="Copy email"
          >
            {copiedField === "email" ? (
              <Check size={13} className="text-emerald-600" />
            ) : (
              <Copy size={13} />
            )}
          </button>
        </div>

        {recruiter.phone && (
          <div className="flex items-center justify-between group p-1.5 rounded-lg hover:bg-slate-50">
            <div className="flex items-center gap-2.5 min-w-0">
              <Phone size={14} className="text-slate-400 shrink-0" />
              <span className="truncate select-text">{recruiter.phone}</span>
            </div>
            <button
              onClick={() => handleCopy("phone", recruiter.phone)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded"
              title="Copy phone"
            >
              {copiedField === "phone" ? (
                <Check size={13} className="text-emerald-600" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          </div>
        )}

        <div className="flex items-center gap-2.5 p-1.5 text-slate-600">
          <MapPin size={14} className="text-slate-400 shrink-0" />
          <span>{recruiter.location || "Remote / Worldwide"}</span>
        </div>

        <div className="flex items-center gap-2.5 p-1.5 text-slate-600">
          <Calendar size={14} className="text-slate-400 shrink-0" />
          <span>Joined {recruiter.memberSince || "2025"}</span>
        </div>
      </div>

      {/* Platform Activity Stats */}
      <div className="p-4 border-b border-slate-200/80 bg-white">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Platform Activity
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
            <span className="text-base font-extrabold text-slate-900 block">
              {recruiter.activeJobsCount || 1}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Active Jobs</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
            <span className="text-base font-extrabold text-[#16730F] block">
              {totalMessagesCount || 1}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Emails Sent &amp; Received</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-3 space-y-1.5">
          <Link
            to={`/admin/users?search=${encodeURIComponent(recruiter.email)}`}
            className="flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100/80 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Briefcase size={13} className="text-[#16730F]" />
              <span>View User Profile</span>
            </span>
            <ExternalLink size={12} className="text-slate-400" />
          </Link>

          <Link
            to={`/admin/jobs?search=${encodeURIComponent(recruiter.company)}`}
            className="flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100/80 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Building size={13} className="text-[#16730F]" />
              <span>View Company Jobs</span>
            </span>
            <ExternalLink size={12} className="text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Internal Admin Notes */}
      <div className="p-4 flex-1 flex flex-col bg-white">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileText size={12} />
            Admin Private Notes
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
            Auto-saved
          </span>
        </div>
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onBlur={handleSaveNote}
          placeholder="Private admin notes (e.g. hiring budget, target candidate levels, interview feedback)..."
          rows={5}
          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#16730F] focus:bg-white resize-y font-sans transition-all leading-relaxed"
        />
        <div className="mt-2 flex justify-end">
          <button
            onClick={handleSaveNote}
            disabled={isSavingNote}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-[#16730F] hover:text-white rounded-lg text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            <Save size={12} />
            <span>{isSavingNote ? "Saved" : "Save Note"}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

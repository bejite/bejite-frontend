import React from "react";
import {
  Inbox,
  Send,
  Star,
  FileEdit,
  Archive,
  Trash2,
  Plus,
  Tag,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { MAIL_FOLDERS, RECRUITER_CATEGORIES } from "../../../services/recruiterMailService";

export const RecruiterMailSidebar = ({
  isOpenMobile,
  onCloseMobile,
  activeFolder,
  setActiveFolder,
  activeCategory,
  setActiveCategory,
  onOpenCompose,
  counts,
  onTriggerSimulation,
  isThreadSelected = false,
}) => {
  const folders = [
    {
      id: MAIL_FOLDERS.INBOX,
      label: "Inbox",
      description: "Recruiter replies",
      icon: Inbox,
      count: counts.inboxUnread,
      isBadge: true,
      color: "text-emerald-600",
    },
    {
      id: MAIL_FOLDERS.SENT,
      label: "Sent",
      description: "Outreach initiated",
      icon: Send,
      count: counts.sent,
      color: "text-blue-600",
    },
    {
      id: MAIL_FOLDERS.STARRED,
      label: "Starred",
      description: "Priority partners",
      icon: Star,
      count: counts.starred,
      color: "text-amber-500",
    },
    {
      id: MAIL_FOLDERS.DRAFTS,
      label: "Drafts",
      description: "Unsent messages",
      icon: FileEdit,
      count: counts.drafts,
      color: "text-purple-600",
    },
    {
      id: MAIL_FOLDERS.ARCHIVE,
      label: "Archive",
      description: "Resolved threads",
      icon: Archive,
      count: counts.archive,
      color: "text-slate-500",
    },
    {
      id: MAIL_FOLDERS.TRASH,
      label: "Trash",
      description: "Deleted",
      icon: Trash2,
      count: counts.trash,
      color: "text-rose-500",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-2xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 md:translate-x-0 md:static md:w-60 lg:w-64 md:shadow-none md:z-auto md:bg-slate-50/70 md:border-r md:border-slate-200/80 h-full shrink-0 select-none overflow-y-auto nfl-scroll
          ${isOpenMobile ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isThreadSelected ? "md:hidden lg:flex" : "md:flex"}
        `}
      >
        {/* Mobile Header with Close Button */}
        <div className="md:hidden flex items-center justify-between p-3.5 px-4 border-b border-slate-100 bg-white shrink-0">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Mailbox Folders
          </span>
          <button
            onClick={onCloseMobile}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            title="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Primary Compose Button */}
        <div className="p-3 sm:p-4 pb-2 shrink-0">
          <button
            onClick={() => {
              onOpenCompose();
              onCloseMobile?.();
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-[#16730F] to-[#10540b] text-white font-bold text-sm shadow-md shadow-[#16730F]/20 hover:shadow-lg hover:shadow-[#16730F]/30 hover:from-[#13610d] hover:to-[#0c4008] active:scale-[0.98] transition-all duration-200 cursor-pointer group"
            id="btn-recruiter-compose"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                <Plus size={16} className="text-white" />
              </div>
              <span>New Message</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-white/20 rounded text-emerald-100 group-hover:bg-white/30 transition-colors">
              C
            </kbd>
          </button>
        </div>

        {/* Folders List */}
        <div className="px-3 py-1 space-y-1 shrink-0">
          <div className="px-3 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Mailbox Folders</span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold normal-case">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </div>

          {folders.map((f) => {
            const isActive = activeFolder === f.id && activeCategory === null;
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                onClick={() => {
                  setActiveFolder(f.id);
                  setActiveCategory(null);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer group ${
                  isActive
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold"
                    : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-1 rounded-lg transition-colors ${
                      isActive
                        ? "bg-[#16730F]/10 text-[#16730F]"
                        : `${f.color} bg-slate-100/70 group-hover:bg-white`
                    }`}
                  >
                    <Icon
                      size={16}
                      className={
                        f.id === MAIL_FOLDERS.STARRED && counts.starred > 0
                          ? "fill-amber-500 text-amber-500"
                          : ""
                      }
                    />
                  </div>
                  <div className="flex flex-col text-left truncate">
                    <span className="truncate leading-tight">{f.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal truncate">
                      {f.description}
                    </span>
                  </div>
                </div>

                {f.count > 0 && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      isActive
                        ? "bg-[#16730F] text-white"
                        : f.isBadge
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {f.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Recruiter Category Filter Tags */}
        <div className="px-3 py-3 border-t border-slate-200/70 mt-2 space-y-1 shrink-0">
          <div className="flex items-center justify-between px-3 mb-1.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag size={12} />
              Categories
            </p>
            {activeCategory && (
              <button
                onClick={() => setActiveCategory(null)}
                className="text-[11px] text-[#16730F] hover:underline font-bold cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
          {RECRUITER_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(isActive ? null : cat.id);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#16730F] text-white shadow-xs font-bold"
                    : "text-slate-600 hover:bg-white/60"
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
                {counts.categories?.[cat.id] > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {counts.categories[cat.id]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Outreach Insights Performance Card */}
        <div className="mt-auto p-3 m-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="p-1 bg-[#16730F]/10 text-[#16730F] rounded-lg">
                <TrendingUp size={13} />
              </div>
              <span className="text-xs font-bold text-slate-800">Recruiter Stats</span>
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold border border-emerald-100">
              Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center mb-2">
            <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              <span className="text-xs font-extrabold text-slate-800 block">86%</span>
              <span className="text-[9px] text-slate-400 font-medium">Open Rate</span>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              <span className="text-xs font-extrabold text-[#16730F] block">74%</span>
              <span className="text-[9px] text-slate-400 font-medium">Reply Rate</span>
            </div>
          </div>

          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1.5">
            <div className="bg-[#16730F] h-full rounded-full" style={{ width: "74%" }} />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>65 Recruiter threads</span>
            <span>Goal: 100</span>
          </div>
        </div>

        {/* Quick Testing Simulator Trigger */}
        <div className="p-3 pt-0 shrink-0">
          <button
            onClick={() => {
              onTriggerSimulation();
              onCloseMobile?.();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-amber-900 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs group"
            title="Simulate receiving a reply from a recruiter in real-time"
          >
            <Sparkles size={14} className="text-amber-600 group-hover:rotate-12 transition-transform" />
            <span>Test Inbound Reply</span>
          </button>
        </div>
      </aside>
    </>
  );
};

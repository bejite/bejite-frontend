import React from "react";
import { Inbox, Send, Plus, X } from "lucide-react";
import { MAIL_FOLDERS } from "../../../services/recruiterMailService";

export const RecruiterMailSidebar = ({
  isOpenMobile,
  onCloseMobile,
  activeFolder,
  setActiveFolder,
  onOpenCompose,
  counts = { inboxUnread: 0, sent: 0 },
  isThreadSelected = false,
}) => {
  const folders = [
    {
      id: MAIL_FOLDERS.INBOX,
      label: "Inbox",
      icon: Inbox,
      count: counts.inboxUnread,
      isBadge: true,
      color: "text-emerald-600",
    },
    {
      id: MAIL_FOLDERS.SENT,
      label: "Sent",
      icon: Send,
      count: counts.sent,
      color: "text-blue-600",
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
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Primary Action Button: Compose */}
        <div className="p-3 sm:p-4 shrink-0">
          <button
            onClick={() => {
              onOpenCompose();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-gradient-to-r from-[#16730F] to-[#125e0c] hover:from-[#13610d] hover:to-[#0e4809] text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer group"
          >
            <Plus
              size={18}
              className="group-hover:rotate-90 transition-transform duration-200"
            />
            <span>Compose Email</span>
          </button>
        </div>

        {/* Folders Navigation */}
        <div className="px-2 sm:px-3 py-1 flex-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
            Folders
          </div>
          <nav className="space-y-1">
            {folders.map((folder) => {
              const Icon = folder.icon;
              const isActive = activeFolder === folder.id;

              return (
                <button
                  key={folder.id}
                  onClick={() => {
                    setActiveFolder(folder.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-[#16730F] shadow-xs border border-slate-200/80 font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={17}
                      className={isActive ? "text-[#16730F]" : folder.color}
                    />
                    <span>{folder.label}</span>
                  </div>

                  {folder.isBadge && folder.count > 0 ? (
                    <span className="px-2 py-0.5 bg-[#16730F] text-white rounded-full text-[11px] font-bold shadow-2xs">
                      {folder.count}
                    </span>
                  ) : folder.count > 0 ? (
                    <span className="text-[11px] text-slate-400 font-medium">
                      {folder.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

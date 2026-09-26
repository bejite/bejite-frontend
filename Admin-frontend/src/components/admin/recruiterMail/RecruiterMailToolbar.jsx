import React from "react";
import {
  Search,
  X,
  RotateCw,
  CheckSquare,
  Square,
  MinusSquare,
  Mail,
  MailOpen,
  Trash2,
  Menu,
} from "lucide-react";

export const RecruiterMailToolbar = ({
  searchQuery = "",
  setSearchQuery,
  filterType = "all",
  setFilterType,
  selectedThreadIds = [],
  onToggleSelectAll,
  allSelectedState = "none",
  onBulkMarkRead,
  onBulkMarkUnread,
  onBulkTrash,
  onRefresh,
  isRefreshing = false,
  activeFolder = "inbox",
  totalCount = 0,
  unreadCount = 0,
  onOpenMobileSidebar,
}) => {
  const hasSelection = selectedThreadIds.length > 0;

  return (
    <div className="bg-white border-b border-slate-200/80 shrink-0 select-none w-full max-w-full">
      {/* Top Row: Search, Select All, Bulk Actions, Refresh */}
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 w-full max-w-full">
        {/* Left: Mobile Sidebar Trigger, Checkbox, Bulk Actions OR Search */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          {onOpenMobileSidebar && (
            <button
              type="button"
              onClick={onOpenMobileSidebar}
              className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer"
              title="Open folders"
            >
              <Menu size={14} />
              <span className="capitalize">{activeFolder}</span>
            </button>
          )}

          {/* Select All Checkbox */}
          <button
            type="button"
            onClick={onToggleSelectAll}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title={hasSelection ? "Deselect all" : "Select all in view"}
          >
            {allSelectedState === "all" ? (
              <CheckSquare size={17} className="text-[#16730F]" />
            ) : allSelectedState === "some" ? (
              <MinusSquare size={17} className="text-[#16730F]" />
            ) : (
              <Square size={17} />
            )}
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Refresh messages"
          >
            <RotateCw
              size={15}
              className={isRefreshing ? "animate-spin text-[#16730F]" : ""}
            />
          </button>

          {/* Bulk Action Buttons (when items selected) */}
          {hasSelection ? (
            <div className="flex items-center gap-1 sm:gap-1.5 pl-1.5 border-l border-slate-200 animate-fadeIn">
              <span className="text-xs font-bold text-[#16730F] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                {selectedThreadIds.length} selected
              </span>

              <button
                type="button"
                onClick={() => onBulkMarkRead?.(true)}
                className="flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors"
                title="Mark as read"
              >
                <MailOpen size={14} className="text-slate-500" />
                <span className="hidden sm:inline">Mark Read</span>
              </button>

              <button
                type="button"
                onClick={() => onBulkMarkUnread?.(false)}
                className="flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors"
                title="Mark as unread"
              >
                <Mail size={14} className="text-slate-500" />
                <span className="hidden sm:inline">Unread</span>
              </button>

              <button
                type="button"
                onClick={onBulkTrash}
                className="flex items-center gap-1 px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium transition-colors"
                title="Delete selected"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          ) : (
            /* Search Input */
            <div className="relative flex-1 max-w-md min-w-0">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search emails by name, email, or subject..."
                className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 text-xs pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 focus:border-[#16730F] focus:ring-1 focus:ring-[#16730F] transition-all outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: All / Unread Filter Pills */}
        <div className="flex items-center gap-1 shrink-0 bg-slate-100 p-0.5 rounded-xl">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              filterType === "all"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("unread")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              filterType === "unread"
                ? "bg-white text-emerald-700 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

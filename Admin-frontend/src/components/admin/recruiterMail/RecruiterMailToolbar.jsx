import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  X,
  RotateCw,
  CheckSquare,
  Square,
  MinusSquare,
  Mail,
  MailOpen,
  Star,
  Archive,
  Trash2,
  Paperclip,
  Menu,
  Tag,
  ChevronDown,
  Check,
} from "lucide-react";
import { MAIL_FOLDERS, RECRUITER_CATEGORIES } from "../../../services/recruiterMailService";

export const RecruiterMailToolbar = ({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  selectedThreadIds,
  onToggleSelectAll,
  allSelectedState,
  onBulkMarkRead,
  onBulkMarkUnread,
  onBulkStar,
  onBulkArchive,
  onBulkTrash,
  onBulkUpdateCategory,
  onRefresh,
  isRefreshing,
  activeFolder,
  activeCategory,
  setActiveCategory,
  totalCount,
  counts,
  onOpenMobileSidebar,
}) => {
  const hasSelection = selectedThreadIds.length > 0;
  const [showBulkCategoryMenu, setShowBulkCategoryMenu] = useState(false);
  const [showFilterCategoryMenu, setShowFilterCategoryMenu] = useState(false);

  const bulkCategoryMenuRef = useRef(null);
  const filterCategoryMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        bulkCategoryMenuRef.current &&
        !bulkCategoryMenuRef.current.contains(e.target)
      ) {
        setShowBulkCategoryMenu(false);
      }
      if (
        filterCategoryMenuRef.current &&
        !filterCategoryMenuRef.current.contains(e.target)
      ) {
        setShowFilterCategoryMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeCategoryObj = RECRUITER_CATEGORIES.find(
    (c) => c.id === activeCategory,
  );

  const TABS = [
    { id: "all", label: "All Mail", count: totalCount },
    { id: "unread", label: "Unread", count: counts?.inboxUnread || 0, isAlert: true },
    { id: "starred", label: "Starred", count: counts?.starred || 0, icon: Star },
    { id: "attachments", label: "With Files", icon: Paperclip },
  ];

  return (
    <div className="bg-white border-b border-slate-200/80 shrink-0 select-none w-full max-w-full relative z-20">
      {/* Search Bar, Mobile Folder Trigger, Selection & Bulk Actions */}
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 w-full max-w-full">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          {onOpenMobileSidebar && (
            <button
              type="button"
              onClick={onOpenMobileSidebar}
              className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer"
              title="Browse folders & categories"
            >
              <Menu size={14} />
              <span className="capitalize">
                {activeCategoryObj ? activeCategoryObj.label : activeFolder || "Folders"}
              </span>
            </button>
          )}

          <button
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

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Refresh inbox"
          >
            <RotateCw size={15} className={isRefreshing ? "animate-spin text-[#16730F]" : ""} />
          </button>

          {hasSelection ? (
            <div className="flex items-center gap-1 pl-1.5 border-l border-slate-200 overflow-visible min-w-0">
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                {selectedThreadIds.length} sel
              </span>
              <button
                onClick={() => onBulkMarkRead(true)}
                className="p-1.5 text-slate-600 hover:text-[#16730F] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Mark as read"
              >
                <MailOpen size={15} />
              </button>
              <button
                onClick={() => onBulkMarkUnread(false)}
                className="p-1.5 text-slate-600 hover:text-[#16730F] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Mark as unread"
              >
                <Mail size={15} />
              </button>
              <button
                onClick={onBulkStar}
                className="p-1.5 text-slate-600 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Add star"
              >
                <Star size={15} />
              </button>

              {/* Bulk Category / Label Dropdown */}
              <div className="relative shrink-0" ref={bulkCategoryMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowBulkCategoryMenu(!showBulkCategoryMenu)}
                  className="flex items-center gap-1 px-2 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  title="Assign category tag"
                >
                  <Tag size={14} className="text-slate-500" />
                  <span className="hidden sm:inline">Tag</span>
                  <ChevronDown size={11} className="text-slate-400" />
                </button>

                {showBulkCategoryMenu && (
                  <div className="absolute left-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fadeIn">
                    <div className="px-3 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1 mb-1">
                      <span>Tag {selectedThreadIds.length} {selectedThreadIds.length === 1 ? "thread" : "threads"}</span>
                      <button
                        type="button"
                        onClick={() => {
                          onBulkUpdateCategory?.(null);
                          setShowBulkCategoryMenu(false);
                        }}
                        className="text-[10px] text-rose-600 hover:underline font-bold capitalize cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                    {RECRUITER_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          onBulkUpdateCategory?.(cat.id);
                          setShowBulkCategoryMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer text-left"
                      >
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
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={onBulkArchive}
                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Move to archive"
              >
                <Archive size={15} />
              </button>
              <button
                onClick={onBulkTrash}
                className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Move to trash"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ) : (
            <div className="relative flex-1 min-w-0 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recruiter emails..."
                className="w-full pl-8 pr-7 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16730F]/20 focus:border-[#16730F] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-400 font-medium hidden md:block shrink-0">
          <span className="font-bold text-slate-700">{totalCount}</span> {totalCount === 1 ? "thread" : "threads"}
        </div>
      </div>

      {/* Modern Executive Segmented Tab Control + Category Dropdown Filter */}
      <div className="px-3 sm:px-4 py-2 border-t border-slate-100/90 bg-slate-50/50 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 overflow-visible">
        {/* Left: Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-xl overflow-x-auto no-scrollbar max-w-full">
          {TABS.map((tab) => {
            const isActive = filterType === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                {Icon && (
                  <Icon
                    size={13}
                    className={isActive ? "text-[#16730F]" : "text-slate-400"}
                  />
                )}
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                      isActive
                        ? "bg-emerald-100 text-[#16730F]"
                        : tab.isAlert
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-300/80 text-slate-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Category Dropdown Filter */}
        <div className="relative shrink-0" ref={filterCategoryMenuRef}>
          <button
            type="button"
            onClick={() => setShowFilterCategoryMenu(!showFilterCategoryMenu)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              activeCategoryObj
                ? `${activeCategoryObj.color} font-bold shadow-2xs`
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
            }`}
            title="Filter by category tag"
          >
            <Tag size={13} className={activeCategoryObj ? "" : "text-slate-400"} />
            <span className="whitespace-nowrap">
              {activeCategoryObj ? activeCategoryObj.label : "Category"}
            </span>
            {activeCategoryObj && counts?.categories?.[activeCategoryObj.id] > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-white/70">
                {counts.categories[activeCategoryObj.id]}
              </span>
            )}
            <ChevronDown size={11} className={activeCategoryObj ? "" : "text-slate-400"} />
          </button>

          {showFilterCategoryMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-fadeIn">
              <div className="px-3 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1 mb-1">
                <span>Filter by Category</span>
                {activeCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory?.(null);
                      setShowFilterCategoryMenu(false);
                    }}
                    className="text-[10px] text-[#16730F] hover:underline font-bold cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* All Categories Option */}
              <button
                type="button"
                onClick={() => {
                  setActiveCategory?.(null);
                  setShowFilterCategoryMenu(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-slate-50 cursor-pointer ${
                  !activeCategory ? "text-[#16730F] font-bold bg-emerald-50/50" : "text-slate-700"
                }`}
              >
                <span>All Categories</span>
                {!activeCategory && <Check size={14} className="text-[#16730F]" />}
              </button>

              {/* Category Options */}
              {RECRUITER_CATEGORIES.map((cat) => {
                const isSelected = activeCategory === cat.id;
                const catCount = counts?.categories?.[cat.id] || 0;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory?.(isSelected ? null : cat.id);
                      setShowFilterCategoryMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-slate-50 cursor-pointer ${
                      isSelected ? "text-[#16730F] font-bold bg-emerald-50/50" : "text-slate-700"
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
                    <div className="flex items-center gap-1.5">
                      {catCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-100 text-slate-600">
                          {catCount}
                        </span>
                      )}
                      {isSelected && <Check size={14} className="text-[#16730F]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

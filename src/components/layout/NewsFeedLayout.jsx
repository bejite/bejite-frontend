import React from "react";
import NewsFeedHeader from "../NewsFeedHeader";
import RecruitmentLeft from "../recruitment/RecruitmentLeft";
import RecruitmentRight from "../recruitment/RecruitmentRight";

const DEFAULT_SCROLL_CLASSES =
  "overflow-y-scroll overflow-x-hidden nfl-scroll scroll-smooth";

/**
 * Reusable NewsFeed-style layout with header, optional sidebars, and a scrollable middle area.
 *
 * The shell is viewport-locked (100dvh + overflow-hidden). Scrolling must happen in a
 * designated child — either the layout middle column (default) or a page-owned region.
 *
 * Props:
 * - children        — rendered in the middle column (scrollable)
 * - showSidebars    — show left + right sidebars (default: true)
 * - leftSidebar     — custom left sidebar component (defaults to <RecruitmentLeft />)
 * - rightSidebar    — custom right sidebar component (defaults to <RecruitmentRight />)
 * - scrollable      — when true, middle column scrolls (default: true)
 * - classes         — extra/override classes when scrollable & no sidebars.
 *                     Pass `false` only when the page provides its own
 *                     `min-h-0 overflow-y-auto nfl-scroll` region.
 */
function resolveNoSidebarClasses(scrollable, classes) {
  if (!scrollable) return "overflow-hidden";
  // Explicit opt-out: page owns the scroll container
  if (classes === false) return "";
  if (typeof classes === "string" && classes.trim()) return classes;
  return DEFAULT_SCROLL_CLASSES;
}

export default function NewsFeedLayout({
  children,
  showSidebars = true,
  leftSidebar,
  rightSidebar,
  scrollable = true,
  classes = DEFAULT_SCROLL_CLASSES,
  NewsFeedshead = true,
}) {
  const noSidebarClasses = resolveNoSidebarClasses(scrollable, classes);

  return (
    <div className="flex flex-col bg-[#F5F5F5] h-[100dvh] max-h-[100dvh] overflow-hidden w-full">
      {/* Sticky Header — overflow-visible so the role menu can paint over the feed */}
      <div className="shrink-0 z-50 bg-[#F5F5F5] border-b border-[#A9A9A9] w-full overflow-visible relative">
        <NewsFeedHeader />
      </div>

      {/* Main Content */}
      {showSidebars ? (
        <div className="flex-1 min-h-0 min-w-0 w-full grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_280px] gap-0">
          {/* Left Sidebar */}
          <div className="hidden lg:block h-full overflow-y-scroll nfl-sidebar-scroll">
            {leftSidebar || <RecruitmentLeft />}
          </div>

          {/* Middle */}
          <div
            className={`min-h-0 min-w-0 ${
              scrollable
                ? DEFAULT_SCROLL_CLASSES
                : "flex flex-col overflow-hidden"
            }`}
          >
            {children}
            {scrollable && <div className="h-8" />}
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block h-full overflow-y-scroll nfl-sidebar-scroll">
            {rightSidebar || <RecruitmentRight />}
          </div>
        </div>
      ) : (
        <div
          className={`flex-1 min-h-0 min-w-0 w-full flex flex-col ${noSidebarClasses}`}
        >
          {children}
          {scrollable && classes !== false && <div className="h-8" />}
        </div>
      )}
    </div>
  );
}

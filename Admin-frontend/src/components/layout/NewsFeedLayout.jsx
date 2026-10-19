import NewsFeedHeader from "../NewsFeedHeader";
import RecruitmentLeft from "../recruitment/RecruitmentLeft";
import RecruitmentRight from "../recruitment/RecruitmentRight";

/**
 * Reusable NewsFeed-style layout with header, optional sidebars, and a scrollable middle area.
 *
 * Props:
 * - children        — rendered in the middle column (scrollable)
 * - showSidebars    — show left + right sidebars (default: true)
 * - leftSidebar     — custom left sidebar component (defaults to <RecruitmentLeft />)
 * - rightSidebar    — custom right sidebar component (defaults to <RecruitmentRight />)
 */
// Updated NewsFeedLayout.js
export default function NewsFeedLayout({
  children,
  showSidebars = true,
  leftSidebar,
  rightSidebar,
  scrollable = true, // New prop to control scrolling
  classes = `overflow-y-auto overflow-x-hidden max-h-[calc(100vh-72px)] nfl-scroll scroll-smooth`,
}) {
  return (
    <div
      className={`flex flex-col bg-[#F5F5F5] ${
        scrollable ? "min-h-screen" : "h-screen max-h-[100dvh] overflow-hidden"
      }`}
    >
      {/* Sticky Header */}
      <div className="shrink-0 sticky top-0 z-50 bg-[#F5F5F5] border-b border-[#A9A9A9]">
        <NewsFeedHeader />
      </div>

      {/* Main Content */}
      {showSidebars ? (
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-0 max-w-screen-xl w-full mx-auto">
          {/* Left Sidebar */}
          <div className="hidden lg:block sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto nfl-sidebar-scroll">
            {leftSidebar || <RecruitmentLeft />}
          </div>

          {/* Middle — scrollable children (conditional scrolling) */}
          <div
            className={`min-h-0 ${
              scrollable
                ? "overflow-y-auto overflow-x-hidden max-h-[calc(100vh-72px)] nfl-scroll scroll-smooth"
                : "flex flex-col overflow-hidden"
            }`}
          >
            {children}
            {/* Bottom spacer - only show if scrollable */}
            {scrollable && <div className="h-8" />}
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto nfl-sidebar-scroll">
            {rightSidebar || <RecruitmentRight />}
          </div>
        </div>
      ) : (
        /* No sidebars — conditional scrolling */
        <div
          className={`flex-1 min-h-0 flex flex-col ${
            scrollable ? classes : "overflow-hidden"
          }`}
        >
          {children}
          {scrollable && <div className="h-8" />}
        </div>
      )}
    </div>
  );
}

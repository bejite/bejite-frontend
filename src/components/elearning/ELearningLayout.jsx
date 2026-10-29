import React, { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import NewsFeedHeader from "../NewsFeedHeader";
import ELearningSidebar from "./ELearningSidebar";
import { getUser, mergeAuthUsers } from "../../utils/tokenManager";
import { isJobseekerAccount } from "../../services/elearningService";

/**
 * Dedicated E-Learning Shell Layout for Jobseekers.
 * Renders the global Bejite header, jobseeker role guard, left E-Learning sidebar rail,
 * and a clean scrollable workspace.
 */
export default function ELearningLayout({
  children,
  activeNavId,
  contentClassName = "",
}) {
  const reduxUser = useSelector((state) => state.auth?.user);
  const currentUser = useMemo(() => {
    const localUser = getUser();
    return mergeAuthUsers(localUser || {}, reduxUser || localUser || {});
  }, [reduxUser]);

  if (!isJobseekerAccount(currentUser)) {
    return <Navigate to="/news-feed" replace />;
  }

  return (
    <div className="flex flex-col bg-[#FAFAFA] h-[100dvh] max-h-[100dvh] overflow-hidden w-full">
      {/* Global Header */}
      <div className="shrink-0 z-50 bg-[#F8F9F8] border-b border-gray-200/80 w-full overflow-visible relative">
        <NewsFeedHeader />
      </div>

      {/* Scrollable E-Learning Workspace */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden nfl-scroll scroll-smooth">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-14">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-start gap-6">
            <ELearningSidebar activeId={activeNavId} />

            <main className={`flex-1 min-w-0 ${contentClassName}`}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}


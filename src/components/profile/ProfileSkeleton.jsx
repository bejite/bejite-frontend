import React from "react";
import NewsFeedLayout from "../layout/NewsFeedLayout";

/**
 * Modern Pulse Skeleton loading state matching executive dossier layout.
 */
const ProfileSkeleton = () => (
  <NewsFeedLayout showSidebars={false}>
    <div className="w-full min-w-0 max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 animate-pulse">
      {/* Back button placeholder */}
      <div className="h-4 w-20 bg-slate-200 rounded mb-6"></div>

      <div className="md:grid md:grid-cols-[280px_1fr] md:gap-6 lg:gap-8 items-start">
        {/* Sidebar skeleton */}
        <div className="bg-white rounded-sm border border-slate-200 overflow-hidden mb-6 md:mb-0">
          <div className="h-20 bg-slate-200 w-full"></div>
          <div className="px-5 pb-6 -mt-11 flex flex-col items-center">
            <div className="w-24 h-24 rounded-lg bg-slate-300 border-4 border-white shadow-sm"></div>
            <div className="h-5 bg-slate-200 rounded w-36 mt-4"></div>
            <div className="h-3 bg-slate-200 rounded w-20 mt-2"></div>
            <div className="h-3 bg-slate-200 rounded w-28 mt-2"></div>
            <div className="w-full h-px bg-slate-100 my-4"></div>
            <div className="h-6 bg-slate-200 rounded w-24"></div>
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="bg-white rounded-sm border border-slate-200 divide-y divide-slate-100">
          <div className="p-6 sm:p-8 space-y-4">
            <div className="h-3 bg-slate-200 rounded w-32 mb-6"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            <div className="h-4 bg-slate-200 rounded w-4/6"></div>
          </div>
          <div className="p-6 sm:p-8 space-y-4">
            <div className="h-3 bg-slate-200 rounded w-36 mb-6"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-slate-100 rounded"></div>
              <div className="h-12 bg-slate-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NewsFeedLayout>
);

export default ProfileSkeleton;

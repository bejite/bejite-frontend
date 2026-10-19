import React from "react";
import { useNavigate } from "react-router-dom";
import NewsFeedLayout from "../components/layout/NewsFeedLayout";
import {
  FaHome,
  FaUserFriends,
  FaComments,
  FaQuestionCircle,
} from "react-icons/fa";

const POPULAR_DESTINATIONS = [
  { label: "News Feed", path: "/news-feed", icon: FaHome },
  { label: "Connections", path: "/connection", icon: FaUserFriends },
  { label: "Chats", path: "/chats", icon: FaComments },
  { label: "Help Center", path: "/help", icon: FaQuestionCircle },
];

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <NewsFeedLayout NewsFeedshead={false} showSidebars={false}>
      <div className="py-12 sm:py-16 bg-[#F5F5F5] flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-200/80">
          {/* 404 Header */}
          <h1 className="text-6xl sm:text-7xl font-extrabold text-[#1A3E32] tracking-tight mb-2">
            404
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
            Page Not Found
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
            Oops! The page you are looking for doesn't exist, has been removed,
            or is temporarily unavailable.
          </p>

          {/* Main Action Button */}
          <div className="flex justify-center mb-10">
            <button
              type="button"
              onClick={() => navigate("/news-feed")}
              className="px-6 py-3 bg-[#16730F] hover:bg-[#145a0c] text-white rounded-xl font-bold text-sm shadow-md transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FaHome className="text-sm" />
              <span>Back to News Feed</span>
            </button>
          </div>

          {/* Quick Helpful Destinations */}
          <div className="pt-6 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Or explore popular destinations:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {POPULAR_DESTINATIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className="p-3 bg-gray-50 hover:bg-emerald-50 hover:text-[#16730F] border border-gray-200/80 hover:border-emerald-300 rounded-xl transition-all duration-150 flex flex-col items-center gap-1.5 cursor-pointer text-gray-700"
                  >
                    <Icon className="h-4 w-4 text-[#16730F]" />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </NewsFeedLayout>
  );
}

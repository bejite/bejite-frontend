import React from "react";
import { useNavigate } from "react-router-dom";

const navItems = [
  { label: "← Dashboard", path: "/news-feed" },
  { label: "Search", path: "/candidate-search-page" },
  { label: "My Plan", path: "/subscription-dashboard" },
];

const ASEPricingSidebar = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="lg:hidden space-y-3">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {navItems.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className="shrink-0 px-3 py-2 text-sm font-semibold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 hover:text-[#1A3E32] transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/contact")}
          className="w-full py-2.5 px-4 bg-[#1A3E32]/5 text-[#1A3E32] rounded-xl hover:bg-[#1A3E32] hover:text-white transition-all font-bold text-sm border border-[#1A3E32]/10"
        >
          Contact Support
        </button>
      </div>

      <div className="hidden lg:block space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
        <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-400 mb-4">
          Navigation
        </h3>
        <ul className="space-y-1.5">
          <li>
            <button
              onClick={() => navigate("/news-feed")}
              className="flex items-center gap-3 text-gray-600 hover:text-[#1A3E32] w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all font-semibold text-sm"
            >
              <svg
                className="w-5 h-5 opacity-70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
               Back to Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate("/candidate-search-page")}
              className="flex items-center gap-3 text-gray-600 hover:text-[#1A3E32] w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all font-semibold text-sm"
            >
              <svg
                className="w-5 h-5 opacity-70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Candidate Search
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate("/subscription-dashboard")}
              className="flex items-center gap-3 text-gray-600 hover:text-[#1A3E32] w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all font-semibold text-sm"
            >
              <svg
                className="w-5 h-5 opacity-70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              My Subscription
            </button>
          </li>
        </ul>

        <hr className="my-5 border-gray-100" />

        <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-400 mb-3">
          Need Help?
        </h3>
        <div className="space-y-3 text-sm text-gray-500">
          <p className="leading-relaxed">
            Contact our support team for assistance with choosing the right
            plan for your recruiting scale.
          </p>
          <button
            onClick={() => navigate("/contact")}
            className="w-full py-2.5 px-4 bg-[#1A3E32]/5 text-[#1A3E32] rounded-xl hover:bg-[#1A3E32] hover:text-white transition-all font-bold text-sm border border-[#1A3E32]/10"
          >
            Contact Support
          </button>
        </div>
      </div>
      </div>
    </>
  );
};

export default ASEPricingSidebar;

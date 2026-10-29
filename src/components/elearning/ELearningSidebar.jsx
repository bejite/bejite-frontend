import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, GraduationCap, BookOpen } from "lucide-react";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Learning Dashboard",
    path: "/e-learning",
    icon: LayoutGrid,
  },
  {
    id: "my-learning",
    label: "My Learning",
    path: "/e-learning/my-learning",
    icon: GraduationCap,
  },
  {
    id: "explore",
    label: "Explore Courses",
    path: "/e-learning/explore",
    icon: BookOpen,
  },
];

function resolveActiveNavId(pathname) {
  if (pathname.startsWith("/e-learning/explore")) return "explore";
  if (pathname.startsWith("/e-learning/my-learning")) return "my-learning";
  return "dashboard";
}

/**
 * Reusable E-Learning Left Sidebar & Mobile Switcher.
 * Matches the Bejite Academy sidebar card nested inside the soft rounded rail.
 */
export default function ELearningSidebar({ activeId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentActive = activeId || resolveActiveNavId(location.pathname);

  return (
    <>
      {/* Mobile / Tablet Compact Pill Bar */}
      <div className="lg:hidden bg-white border border-gray-200 rounded-2xl p-2 flex items-center gap-1.5 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentActive === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? "bg-[#EFF5EF] text-[#16730F]"
                  : "text-[#1A3E32] hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4 text-[#16730F] shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Desktop Left Sidebar Rail */}
      <aside className="hidden lg:block w-[238px] shrink-0">
        <div className="bg-[#F3F5F3] rounded-2xl p-3 min-h-[540px]">
          <div className="bg-white rounded-2xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-[#1A3E32]">
              E-LEARNING
            </p>

            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentActive === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer text-left ${
                      isActive
                        ? "bg-[#EFF5EF] text-[#16730F] font-bold"
                        : "text-[#1A3E32] font-semibold hover:bg-[#F7FAF7]"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#16730F] shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}


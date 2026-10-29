import React from "react";

/**
 * Reusable E-Learning Filter Pill Tabs (used on My Learning and filterable views).
 */
export default function ELearningFilterTabs({
  tabs = [],
  activeTab,
  onChange,
  className = "",
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange && onChange(tab.id)}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm transition-colors duration-150 cursor-pointer ${
              isActive
                ? "bg-[#16730F] text-white font-semibold shadow-2xs"
                : "bg-[#A3B6A2] hover:bg-[#93A892] text-white font-medium"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}


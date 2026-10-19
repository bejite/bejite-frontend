import React from "react";

export default function BirthdayTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-200/80 p-1 mb-6 flex items-center justify-between gap-1 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 px-[2rem] md:px-3 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
              isActive
                ? "bg-[#16730F] text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

import React from "react";

export default function RecruitmentAuditLog({ logs = [] }) {
  const logItems = logs || [];

  return (
    <div className="bg-[#F7FAF8] border border-[#D5E5DD] rounded-3xl p-5 sm:p-7 space-y-6 shadow-xs">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1A3E32] tracking-tight">
          Recruitment Audit & Activity History Log
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
          Audit trail recording candidate stage transitions, recruiter actions, and evaluation logs.
        </p>
      </div>

      {logItems.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <p className="text-sm font-semibold text-[#1A3E32]">No audit events yet</p>
          <p className="text-xs text-gray-500 mt-1">
            Activity history will appear here when audit logging is available.
          </p>
        </div>
      ) : (
      <div className="relative pl-7 space-y-4 before:absolute before:left-2.5 before:top-6 before:bottom-6 before:w-[2px] before:bg-[#8EB398] pt-1">
        {logItems.map((log) => (
          <div key={log.id} className="relative">
            {/* Timeline bullet */}
            <span className="absolute -left-[27px] top-6 w-3.5 h-3.5 rounded-full bg-[#16730F] ring-4 ring-[#F7FAF8] shadow-2xs shrink-0" />

            {/* Log Card Box */}
            <div className="bg-[#EDF5F0] border border-[#CDE5D6] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 shadow-2xs hover:shadow-xs transition-all">
              <div className="space-y-2 min-w-0 flex-1">
                <div className="text-base font-bold text-[#1A3E32] tracking-tight">
                  {log.title}
                </div>
                <div className="flex items-center gap-2.5 text-xs flex-wrap">
                  <span className="text-gray-600 font-normal">
                    By: <strong className="text-[#16730F] font-bold">{log.by}</strong>
                  </span>
                  {log.candidate && (
                    <span className="bg-[#C6E4D1] text-[#16730F] font-bold text-xs px-3.5 py-1 rounded-full">
                      {log.candidate}
                    </span>
                  )}
                  {log.stage && (
                    <span className="bg-[#D5E5DD] text-[#1A3E32] font-semibold text-xs px-3.5 py-1 rounded-full">
                      {log.stage}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-500 font-semibold shrink-0">
                {log.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

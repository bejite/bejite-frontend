import { useState } from "react";
import RecruiterSelect from "../RecruiterSelect";
import {
  Search,
  Filter,
  Users,
  Inbox,
  BarChart3,
  Copy,
  Trash2,
} from "lucide-react";

const PAGE_SIZE = 5;

const CampaignHistoryTable = ({
  campaigns = [],
  searchQuery = "",
  setSearchQuery = () => {},
  statusFilter = "All",
  setStatusFilter = () => {},
  onViewAnalytics = () => {},
  onDuplicate = () => {},
  onDelete = () => {},
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
  const [prevStatusFilter, setPrevStatusFilter] = useState(statusFilter);

  if (searchQuery !== prevSearchQuery || statusFilter !== prevStatusFilter) {
    setPrevSearchQuery(searchQuery);
    setPrevStatusFilter(statusFilter);
    setCurrentPage(1);
  }

  const renderStatusBadge = (status) => {
    switch (status) {
      case "Sent":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
            Sent
          </span>
        );
      case "Scheduled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
            Scheduled
          </span>
        );
      case "Sending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Sending
          </span>
        );
      case "Draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
            Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
            Failed
          </span>
        );
    }
  };

  const filteredCampaigns = campaigns.filter((camp) => {
    const matchesSearch =
      camp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camp.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || camp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });


  const totalPages = Math.ceil(filteredCampaigns.length / PAGE_SIZE) || 1;
  const paginatedCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden font-sans">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
        <div className="flex flex-1 items-center gap-3 max-w-md bg-white px-3 py-2 rounded-xl border border-gray-200 focus-within:border-[#16730F] focus-within:ring-2 focus-within:ring-green-100 transition-all">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns by title, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-sm text-gray-800 placeholder-gray-400 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500 flex items-center gap-1.5 whitespace-nowrap">
            <Filter size={16} />
            Filter Status:
          </span>
          <div className="min-w-[140px]">
            <RecruiterSelect
              name="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "All", label: "All Statuses" },
                { value: "Sent", label: "Sent" },
                { value: "Sending", label: "Sending" },
                { value: "Scheduled", label: "Scheduled" },
                { value: "Draft", label: "Draft" },
                { value: "Failed", label: "Failed" },
              ]}
              placeholder="Status"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
              <th className="py-4 px-6">Campaign Info</th>
              <th className="py-4 px-6">Audience Targeted</th>
              <th className="py-4 px-6">Sent/Scheduled Date</th>
              <th className="py-4 px-6">Delivery Details</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {paginatedCampaigns.length > 0 ? (
              paginatedCampaigns.map((camp) => {
                const deliveryPercent = camp.sentCount
                  ? ((camp.deliveredCount / camp.sentCount) * 100).toFixed(0)
                  : "0";

                return (
                  <tr
                    key={camp.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">
                        {camp.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 max-w-[220px] truncate">
                        Subj: {camp.subject}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-700 flex items-center gap-1">
                        <Users size={14} className="text-gray-400" />
                        {camp.role === "External" ||
                        camp.audienceSource === "external"
                          ? "External list"
                          : camp.role}
                      </div>
                      {camp.profession && camp.profession !== "All" && (
                        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-md mt-1 font-semibold">
                          {camp.profession}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-700">
                        {camp.sentAt
                          ? new Date(camp.sentAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : camp.scheduledAt
                            ? new Date(camp.scheduledAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "Not Scheduled"}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {camp.sentAt
                          ? new Date(camp.sentAt).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : camp.scheduledAt
                            ? `At ` +
                              new Date(camp.scheduledAt).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "Draft Layout"}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {renderStatusBadge(camp.status)}
                      {camp.status === "Sent" && (
                        <div className="text-xs text-gray-500 mt-1.5 font-medium">
                          {camp.deliveredCount.toLocaleString()} /{" "}
                          {camp.sentCount.toLocaleString()} ({deliveryPercent}%)
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {camp.status === "Sent" && (
                          <button
                            onClick={() => onViewAnalytics(camp)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer transition-all"
                            title="View Campaign Analytics"
                          >
                            <BarChart3 size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => onDuplicate(camp)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl cursor-pointer transition-all"
                          title="Duplicate Campaign"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(camp.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl cursor-pointer transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="py-12 text-center text-gray-400">
                  <Inbox size={48} className="mx-auto text-gray-300 mb-3" />
                  No outreach campaigns match search conditions.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredCampaigns.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white text-xs">
          <span className="text-gray-500 font-semibold select-none">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, filteredCampaigns.length)} of{" "}
            {filteredCampaigns.length} entries
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer transition-all"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1.5 font-bold rounded-lg border transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-[#16730F] text-white border-[#16730F] shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignHistoryTable;

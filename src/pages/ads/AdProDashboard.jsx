import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  TrendingUp,
  Users,
  Wallet,
  BarChart3,
  Copy,
  Trash2,
  MoreVertical,
  Filter,
  X,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import NewsFeedLayout from "../../components/layout/NewsFeedLayout";
import CampaignStatusBadge from "../../components/Ads/CampaignStatusBadge";
import MetricCard from "../../components/Ads/MetricCard";
import CampaignChart from "../../components/Ads/CampaignChart";
import ScrollToTop from "../../components/Ads/ScrollTOTOP";
import {
  getAdProDashboard,
  deleteAdProCampaign,
  duplicateAdProCampaign,
} from "../../services/adProApi";
import { formatAdProCurrency, getCampaignProgress } from "../../utils/formatAdProCurrency";

function FilterModal({ isOpen, onClose, onApply, currentFilter }) {
  const [selectedStatus, setSelectedStatus] = useState(currentFilter || "all");

  if (!isOpen) return null;

  const statuses = [
    { value: "all", label: "All Campaigns" },
    { value: "active", label: "Active" },
    { value: "pending_review", label: "Pending Review" },
    { value: "rejected", label: "Rejected" },
    { value: "completed", label: "Completed" },
    { value: "paused", label: "Paused" },
    { value: "draft", label: "Draft" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Filter Campaigns
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Campaign Status
          </label>
          <div className="space-y-2">
            {statuses.map((status) => (
              <button
                key={status.value}
                onClick={() => setSelectedStatus(status.value)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  selectedStatus === status.value
                    ? "border-[#1A3E32] bg-[#1A3E32]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-sm text-gray-700">{status.label}</span>
                {selectedStatus === status.value && (
                  <Check className="w-4 h-4 text-[#1A3E32]" />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onApply(selectedStatus);
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-[#1A3E32] text-white rounded-xl text-sm font-medium hover:bg-[#2d6a54] transition-colors"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdProDashboard() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalSpend: 0,
    totalReach: 0,
    activeCampaigns: 0,
    avgCtr: 0,
  });
  const [adCreditBalance, setAdCreditBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const menuRef = useRef(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAdProDashboard({
        status: statusFilter,
        period: selectedPeriod,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to load AdPro dashboard");
      }

      setCampaigns(response.data?.campaigns || []);
      setChartData(response.data?.chartData || []);
      setDashboardMetrics(
        response.data?.metrics || {
          totalSpend: 0,
          totalReach: 0,
          activeCampaigns: 0,
          avgCtr: 0,
        },
      );
      setAdCreditBalance(Number(response.data?.adCreditBalance) || 0);
    } catch (err) {
      console.error("AdPro dashboard load error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load AdPro dashboard",
      );
      setCampaigns([]);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, selectedPeriod]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCampaigns = campaigns;
  const activeCampaigns = dashboardMetrics.activeCampaigns;

  const metrics = [
    {
      title: "Ad Credit Balance",
      value: formatAdProCurrency(adCreditBalance),
      change: "From ASE plan",
      icon: Wallet,
      color: "from-[#1A3E32] to-emerald-700",
    },
    {
      title: "Total Spend",
      value: formatAdProCurrency(dashboardMetrics.totalSpend),
      change: "+12%",
      icon: Wallet,
      color: "from-emerald-500 to-teal-600",
    },
    {
      title: "Total Reach",
      value: dashboardMetrics.totalReach.toLocaleString(),
      change: "+8%",
      icon: Users,
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Active Campaigns",
      value: activeCampaigns,
      change: "+2",
      icon: TrendingUp,
      color: "from-purple-500 to-violet-600",
    },
    {
      title: "Avg. CTR",
      value: `${dashboardMetrics.avgCtr.toFixed(1)}%`,
      change: "+0.5%",
      icon: BarChart3,
      color: "from-amber-500 to-orange-600",
    },
  ];

  //   const handleEditCampaign = (campaignId) => {
  //     setOpenMenuId(null);
  //     navigate(`/adpro/campaign/${campaignId}/edit`);
  //   };

  const handleDuplicateCampaign = async (campaignId) => {
    setOpenMenuId(null);

    try {
      const response = await duplicateAdProCampaign(campaignId);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to duplicate campaign");
      }
      await loadDashboard();
    } catch (err) {
      console.error("Duplicate campaign error:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to duplicate campaign",
      );
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    setOpenMenuId(null);
    if (!window.confirm("Are you sure you want to delete this campaign?")) {
      return;
    }

    try {
      const response = await deleteAdProCampaign(campaignId);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to delete campaign");
      }
      await loadDashboard();
    } catch (err) {
      console.error("Delete campaign error:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete campaign",
      );
    }
  };

  const handleViewReports = (campaign) => {
    setOpenMenuId(null);
    navigate(`/adpro/campaign/${campaign.id}/reports`, {
      state: { report: null, campaign },
    });
  };

  const handleApplyFilter = (status) => {
    setStatusFilter(status);
  };

  const getFilterButtonText = () => {
    if (statusFilter === "all") return "Filter";
    const statusMap = {
      active: "Active",
      pending_review: "Pending",
      rejected: "Rejected",
      completed: "Completed",
      paused: "Paused",
      draft: "Draft",
    };
    return `Filter: ${statusMap[statusFilter]}`;
  };

  return (
    <NewsFeedLayout showSidebars={false}>
      <div className="bg-[#F8FAFC] min-w-0 w-full overflow-x-hidden">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-w-0">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 py-4 min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-[#1A3E32] to-[#2d6a54] flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-gray-900 truncate">AdPro</h1>
                  <p className="text-xs text-gray-500 hidden sm:block truncate">
                    Precision Advertising Platform
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 min-w-0 w-full lg:w-auto">
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-all text-sm text-gray-700 min-w-0"
                >
                  <Filter className="w-4 h-4 shrink-0" />
                  <span className="truncate">{getFilterButtonText()}</span>
                </button>
                <button
                  onClick={() => navigate("/adpro/create")}
                  className="bg-[#1A3E32] text-white px-4 py-2 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#2d6a54] transition-all text-sm shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Create Campaign
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 lg:py-8 min-w-0">
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 break-words">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A3E32]" />
            </div>
          ) : (
            <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8 min-w-0">
            {metrics.map((metric, index) => (
              <MetricCard key={index} {...metric} />
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-6 mb-6 lg:mb-8 min-w-0 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 min-w-0">
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                  Performance Overview
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Reach and engagement trends over time
                </p>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-lg p-1 w-full sm:w-fit min-w-0 overflow-x-auto">
                {["week", "month", "quarter"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPeriod(p)}
                    className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                      selectedPeriod === p
                        ? "bg-white shadow-sm text-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {p === "week"
                      ? "7 Days"
                      : p === "month"
                        ? "30 Days"
                        : "90 Days"}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-full min-w-0 overflow-hidden">
              <CampaignChart period={selectedPeriod} data={chartData} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-hidden min-w-0">
            <div className="px-3 sm:px-6 py-4 sm:py-5 border-b border-gray-100 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3 min-w-0">
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    Your Campaigns
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5 break-words">
                    {filteredCampaigns.length} total campaigns ·{" "}
                    {activeCampaigns} active
                    {statusFilter !== "all" && (
                      <span className="ml-2 text-[#1A3E32]">
                        (Filtered by {statusFilter})
                      </span>
                    )}
                  </p>
                </div>
                {statusFilter !== "all" && (
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="text-xs text-[#1A3E32] font-medium flex items-center gap-1 hover:gap-2 transition-all shrink-0"
                  >
                    <X className="w-3 h-3" /> Clear filter
                  </button>
                )}
              </div>
            </div>

            <div className="divide-y divide-gray-100 min-w-0">
              {filteredCampaigns.map((campaign, index) => {
                const progress = getCampaignProgress(campaign);
                const isNearBottom = index >= filteredCampaigns.length - 2;
                return (
                  <div
                    key={campaign.id}
                    className={`group min-w-0 ${openMenuId === campaign.id ? "relative z-[200]" : ""}`}
                  >
                    <div className="p-3 sm:p-5 lg:p-6 hover:bg-gray-50/50 transition-all duration-200 min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 min-w-0">
                        <div
                          className="flex-1 min-w-0 cursor-pointer overflow-hidden"
                          onClick={() =>
                            navigate(`/adpro/campaign/${campaign.id}`, {
                              state: { campaign },
                            })
                          }
                        >
                          <div className="flex flex-wrap items-center gap-2 mb-3 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate max-w-full min-w-0">
                              {campaign.name}
                            </h3>
                            <CampaignStatusBadge status={campaign.status} />
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 min-w-0">
                            <div className="min-w-0 col-span-2 sm:col-span-1">
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">
                                Progress
                              </p>
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="flex-1 min-w-0 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#1A3E32] rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-gray-700 shrink-0">
                                  {Math.round(progress)}%
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1.5 truncate">
                                {(campaign.reachDelivered || 0).toLocaleString()} /{" "}
                                {(campaign.reachPurchased || 0).toLocaleString()}
                              </p>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">
                                Delivered
                              </p>
                              <p className="text-sm sm:text-base font-semibold text-gray-900 tabular-nums truncate">
                                {(campaign.reachDelivered || 0).toLocaleString()}
                              </p>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">
                                Spend
                              </p>
                              <p className="text-sm sm:text-base font-semibold text-gray-900 tabular-nums truncate">
                                {formatAdProCurrency(campaign.spend)}
                              </p>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">
                                CTR
                              </p>
                              <p className="text-sm sm:text-base font-semibold text-gray-900 tabular-nums truncate">
                                {campaign.ctr}%
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 self-end lg:self-center shrink-0">
                          <button
                            onClick={() => handleViewReports(campaign)}
                            className="p-2 text-gray-400 hover:text-[#1A3E32] hover:bg-gray-100 rounded-lg transition-all"
                            title="View Reports"
                          >
                            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <div
                            className={`relative ${
                              openMenuId === campaign.id ? "z-[200]" : ""
                            }`}
                            ref={openMenuId === campaign.id ? menuRef : null}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(
                                  openMenuId === campaign.id
                                    ? null
                                    : campaign.id,
                                );
                              }}
                              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                            >
                              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            {openMenuId === campaign.id && (
                              <div
                                className={`absolute right-0 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-[200] ${
                                  isNearBottom
                                    ? "bottom-full mb-2"
                                    : "top-full mt-2"
                                }`}
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicateCampaign(campaign.id);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                >
                                  <Copy className="w-3.5 h-3.5" /> Duplicate
                                </button>
                                <hr className="my-1 border-gray-100" />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCampaign(campaign.id);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredCampaigns.length === 0 && (
              <div className="py-12 sm:py-16 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                  No campaigns found
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                  {statusFilter !== "all"
                    ? `No ${statusFilter} campaigns found. Try a different filter.`
                    : "Create your first campaign to start reaching your audience"}
                </p>
                {statusFilter !== "all" ? (
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="bg-[#1A3E32] text-white px-4 sm:px-5 py-2 rounded-lg sm:rounded-xl font-medium hover:bg-[#2d6a54] transition-colors text-sm"
                  >
                    Clear Filter
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/adpro/create")}
                    className="bg-[#1A3E32] text-white px-4 sm:px-5 py-2 rounded-lg sm:rounded-xl font-medium hover:bg-[#2d6a54] transition-colors text-sm"
                  >
                    Create Campaign
                  </button>
                )}
              </div>
            )}
          </div>
            </>
          )}
        </div>
      </div>

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleApplyFilter}
        currentFilter={statusFilter}
      />

      <ScrollToTop />
    </NewsFeedLayout>
  );
}

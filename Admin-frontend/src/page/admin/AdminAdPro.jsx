import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import AdCampaignReviewCard from "../../components/admin/AdCampaignReviewCard";
import { Search, Megaphone } from "lucide-react";
import { useAdminInbox } from "../../context/AdminInboxContext";

const STATUS_FILTERS = [
  { value: "pending_review", label: "Pending Review" },
  { value: "active", label: "Active" },
  { value: "rejected", label: "Rejected" },
  { value: "paused", label: "Paused" },
  { value: "all", label: "All" },
];

export default function AdminAdPro() {
  const [searchParams] = useSearchParams();
  const highlightedCampaignId = searchParams.get("campaignId");
  const { refresh: refreshInbox } = useAdminInbox();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending_review");
  const [updatingId, setUpdatingId] = useState(null);

  const loadCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchTerm.trim()) params.set("q", searchTerm.trim());
      params.set("limit", "50");

      const response = await axiosInstance.get(
        `/api/admin/data/ad-campaigns?${params.toString()}`,
      );
      setCampaigns(response.data?.data?.campaigns || []);
    } catch (error) {
      console.error("Error fetching ad campaigns:", error);
      toast.error("Failed to load ad campaigns");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    let active = true;
    const fetchFirst = async () => {
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (searchTerm.trim()) params.set("q", searchTerm.trim());
        params.set("limit", "50");

        const response = await axiosInstance.get(
          `/api/admin/data/ad-campaigns?${params.toString()}`,
        );
        if (active) {
          setCampaigns(response.data?.data?.campaigns || []);
        }
      } catch (error) {
        console.error("Error fetching ad campaigns:", error);
        toast.error("Failed to load ad campaigns");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchFirst();
    return () => {
      active = false;
    };
  }, [searchTerm, statusFilter]);

  const updateStatus = async (campaignId, status) => {
    const confirmMessages = {
      active: "Approve this campaign and publish it to the news feed?",
      rejected: "Reject this campaign?",
      paused: "Pause this campaign?",
    };

    if (confirmMessages[status] && !window.confirm(confirmMessages[status])) {
      return;
    }

    try {
      setUpdatingId(campaignId);
      const response = await axiosInstance.patch(
        `/api/admin/data/ad-campaigns/${campaignId}/status`,
        { status },
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Update failed");
      }

      toast.success(response.data.message || "Campaign updated");
      await loadCampaigns();
      try {
        await refreshInbox({ silent: true });
      } catch {
        /* inbox refresh should not fail the campaign update */
      }
    } catch (error) {
      console.error("Error updating campaign status:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update campaign",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = campaigns.filter(
    (campaign) => campaign.status === "pending_review",
  ).length;

  useEffect(() => {
    if (!highlightedCampaignId || loading) return;
    const el = document.getElementById(`adpro-campaign-${highlightedCampaignId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightedCampaignId, loading, campaigns]);

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-[#16730F]/10 flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-[#16730F]" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                AdPro Campaign Review
              </h1>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Review submitted campaigns and approve them for the news feed.
              {statusFilter === "pending_review" && pendingCount > 0 && (
                <span className="ml-1 text-amber-600 font-medium">
                  ({pendingCount} awaiting review)
                </span>
              )}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search campaigns or advertisers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") loadCampaigns();
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#16730F] focus:ring-1 focus:ring-[#16730F] transition"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === filter.value
                  ? "bg-[#16730F] text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-[#16730F]/30"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16730F]" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
            No campaigns found for this filter.
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <AdCampaignReviewCard
                key={campaign.id}
                campaign={campaign}
                updatingId={updatingId}
                highlighted={String(campaign.id) === String(highlightedCampaignId)}
                onUpdateStatus={updateStatus}
              />
            ))}
          </div>
        )}
    </div>
  );
}

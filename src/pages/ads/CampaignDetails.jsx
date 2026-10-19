import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Pause,
  Edit2,
  Users,
  Calendar,
  Clock,
  ExternalLink,
} from "lucide-react";
import {
  FaChartLine,
  FaBullseye,
  FaMoneyBillWave,
  FaMousePointer,
} from "react-icons/fa";
import NewsFeedLayout from "../../components/layout/NewsFeedLayout";
import CampaignStatusBadge from "../../components/Ads/CampaignStatusBadge";
import ScrollToTop from "../../components/Ads/ScrollTOTOP";
import {
  AdProErrorBanner,
  AdProLoadingSpinner,
  AdProNotFound,
} from "../../components/Ads/AdProAsyncState";
import { useAdProCampaign } from "../../hooks/useAdProCampaign";
import {
  formatAdProCurrency,
  formatAdProNumber,
  getCampaignProgress,
} from "../../utils/formatAdProCurrency";

const formatDate = (value) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const EDITABLE_STATUSES = new Set([
  "draft",
  "pending_review",
  "paused",
  "active",
]);

export default function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { campaign, loading, error, mutating, updateCampaign } =
    useAdProCampaign(id);

  const progress = getCampaignProgress(campaign);
  const canEditContent = campaign && EDITABLE_STATUSES.has(campaign.status);

  const handlePauseResume = async () => {
    if (!campaign || mutating) return;

    const nextStatus = campaign.status === "active" ? "paused" : "active";
    try {
      await updateCampaign({ status: nextStatus });
    } catch {
      // Error surfaced via hook state.
    }
  };

  return (
    <NewsFeedLayout showSidebars={false}>
      <ScrollToTop />
      <div className="bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <button
              onClick={() => navigate("/adpro")}
              className="flex items-center gap-2 text-gray-600 hover:text-[#1A3E32] transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Back to Dashboard
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <AdProErrorBanner message={error} />

          {loading ? (
            <AdProLoadingSpinner />
          ) : !campaign ? (
            <AdProNotFound onBack={() => navigate("/adpro")} />
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {campaign.name}
                    </h1>
                    <CampaignStatusBadge status={campaign.status} />
                  </div>
                  <p className="text-sm text-gray-500">
                    Campaign ID: {campaign.id}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {canEditContent && (
                    <>
                      <button
                        onClick={() =>
                          navigate(`/adpro/campaign/${id}/edit`, {
                            state: { campaign },
                          })
                        }
                        className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#1A3E32] flex items-center gap-2 text-sm transition-all"
                      >
                        <Edit2 className="w-4 h-4" /> Edit Content
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/adpro/campaign/${id}/edit-audience`, {
                            state: { campaign },
                          })
                        }
                        className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#1A3E32] flex items-center gap-2 text-sm transition-all"
                      >
                        <Users className="w-4 h-4" /> Edit Audience
                      </button>
                    </>
                  )}
                  {campaign.status === "active" && (
                    <button
                      onClick={handlePauseResume}
                      disabled={mutating}
                      className="px-3 sm:px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-2 text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Pause className="w-4 h-4" />{" "}
                      {mutating ? "Updating..." : "Pause"}
                    </button>
                  )}
                  {campaign.status === "paused" && (
                    <button
                      onClick={handlePauseResume}
                      disabled={mutating}
                      className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-4 h-4" />{" "}
                      {mutating ? "Updating..." : "Resume"}
                    </button>
                  )}
                </div>
              </div>

              {campaign.status === "pending_review" && (
                <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  This campaign is awaiting admin approval. It will not appear in
                  feeds until an admin reviews and approves it.
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#1A3E32]/10 flex items-center justify-center mb-2 group-hover:bg-[#1A3E32]/20 transition-colors">
                    <FaBullseye className="w-4 h-4 sm:w-5 sm:h-5 text-[#1A3E32]" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {formatAdProNumber(campaign.reachDelivered)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Reach Delivered
                  </p>
                </div>
                <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#1A3E32]/10 flex items-center justify-center mb-2 group-hover:bg-[#1A3E32]/20 transition-colors">
                    <FaChartLine className="w-4 h-4 sm:w-5 sm:h-5 text-[#1A3E32]" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {Math.round(progress)}%
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Completion Rate
                  </p>
                </div>
                <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#1A3E32]/10 flex items-center justify-center mb-2 group-hover:bg-[#1A3E32]/20 transition-colors">
                    <FaMoneyBillWave className="w-4 h-4 sm:w-5 sm:h-5 text-[#1A3E32]" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {formatAdProCurrency(campaign.spend)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">Total Spend</p>
                </div>
                <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#1A3E32]/10 flex items-center justify-center mb-2 group-hover:bg-[#1A3E32]/20 transition-colors">
                    <FaMousePointer className="w-4 h-4 sm:w-5 sm:h-5 text-[#1A3E32]" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {campaign.ctr}%
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Click-Through Rate
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6 sm:mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                    Delivery Progress
                  </h3>
                  <span className="text-sm font-medium text-[#1A3E32]">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <div className="h-2 sm:h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#1A3E32] to-[#2d6a54] rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-3 text-xs sm:text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#1A3E32]" />
                    {formatAdProNumber(campaign.reachDelivered)} delivered
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                    {formatAdProNumber(campaign.reachPurchased)} purchased
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 text-base sm:text-lg flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#1A3E32] rounded-full" />
                  Campaign Details
                </h3>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">
                        Ad Headline
                      </p>
                      <p className="font-medium text-sm sm:text-base text-gray-900">
                        {campaign.headline || "Not set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">
                        Landing Destination
                      </p>
                      {campaign.landingDestination ? (
                        <a
                          href={campaign.landingDestination}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1A3E32] hover:underline text-sm sm:text-base break-all inline-flex items-center gap-1 group"
                        >
                          {campaign.landingDestination}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ) : (
                        <p className="text-sm sm:text-base text-gray-500">
                          Not set
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      Ad Description
                    </p>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      {campaign.description || "Not set"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">
                        Start Date
                      </p>
                      <p className="font-medium text-sm sm:text-base text-gray-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#1A3E32]" />
                        {formatDate(campaign.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">
                        End Date
                      </p>
                      <p className="font-medium text-sm sm:text-base text-gray-900 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#1A3E32]" />
                        {formatDate(campaign.endDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </NewsFeedLayout>
  );
}

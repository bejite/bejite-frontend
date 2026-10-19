import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "react-toastify";
import {
  MapPin,
  Users,
  Briefcase,
  GraduationCap,
  Activity,
} from "lucide-react";
import NewsFeedLayout from "../../components/layout/NewsFeedLayout";
import ScrollToTop from "../../components/Ads/ScrollTOTOP";
import AudienceFilterSection from "../../components/Ads/AudienceFilterSection";
import AudienceEstimator from "../../components/Ads/AudienceEstimator";
import AudienceSummary from "../../components/Ads/AudienceSummary";
import {
  AdProErrorBanner,
  AdProLoadingSpinner,
  AdProNotFound,
} from "../../components/Ads/AdProAsyncState";
import { useAdProCampaign } from "../../hooks/useAdProCampaign";
import { estimateAdProAudience } from "../../services/adProApi";
import {
  DEFAULT_CAMPAIGN_AUDIENCE,
  normalizeCampaignAudience,
} from "../../utils/campaignAudience";

const EDITABLE_STATUSES = new Set([
  "draft",
  "pending_review",
  "paused",
  "active",
]);

const REAPPROVAL_STATUSES = new Set(["active", "paused"]);

const targetingSections = [
  { key: "geographic", title: "Geographic Targeting", icon: MapPin },
  { key: "demographic", title: "Demographic Targeting", icon: Users },
  { key: "professional", title: "Professional Targeting", icon: Briefcase },
  { key: "educational", title: "Educational Targeting", icon: GraduationCap },
  { key: "behavioral", title: "Behavioral Targeting", icon: Activity },
];

export default function EditCampaignAudience() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { campaign, loading, error, mutating, updateCampaign } =
    useAdProCampaign(id);
  const [audience, setAudience] = useState({ ...DEFAULT_CAMPAIGN_AUDIENCE });
  const [audienceEstimate, setAudienceEstimate] = useState({
    reach: 0,
    cost: 0,
    loading: false,
  });
  const [estimateError, setEstimateError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [audienceError, setAudienceError] = useState(null);

  useEffect(() => {
    if (!campaign) return;
    setAudience(normalizeCampaignAudience(campaign.audience));
    setAudienceEstimate({
      reach: Number(campaign.reachPurchased) || 0,
      cost: Number(campaign.budget) || 0,
      loading: false,
    });
  }, [campaign]);

  const calculateAudienceEstimate = useCallback(() => {
    setAudienceEstimate((prev) => ({ ...prev, loading: true }));
    setEstimateError(null);

    const timeoutId = setTimeout(async () => {
      try {
        const response = await estimateAdProAudience(audience);
        if (!response?.success) {
          throw new Error(response?.message || "Failed to estimate audience");
        }

        setAudienceEstimate({
          reach: Number(response.data?.reach) || 0,
          cost: Number(response.data?.cost) || 0,
          loading: false,
        });
      } catch (err) {
        console.error("Audience estimate error:", err);
        setEstimateError(
          err.response?.data?.message ||
            err.message ||
            "Could not load audience estimate",
        );
        setAudienceEstimate((prev) => ({ ...prev, loading: false }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [audience]);

  useEffect(() => {
    return calculateAudienceEstimate();
  }, [calculateAudienceEstimate]);

  const handleAudienceUpdate = (filter, value) => {
    setAudienceError(null);
    setAudience((prev) => ({
      ...prev,
      ...(typeof filter === "object" && filter !== null && !Array.isArray(filter)
        ? filter
        : { [filter]: value }),
    }));
  };

  const validateAudience = () => {
    if (audienceEstimate.loading) {
      setAudienceError("Please wait for the audience estimate to finish loading.");
      return false;
    }
    if (estimateError) {
      setAudienceError(estimateError);
      return false;
    }
    if (audienceEstimate.reach <= 0) {
      setAudienceError(
        "Your targeting matches no users. Broaden your filters to continue.",
      );
      return false;
    }
    return true;
  };

  const canEdit = campaign && EDITABLE_STATUSES.has(campaign.status);
  const needsReapproval = campaign && REAPPROVAL_STATUSES.has(campaign.status);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError(null);
    if (!validateAudience()) return;

    try {
      const updated = await updateCampaign({
        audience,
        budget: audienceEstimate.cost,
        reachPurchased: audienceEstimate.reach,
      });

      if (
        updated?.status === "pending_review" ||
        REAPPROVAL_STATUSES.has(campaign?.status)
      ) {
        toast.info(
          "Audience updated. Your campaign is pending admin review before it can go live again.",
        );
      } else {
        toast.success("Audience updated successfully.");
      }
      navigate(`/adpro/campaign/${id}`, { state: { campaign: updated } });
    } catch (err) {
      setSaveError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save audience",
      );
    }
  };

  return (
    <NewsFeedLayout showSidebars={false}>
      <div className="bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <button
              type="button"
              onClick={() => navigate(`/adpro/campaign/${id}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-[#1A3E32] transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Back to Campaign
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Edit Target Audience
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Update who will see this campaign in their feed.
          </p>

          <AdProErrorBanner message={error || saveError || audienceError} />

          {loading ? (
            <AdProLoadingSpinner />
          ) : !campaign ? (
            <AdProNotFound onBack={() => navigate("/adpro")} />
          ) : !canEdit ? (
            <div className="rounded-xl bg-white border border-gray-100 px-6 py-12 text-center">
              <p className="text-gray-600 mb-4">
                Audience cannot be edited in this campaign&apos;s current status.
              </p>
              <button
                type="button"
                onClick={() => navigate(`/adpro/campaign/${id}`)}
                className="text-sm font-medium text-[#1A3E32] hover:underline"
              >
                Back to campaign
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {needsReapproval && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  This campaign was already approved. Saving audience changes will
                  send it back to admin for review.
                </div>
              )}

              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  {targetingSections.map((section) => (
                    <AudienceFilterSection
                      key={section.key}
                      title={section.title}
                      icon={section.icon}
                      audience={audience}
                      onUpdate={handleAudienceUpdate}
                    />
                  ))}
                </div>

                <div className="lg:w-80 xl:w-96 space-y-4">
                  <AudienceEstimator
                    estimate={audienceEstimate}
                    loading={audienceEstimate.loading}
                  />
                  {estimateError && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                      {estimateError}
                    </p>
                  )}
                  <AudienceSummary audience={audience} />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate(`/adpro/campaign/${id}`)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutating || audienceEstimate.loading}
                  className="px-5 py-2.5 bg-[#1A3E32] text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#2d6a54] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mutating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Audience
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <ScrollToTop />
    </NewsFeedLayout>
  );
}

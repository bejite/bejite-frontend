import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "react-toastify";
import NewsFeedLayout from "../../components/layout/NewsFeedLayout";
import ScrollToTop from "../../components/Ads/ScrollTOTOP";
import {
  AdProErrorBanner,
  AdProLoadingSpinner,
  AdProNotFound,
} from "../../components/Ads/AdProAsyncState";
import { useAdProCampaign } from "../../hooks/useAdProCampaign";

const EDITABLE_STATUSES = new Set([
  "draft",
  "pending_review",
  "paused",
  "active",
]);

const REAPPROVAL_STATUSES = new Set(["active", "paused"]);

export default function EditCampaign() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { campaign, loading, error, mutating, updateCampaign } =
    useAdProCampaign(id);
  const [formData, setFormData] = useState({
    name: "",
    headline: "",
    description: "",
    landingDestination: "",
  });
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (!campaign) return;

    setFormData({
      name: campaign.name || "",
      headline: campaign.headline || "",
      description: campaign.description || "",
      landingDestination: campaign.landingDestination || "",
    });
  }, [campaign]);

  const canEdit = campaign && EDITABLE_STATUSES.has(campaign.status);
  const needsReapproval = campaign && REAPPROVAL_STATUSES.has(campaign.status);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError(null);

    try {
      const updated = await updateCampaign(formData);
      if (
        updated?.status === "pending_review" ||
        REAPPROVAL_STATUSES.has(campaign?.status)
      ) {
        toast.info(
          "Changes saved. Your campaign is pending admin review before it can go live again.",
        );
      } else {
        toast.success("Campaign updated successfully.");
      }
      navigate(`/adpro/campaign/${id}`, { state: { campaign: updated } });
    } catch (err) {
      setSaveError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save campaign",
      );
    }
  };

  return (
    <NewsFeedLayout showSidebars={false}>
      <div className="bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <button
              onClick={() => navigate(`/adpro/campaign/${id}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-[#1A3E32] transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Cancel
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
            Edit Campaign
          </h1>

          <AdProErrorBanner message={error || saveError} />

          {loading ? (
            <AdProLoadingSpinner />
          ) : !campaign ? (
            <AdProNotFound onBack={() => navigate("/adpro")} />
          ) : !canEdit ? (
            <div className="rounded-xl bg-white border border-gray-100 px-6 py-12 text-center">
              <p className="text-gray-600 mb-4">
                This campaign cannot be edited in its current status.
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
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 sm:space-y-6"
            >
              {needsReapproval && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  This campaign was already approved. Saving changes will send it
                  back to admin for review and it will not appear in feeds until
                  approved again.
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A3E32] focus:border-transparent outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Headline
                </label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      headline: e.target.value,
                    }))
                  }
                  maxLength={100}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A3E32] focus:border-transparent outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={5}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  maxLength={500}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A3E32] focus:border-transparent outline-none text-sm resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Landing Destination
                </label>
                <input
                  type="text"
                  value={formData.landingDestination}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      landingDestination: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A3E32] focus:border-transparent outline-none text-sm"
                  required
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(`/adpro/campaign/${id}`)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutating}
                  className="px-5 py-2.5 bg-[#1A3E32] text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#2d6a54] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mutating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Changes
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

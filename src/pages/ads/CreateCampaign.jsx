import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, CheckCircle, X } from "lucide-react";
import {
  MapPin,
  Users,
  Briefcase,
  GraduationCap,
  Activity,
} from "lucide-react";
import NewsFeedLayout from "../../components/layout/NewsFeedLayout";
import StepIndicator from "../../components/Ads/StepIndicator";
import MediaUploader from "../../components/Ads/MediaUploader";
import AudienceEstimator from "../../components/Ads/AudienceEstimator";
import AudienceFilterSection from "../../components/Ads/AudienceFilterSection";
import AudienceSummary from "../../components/Ads/AudienceSummary";
import { createAdProCampaign, estimateAdProAudience } from "../../services/adProApi";
import { DEFAULT_CAMPAIGN_AUDIENCE } from "../../utils/campaignAudience";
import { formatAdProCurrency } from "../../utils/formatAdProCurrency";

const steps = [
  { number: 1, label: "Ad Content" },
  { number: 2, label: "Target Audience" },
  { number: 3, label: "Budget & Review" },
];

const targetingSections = [
  { key: "geographic", title: "Geographic Targeting", icon: MapPin },
  { key: "demographic", title: "Demographic Targeting", icon: Users },
  { key: "professional", title: "Professional Targeting", icon: Briefcase },
  { key: "educational", title: "Educational Targeting", icon: GraduationCap },
  { key: "behavioral", title: "Behavioral Targeting", icon: Activity },
];

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [campaignData, setCampaignData] = useState({
    name: "",
    headline: "",
    description: "",
    landingType: "website",
    landingDestination: "",
    media: null,
    mediaPreview: null,
    mediaType: null,
    audience: { ...DEFAULT_CAMPAIGN_AUDIENCE },
  });

  const [audienceEstimate, setAudienceEstimate] = useState({
    reach: 0,
    cost: 0,
    loading: false,
    adCreditBalance: 0,
    sufficientCredit: true,
  });
  const [estimateError, setEstimateError] = useState(null);
  const [errors, setErrors] = useState({});
  const [audienceError, setAudienceError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const calculateAudienceEstimate = useCallback(() => {
    const audience = campaignData.audience;
    setAudienceEstimate((prev) => ({ ...prev, loading: true }));
    setEstimateError(null);

    const timeoutId = setTimeout(async () => {
      try {
        const response = await estimateAdProAudience(audience);
        if (!response?.success) {
          throw new Error(response?.message || "Failed to estimate audience");
        }

        const reach = Number(response.data?.reach) || 0;
        const cost = Number(response.data?.cost) || 0;
        const adCreditBalance = Number(response.data?.adCreditBalance) || 0;
        const sufficientCredit = response.data?.sufficientCredit !== false;

        setAudienceEstimate({
          reach,
          cost,
          loading: false,
          adCreditBalance,
          sufficientCredit,
        });
        setCampaignData((prev) => ({
          ...prev,
          budget: cost,
        }));
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
  }, [campaignData.audience]);

  useEffect(() => {
    return calculateAudienceEstimate();
  }, [calculateAudienceEstimate]);

  const handleMediaUpload = (file, error, type) => {
    if (error) {
      setErrors((prev) => ({ ...prev, media: error }));
      return;
    }
    setCampaignData((prev) => ({
      ...prev,
      media: file,
      mediaPreview: URL.createObjectURL(file),
      mediaType: type,
    }));
    setErrors((prev) => ({ ...prev, media: null }));
  };

  const handleAudienceUpdate = (filter, value) => {
    setAudienceError(null);
    setCampaignData((prev) => ({
      ...prev,
      audience:
        typeof filter === "object" && filter !== null && !Array.isArray(filter)
          ? { ...prev.audience, ...filter }
          : { ...prev.audience, [filter]: value },
    }));
  };

  const validateCampaign = () => {
    const newErrors = {};
    if (!campaignData.name.trim()) newErrors.name = "Campaign name required";
    if (!campaignData.headline.trim())
      newErrors.headline = "Headline required";
    if (campaignData.headline.length > 100)
      newErrors.headline = "Max 100 characters";
    if (!campaignData.description.trim())
      newErrors.description = "Description required";
    if (campaignData.description.length > 500)
      newErrors.description = "Max 500 characters";
    if (!campaignData.media) newErrors.media = "Please upload an ad";
    if (!campaignData.landingDestination.trim()) {
      newErrors.landingDestination = "Landing destination required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAudienceStep = () => {
    if (audienceEstimate.loading) {
      setAudienceError(
        "Please wait for the audience estimate to finish loading.",
      );
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
    setAudienceError(null);
    return true;
  };

  const validateStep = () => {
    if (currentStep === 1) return validateCampaign();
    if (currentStep === 2) return validateAudienceStep();
    return true;
  };

  const validateLaunch = () => {
    if (!validateCampaign()) {
      setCurrentStep(1);
      return false;
    }
    if (!validateAudienceStep()) {
      setCurrentStep(2);
      return false;
    }
    if (
      audienceEstimate.cost > 0 &&
      audienceEstimate.adCreditBalance < audienceEstimate.cost
    ) {
      setSubmitError(
        `Insufficient AdPro credit. Available: ${formatAdProCurrency(audienceEstimate.adCreditBalance)}, required: ${formatAdProCurrency(audienceEstimate.cost)}. Wait until next month or subscribe / upgrade your ASE plan for more ad credit.`,
      );
      setCurrentStep(3);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateLaunch()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await createAdProCampaign({
        name: campaignData.name.trim(),
        headline: campaignData.headline.trim(),
        description: campaignData.description.trim(),
        landingType: campaignData.landingType,
        landingDestination: campaignData.landingDestination.trim(),
        media: campaignData.media,
        mediaType: campaignData.mediaType,
        audience: campaignData.audience,
        budget: audienceEstimate.cost,
        reachPurchased: audienceEstimate.reach,
        status: "pending_review",
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to create campaign");
      }

      navigate("/adpro");
    } catch (err) {
      console.error("Create campaign error:", err);
      setSubmitError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create campaign",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <div className="space-y-4 sm:space-y-5 md:space-y-6 min-w-0">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Campaign Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={campaignData.name}
              onChange={(e) =>
                setCampaignData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Lagos SME Tax Consulting Campaign"
              className={`w-full px-4 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-[#1A3E32] focus:border-transparent outline-none text-sm sm:text-base ${
                errors.name ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ad Media <span className="text-red-500">*</span>
            </label>
            <MediaUploader
              value={
                campaignData.mediaPreview
                  ? {
                      preview: campaignData.mediaPreview,
                      type: campaignData.mediaType,
                    }
                  : null
              }
              onUpload={handleMediaUpload}
              onRemove={() =>
                setCampaignData((prev) => ({
                  ...prev,
                  media: null,
                  mediaPreview: null,
                  mediaType: null,
                }))
              }
              error={errors.media}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Headline <span className="text-red-500">*</span>
              <span className="text-xs text-gray-400 ml-2">
                ({campaignData.headline.length}/100)
              </span>
            </label>
            <input
              type="text"
              value={campaignData.headline}
              onChange={(e) =>
                setCampaignData((prev) => ({
                  ...prev,
                  headline: e.target.value,
                }))
              }
              placeholder="Catchy headline that grabs attention"
              maxLength={100}
              className={`w-full px-4 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-[#1A3E32] focus:border-transparent outline-none text-sm sm:text-base ${
                errors.headline ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.headline && (
              <p className="text-red-500 text-xs mt-1">{errors.headline}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description <span className="text-red-500">*</span>
              <span className="text-xs text-gray-400 ml-2">
                ({campaignData.description.length}/500)
              </span>
            </label>
            <textarea
              rows={4}
              value={campaignData.description}
              onChange={(e) =>
                setCampaignData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe your product, service, or opportunity..."
              maxLength={500}
              className={`w-full px-4 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-[#1A3E32] focus:border-transparent outline-none text-sm sm:text-base resize-none ${
                errors.description ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Landing Destination <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {["website", "whatsapp", "bejite", "email"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setCampaignData((prev) => ({ ...prev, landingType: type }))
                  }
                  className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg capitalize text-xs sm:text-sm transition-all ${
                    campaignData.landingType === type
                      ? "bg-[#1A3E32] text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {type === "bejite" ? "Bejite Message" : type}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={campaignData.landingDestination}
              onChange={(e) =>
                setCampaignData((prev) => ({
                  ...prev,
                  landingDestination: e.target.value,
                }))
              }
              placeholder={
                campaignData.landingType === "website"
                  ? "https://yourwebsite.com"
                  : campaignData.landingType === "whatsapp"
                    ? "https://wa.me/234xxxxxxxxxx"
                    : campaignData.landingType === "email"
                      ? "you@example.com"
                      : "Users will be directed to your Bejite inbox"
              }
              className={`w-full px-4 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-[#1A3E32] focus:border-transparent outline-none text-sm sm:text-base ${
                errors.landingDestination ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.landingDestination && (
              <p className="text-red-500 text-xs mt-1">
                {errors.landingDestination}
              </p>
            )}
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 min-w-0">
          <div className="flex-1 min-w-0 space-y-3 sm:space-y-4 order-2 lg:order-1">
            {targetingSections.map((section) => (
              <AudienceFilterSection
                key={section.key}
                title={section.title}
                icon={section.icon}
                audience={campaignData.audience}
                onUpdate={handleAudienceUpdate}
              />
            ))}
          </div>
          <div className="w-full lg:w-80 xl:w-96 shrink-0 min-w-0 order-1 lg:order-2">
            <div className="lg:sticky lg:top-24 space-y-3">
              <AudienceEstimator
                estimate={audienceEstimate}
                loading={audienceEstimate.loading}
              />
              {estimateError && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  {estimateError}
                </p>
              )}
              {audienceError && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {audienceError}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full min-w-0 max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <div className="bg-gray-50 rounded-xl p-3 sm:p-6 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-4 text-base sm:text-lg">
            Campaign Summary
          </h3>
          <div className="space-y-3 text-sm min-w-0">
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start py-2 border-b min-w-0">
              <span className="text-gray-500 text-xs sm:text-sm shrink-0">
                Campaign Name
              </span>
              <span className="font-medium text-gray-900 text-sm sm:text-base break-words min-w-0 sm:text-right sm:max-w-[60%]">
                {campaignData.name || "Not specified"}
              </span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start py-2 border-b min-w-0">
              <span className="text-gray-500 text-xs sm:text-sm shrink-0">Headline</span>
              <span className="font-medium text-gray-900 text-sm sm:text-base break-words min-w-0 sm:text-right sm:max-w-[60%]">
                {campaignData.headline || "Not specified"}
              </span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start py-2 border-b min-w-0">
              <span className="text-gray-500 text-xs sm:text-sm shrink-0">
                Landing URL
              </span>
              <span className="font-medium text-[#1A3E32] text-sm sm:text-base break-all min-w-0 sm:text-right sm:max-w-[60%]">
                {campaignData.landingDestination || "Not specified"}
              </span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start py-2 border-b min-w-0">
              <span className="text-gray-500 text-xs sm:text-sm shrink-0">
                Target Audience
              </span>
              <span className="font-medium text-gray-900 text-sm sm:text-base sm:text-right">
                {audienceEstimate.reach.toLocaleString()} users
              </span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center py-3 bg-[#1A3E32]/5 rounded-lg px-3 -mx-1 min-w-0">
              <span className="text-gray-700 text-sm font-medium">
                Total Cost
              </span>
              <span className="font-bold text-xl sm:text-2xl text-[#1A3E32] break-words">
                {formatAdProCurrency(audienceEstimate.cost)}
              </span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center py-2 min-w-0">
              <span className="text-gray-500 text-xs sm:text-sm shrink-0">
                Available Ad Credit
              </span>
              <span
                className={`font-semibold text-sm sm:text-base ${
                  audienceEstimate.adCreditBalance >= audienceEstimate.cost
                    ? "text-emerald-700"
                    : "text-red-600"
                }`}
              >
                {formatAdProCurrency(audienceEstimate.adCreditBalance)}
              </span>
            </div>
            {audienceEstimate.adCreditBalance < audienceEstimate.cost && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                You need more AdPro credit to launch this campaign. Wait until
                next month or{" "}
                <button
                  type="button"
                  onClick={() => navigate("/subscription-pricing")}
                  className="underline font-medium hover:text-red-900"
                >
                  view ASE plans
                </button>
                .
              </p>
            )}
          </div>
        </div>

        <AudienceSummary audience={campaignData.audience} className="min-w-0" />

        <div className="bg-blue-50 rounded-xl p-3 sm:p-4 flex items-start gap-3 min-w-0">
          <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            You only pay for guaranteed reach. No extra charges for clicks or
            impressions.
          </p>
        </div>
      </div>
    );
  };

  return (
    <NewsFeedLayout showSidebars={false}>
      <div className="bg-[#F8FAFC] w-full min-w-0 overflow-x-hidden">
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
          <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 min-w-0">
            <div className="py-3 sm:py-4">
              <button
                onClick={() => navigate("/adpro")}
                className="flex items-center gap-2 text-gray-500 hover:text-[#1A3E32] transition-colors text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="break-words">Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-10 min-w-0">
          <div className="mb-4 sm:mb-8 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
              Create New Campaign
            </h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">
              Reach your ideal audience with precision targeting
            </p>
          </div>

          <StepIndicator currentStep={currentStep} steps={steps} />

          {submitError && (
            <div className="mt-4 sm:mt-6 rounded-xl bg-red-50 border border-red-100 px-3 sm:px-4 py-3 text-sm text-red-700 break-words">
              {submitError}
            </div>
          )}

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-6 lg:p-8 mt-4 sm:mt-8 min-w-0 overflow-hidden">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-6 sm:mt-8 pt-6 border-t border-gray-100">
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                >
                  Back
                </button>
              )}
              {currentStep < 3 ? (
                <button
                  onClick={() => {
                    if (validateStep()) {
                      setCurrentStep((prev) => prev + 1);
                    }
                  }}
                  disabled={currentStep === 2 && audienceEstimate.loading}
                  className="px-5 py-2.5 bg-[#1A3E32] text-white rounded-xl hover:bg-[#2d6a54] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm font-medium sm:ml-auto"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    audienceEstimate.adCreditBalance < audienceEstimate.cost
                  }
                  className="px-5 py-2.5 bg-[#1A3E32] text-white rounded-xl hover:bg-[#2d6a54] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm font-medium sm:ml-auto"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Launch Campaign <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </NewsFeedLayout>
  );
}

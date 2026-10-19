import CampaignStatusBadge from "../Ads/CampaignStatusBadge";
import { getLandingHref, getLandingTypeLabel } from "../../utils/landingDestination";
import { parseStateKey, parseCityKey } from "../../utils/countryStateData";
import { Check, X, Pause, Play, ExternalLink } from "lucide-react";

const AUDIENCE_FIELDS = [
  { key: "countries", label: "Countries" },
  { key: "states", label: "States", geographic: "state" },
  { key: "cities", label: "Cities", geographic: "city" },
  { key: "lgas", label: "LGAs" },
  { key: "gender", label: "Gender", single: true },
  { key: "ageRange", label: "Age range" },
  { key: "maritalStatus", label: "Marital status", single: true },
  { key: "jobTitles", label: "Job titles" },
  { key: "industries", label: "Industries" },
  { key: "yearsExperience", label: "Years of experience" },
  { key: "companySize", label: "Company size" },
  { key: "qualifications", label: "Qualifications" },
  { key: "activity", label: "Activity" },
  { key: "jobSeekingStatus", label: "Job seeking status" },
];

function formatAudienceValue(value, single = false) {
  if (single) {
    if (!value || value === "any") return "Any";
    return String(value);
  }
  if (!Array.isArray(value) || value.length === 0) return "Any";
  return value.join(", ");
}

function formatGeographicAudienceValue(geographic, value) {
  if (!Array.isArray(value) || value.length === 0) return null;

  if (geographic === "state") {
    const names = value
      .map((entry) => parseStateKey(entry).state)
      .filter(Boolean);
    return names.length > 0 ? names.join(", ") : null;
  }

  if (geographic === "city") {
    const names = value
      .map((entry) => parseCityKey(entry).city)
      .filter(Boolean);
    return names.length > 0 ? names.join(", ") : null;
  }

  return null;
}

function DetailItem({ label, value, children }) {
  return (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-gray-900 break-words whitespace-pre-wrap">
        {children ?? value ?? "—"}
      </dd>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">{title}</h3>
      <dl>{children}</dl>
    </div>
  );
}

export default function AdCampaignReviewCard({
  campaign,
  updatingId,
  highlighted = false,
  onUpdateStatus,
}) {
  const landingHref = getLandingHref(
    campaign.landingType,
    campaign.landingDestination,
  );
  const audience = campaign.audience || {};

  return (
    <div
      id={`adpro-campaign-${campaign.id}`}
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
        highlighted
          ? "border-[#16730F] ring-2 ring-[#16730F]/30"
          : "border-gray-100"
      }`}
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row gap-5">
          {campaign.mediaUrl && (
            <div className="w-full lg:w-56 rounded-xl overflow-hidden bg-gray-100 shrink-0">
              {campaign.mediaType === "video" ? (
                <video
                  src={campaign.mediaUrl}
                  className="w-full h-auto block object-contain"
                  controls
                />
              ) : (
                <img
                  src={campaign.mediaUrl}
                  alt={campaign.headline}
                  className="w-full h-auto block object-contain"
                />
              )}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h2 className="font-semibold text-gray-900 text-lg">
                    {campaign.name}
                  </h2>
                  <CampaignStatusBadge status={campaign.status} />
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span>
                    Advertiser:{" "}
                    <span className="text-gray-700 font-medium">
                      {campaign.advertiserName || "Unknown"}
                    </span>
                  </span>
                  {campaign.advertiserEmail && (
                    <span>{campaign.advertiserEmail}</span>
                  )}
                  <span>
                    Submitted:{" "}
                    {campaign.createdAt
                      ? new Date(campaign.createdAt).toLocaleString()
                      : "—"}
                  </span>
                </div>
              </div>

              <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                {campaign.status === "pending_review" && (
                  <>
                    <button
                      disabled={updatingId === campaign.id}
                      onClick={() => onUpdateStatus(campaign.id, "active")}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-[#16730F] text-white rounded-xl text-sm font-medium hover:bg-[#125a0c] disabled:opacity-60 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      disabled={updatingId === campaign.id}
                      onClick={() => onUpdateStatus(campaign.id, "rejected")}
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 disabled:opacity-60 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                )}

                {campaign.status === "active" && (
                  <button
                    disabled={updatingId === campaign.id}
                    onClick={() => onUpdateStatus(campaign.id, "paused")}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-amber-200 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-50 disabled:opacity-60 transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </button>
                )}

                {(campaign.status === "paused" ||
                  campaign.status === "rejected") && (
                  <button
                    disabled={updatingId === campaign.id}
                    onClick={() => onUpdateStatus(campaign.id, "active")}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#16730F] text-white rounded-xl text-sm font-medium hover:bg-[#125a0c] disabled:opacity-60 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Activate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Section title="Ad Content">
            <DetailItem label="Campaign name" value={campaign.name} />
            <DetailItem label="Headline" value={campaign.headline} />
            <DetailItem label="Description" value={campaign.description} />
            <DetailItem
              label="Media type"
              value={
                campaign.mediaType
                  ? campaign.mediaType.charAt(0).toUpperCase() +
                    campaign.mediaType.slice(1)
                  : "—"
              }
            />
          </Section>

          <Section title="Landing & Budget">
            <DetailItem
              label="Landing type"
              value={getLandingTypeLabel(campaign.landingType)}
            />
            <DetailItem label="Landing destination">
              {campaign.landingDestination ? (
                landingHref ? (
                  <a
                    href={landingHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#16730F] hover:underline break-all"
                  >
                    {campaign.landingDestination}
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                ) : (
                  campaign.landingDestination
                )
              ) : (
                "—"
              )}
            </DetailItem>
            <DetailItem
              label="Budget"
              value={`₦${Number(campaign.budget || 0).toLocaleString()}`}
            />
            <DetailItem
              label="Reach purchased"
              value={Number(campaign.reachPurchased || 0).toLocaleString()}
            />
            <DetailItem
              label="Reach delivered"
              value={Number(campaign.reachDelivered || 0).toLocaleString()}
            />
            <DetailItem
              label="Spend"
              value={`₦${Number(campaign.spend || 0).toLocaleString()}`}
            />
          </Section>
        </div>

        <Section title="Target Audience">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
            {AUDIENCE_FIELDS.map(({ key, label, single, geographic }) => {
              const rawValue = audience[key];
              const displayValue = geographic
                ? formatGeographicAudienceValue(geographic, rawValue)
                : formatAudienceValue(rawValue, single);

              if (geographic && !displayValue) return null;

              return (
                <DetailItem
                  key={key}
                  label={label}
                  value={displayValue}
                />
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}

import { getAudienceDisplayItems } from "../../utils/audienceDisplay";

export default function AudienceSummary({ audience, className = "" }) {
  const items = getAudienceDisplayItems(audience);

  return (
    <div className={`rounded-xl border border-gray-100 bg-gray-50 p-4 sm:p-5 ${className}`}>
      <h4 className="text-sm font-semibold text-gray-900 mb-3">
        Targeting Summary
      </h4>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">
          All jobseekers on Bejite (no filters applied).
        </p>
      ) : (
        <dl className="space-y-2">
          {items.map(({ key, label, displayValue }) => (
            <div
              key={key}
              className="flex flex-col sm:flex-row sm:justify-between gap-1 py-2 border-b border-gray-100 last:border-0"
            >
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {label}
              </dt>
              <dd className="text-sm text-gray-900 sm:text-right break-words">
                {displayValue}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

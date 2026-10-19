export default function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color,
}) {
  return (
    <div className="bg-white rounded-2xl p-3 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group min-w-0 overflow-hidden">
      <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3 min-w-0">
        <div
          className={`shrink-0 bg-gradient-to-br ${color} p-2 sm:p-2.5 rounded-xl text-white shadow-sm`}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        {change ? (
          <span className="min-w-0 max-w-[55%] text-[10px] sm:text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full truncate text-right">
            {change}
          </span>
        ) : null}
      </div>
      <p
        className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 tabular-nums leading-tight break-words"
        title={typeof value === "string" || typeof value === "number" ? String(value) : undefined}
      >
        {value}
      </p>
      <p className="text-[11px] sm:text-sm text-gray-500 mt-1 truncate" title={title}>
        {title}
      </p>
    </div>
  );
}

export default function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color,
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`bg-gradient-to-br ${color} p-2.5 rounded-xl text-white shadow-sm`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-medium text-[#16730F] bg-[#16730F] px-2 py-1 rounded-full">
          {change}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
    </div>
  );
}

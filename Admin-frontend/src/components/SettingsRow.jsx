import { ChevronRight } from "lucide-react";

export function SettingRow({
  icon: RowIcon,
  iconBg,
  label,
  sublabel,
  action,
  danger,
  onClick,
}) {
  const Icon = RowIcon;
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg || "bg-gray-100"}`}
      >
        <Icon
          className={`w-5 h-5 ${danger ? "text-red-500" : "text-[#1A3E32]"}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold ${danger ? "text-red-500" : "text-gray-900"}`}
        >
          {label}
        </p>
        {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
      {action || <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />}
    </button>
  );
}

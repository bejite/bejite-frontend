import React from "react";

/**
 * Reusable stat card component matching the recruitment design.
 * Variants:
 * - 'green' (default): Light green background, green icon & text
 * - 'red': Light pink/red background, red icon & text
 * - 'amber': Light yellow/amber background, amber icon & text
 */
export default function RecruitmentStatCard({
  icon: Icon,
  value,
  label,
  sublabel,
  variant = "green",
  className = "",
}) {
  const variantStyles = {
    green: {
      bg: "bg-[#F2F8F5] border-[#D5E6DC]",
      iconBg: "bg-[#D8EDE2] text-[#16730F]",
      valueColor: "text-[#1A3E32]",
      labelColor: "text-[#1A3E32]",
      sublabelColor: "text-gray-500",
    },
    red: {
      bg: "bg-[#FDF2F2] border-[#F8D7D7]",
      iconBg: "bg-[#FCE4E4] text-[#D93838]",
      valueColor: "text-[#D93838]",
      labelColor: "text-[#D93838]",
      sublabelColor: "text-[#E55353]",
    },
    amber: {
      bg: "bg-[#FFF9F0] border-[#FBEAD2]",
      iconBg: "bg-[#FDF1DC] text-[#D97706]",
      valueColor: "text-[#D97706]",
      labelColor: "text-[#D97706]",
      sublabelColor: "text-[#D97706]/80",
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.green;

  return (
    <div
      className={`flex items-start gap-2.5 sm:gap-3.5 p-3 sm:p-4 rounded-2xl border ${currentVariant.bg} shadow-xs transition-all duration-200 hover:shadow-md ${className}`}
    >
      {Icon && (
        <div
          className={`shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${currentVariant.iconBg} flex items-center justify-center text-sm sm:text-lg font-bold shadow-xs mt-0.5`}
        >
          <Icon />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div
          className={`text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight ${currentVariant.valueColor} truncate`}
        >
          {value}
        </div>
        <div
          className={`text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider mt-0.5 ${currentVariant.labelColor} truncate`}
          title={label}
        >
          {label}
        </div>
        {sublabel && (
          <div
            className={`text-[10px] sm:text-xs font-medium mt-0.5 ${currentVariant.sublabelColor} truncate`}
            title={sublabel}
          >
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}


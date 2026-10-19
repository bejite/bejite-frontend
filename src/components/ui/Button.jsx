import React from "react";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary", // primary, secondary, outline, danger, amber, ghost
  size = "md", // sm, md, lg
  className = "",
  disabled = false,
  icon: Icon,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 rounded-full shadow-xs";

  const sizeStyles = {
    sm: "text-xs px-3.5 py-1.5",
    md: "text-xs sm:text-sm px-5 py-2.5",
    lg: "text-sm sm:text-base px-6 py-3",
  };

  const variantStyles = {
    primary: "bg-[#16730F] hover:bg-[#125B0C] text-white shadow-md",
    secondary: "bg-[#1A3E32] hover:bg-[#132E25] text-white",
    outline:
      "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 shadow-2xs",
    lightGreen: "bg-[#D5E5DD] hover:bg-[#C2DACB] text-[#16730F]",
    amber: "bg-[#FDEBD0] hover:bg-[#FAD7A0] text-[#B45309]",
    danger: "bg-[#FF3B30] hover:bg-[#E03126] text-white",
    gray: "bg-[#E5E7EB] hover:bg-gray-300 text-gray-800",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {children}
    </button>
  );
}

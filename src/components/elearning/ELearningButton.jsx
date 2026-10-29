import React from "react";

const VARIANT_CLASSES = {
  primary:
    "bg-[#16730F] hover:bg-[#125E0C] text-white border border-[#16730F] shadow-2xs",
  outline:
    "bg-white hover:bg-gray-50 text-gray-800 border border-gray-200",
  soft:
    "bg-[#EAF5EA] hover:bg-[#DCF0DC] text-[#16730F] border border-[#D4EAD4]",
  subtleGray:
    "bg-[#EEF1EE] hover:bg-[#E2E7E2] text-gray-800 border border-transparent",
  ghostGreen:
    "bg-transparent hover:bg-[#EFF5EF] text-[#16730F] border border-transparent",
};

const SIZE_CLASSES = {
  xs: "px-3 py-1.5 text-[11px]",
  sm: "px-3.5 py-2 text-xs",
  md: "px-4 py-2.5 text-xs",
  lg: "px-5 py-3 text-sm",
};

/**
 * Reusable E-Learning button supporting solid green, white outline, soft green, and pill styles.
 */
export default function ELearningButton({
  children,
  variant = "primary",
  size = "md",
  pill = false,
  fullWidth = false,
  leftIcon: LeftIcon = null,
  rightIcon: RightIcon = null,
  type = "button",
  disabled = false,
  onClick,
  className = "",
  ...rest
}) {
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary;
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const radiusClass = pill ? "rounded-full" : "rounded-xl";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 font-semibold transition-all duration-150 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${variantClass} ${sizeClass} ${radiusClass} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...rest}
    >
      {LeftIcon && <LeftIcon className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
      {RightIcon && <RightIcon className="w-3.5 h-3.5 shrink-0" />}
    </button>
  );
}


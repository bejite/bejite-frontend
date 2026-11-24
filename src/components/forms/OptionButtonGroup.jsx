export const OptionButtonGroup = ({
  id,
  label,
  description,
  required = false,
  optional = false,
  options = [],
  value,
  onChange,
  columnsClass = "grid-cols-2 sm:grid-cols-3",
  labelClassName = "block mb-2 font-semibold text-[#1A3E32]",
  size = "md",
}) => {
  const paddingClass = size === "sm" ? "py-2.5 px-3 text-sm" : "py-3 px-3 text-sm sm:text-base";

  return (
    <div id={id}>
      {label && (
        <label className={labelClassName}>
          {label}{" "}
          {required && <span className="text-red-500">*</span>}
          {!required && optional && (
            <span className="font-normal text-gray-500">(optional)</span>
          )}
        </label>
      )}
      {description && (
        <p className="text-sm text-gray-500 mb-3">{description}</p>
      )}
      <div
        role="radiogroup"
        aria-label={label}
        className={`grid ${columnsClass} gap-2.5 sm:gap-3`}
      >
        {options.map((option) => {
          const optionValue =
            typeof option === "string" ? option : option.value;
          const optionLabel =
            typeof option === "string" ? option : option.label;
          const isSelected = value === optionValue;

          return (
            <button
              key={optionValue}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(optionValue)}
              className={`${paddingClass} rounded-xl border font-medium transition-all duration-150 text-center focus:outline-none focus:ring-2 focus:ring-[#16730F]/40 ${
                isSelected
                  ? "bg-[#16730F] text-white border-[#16730F] shadow-sm"
                  : "bg-white border-gray-200 text-gray-700 hover:border-[#16730F] hover:bg-green-50/40"
              }`}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OptionButtonGroup;


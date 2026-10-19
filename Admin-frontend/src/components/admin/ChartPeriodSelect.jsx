import { CHART_PERIODS } from "../../constants/chartPeriods";
import RecruiterSelect from "./RecruiterSelect";

/**
 * Shared Year / 6 months / Week dropdown for admin analytics charts.
 */
const ChartPeriodSelect = ({
  value,
  onChange,
  className = "",
  label = "Period",
  id,
}) => {
  const selectId = id || "chart-period-select";

  return (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      {label && (
        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
          {label}
        </span>
      )}
      <div className="min-w-[130px]">
        <RecruiterSelect
          closeBtn={false}
          id={selectId}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          options={CHART_PERIODS}
          placeholder="Select period"
        />
      </div>
    </div>
  );
};

export default ChartPeriodSelect;

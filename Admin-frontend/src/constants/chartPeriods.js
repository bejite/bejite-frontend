export const CHART_PERIODS = [
  { value: "week", label: "Week progress", days: 7 },
  { value: "six_months", label: "6 months", days: 180 },
  { value: "year", label: "Year", days: 365 },
];

export const DEFAULT_CHART_PERIOD = "week";

export function getChartPeriodLabel(period) {
  return (
    CHART_PERIODS.find((p) => p.value === period)?.label || "Week progress"
  );
}

export function getChartPeriodDays(period) {
  return (
    CHART_PERIODS.find((p) => p.value === period)?.days ||
    CHART_PERIODS[0].days
  );
}

function utcIsoDateFromOffset(daysAgo) {
  const now = new Date();
  const utc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  return new Date(utc - daysAgo * 86400000).toISOString().slice(0, 10);
}

function mapRevenueRows(rows, valueKey) {
  return (rows || []).map((row) => ({
    date: row.date || row.month,
    [valueKey]: Number(row[valueKey] ?? row.revenue ?? 0),
  }));
}

/**
 * Use the API series as-is when it is already a filled window.
 * Only zero-fill sparse ISO day rows for the week view (old APIs).
 * Never rebuild 6-month/year buckets into local calendar days.
 */
export function fillDailyChartSeries(rows, period, valueKey = "revenue") {
  const mapped = mapRevenueRows(rows, valueKey);
  if (period !== "week") return mapped;

  const expectedDays = getChartPeriodDays(period);
  const isoDates = mapped
    .map((row) => String(row.date || "").match(/^(\d{4}-\d{2}-\d{2})/)?.[1])
    .filter(Boolean);

  if (isoDates.length === mapped.length && mapped.length >= expectedDays) {
    return mapped;
  }
  if (isoDates.length === 0) return mapped;

  const byDate = new Map();
  for (const row of mapped) {
    const iso = String(row.date || "").match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
    if (iso) byDate.set(iso, Number(row[valueKey] || 0));
  }

  const series = [];
  for (let offset = expectedDays - 1; offset >= 0; offset -= 1) {
    const key = utcIsoDateFromOffset(offset);
    series.push({ date: key, [valueKey]: byDate.get(key) || 0 });
  }
  return series;
}

/** Show every tick on short ranges; sample labels on longer ranges. */
export function getChartTickInterval(pointCount) {
  if (pointCount <= 14) return 0;
  return Math.max(0, Math.ceil(pointCount / 10) - 1);
}

/** Format chart axis/tooltip labels for ISO dates or pre-formatted buckets. */
export function formatChartTick(value) {
  if (value == null || value === "") return "";
  const str = String(value);
  if (/[A-Za-z]/.test(str) && !/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str;
  }
  const isoDay = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const d = isoDay
    ? new Date(Number(isoDay[1]), Number(isoDay[2]) - 1, Number(isoDay[3]))
    : new Date(str);
  if (Number.isNaN(d.getTime())) return str;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

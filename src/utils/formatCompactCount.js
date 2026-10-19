/**
 * Compact people/network counts: 999 stays exact, 1000 becomes 1K, 1500 becomes 1.5K.
 */
export function formatCompactCount(count) {
  const n = Math.floor(Number(count));
  if (!Number.isFinite(n) || n <= 0) return "0";
  if (n < 1000) return String(n);

  const units = [
    { value: 1_000_000_000, suffix: "B" },
    { value: 1_000_000, suffix: "M" },
    { value: 1_000, suffix: "K" },
  ];

  for (const { value, suffix } of units) {
    if (n >= value) {
      const scaled = n / value;
      const rounded =
        scaled >= 10 ? Math.round(scaled) : Math.round(scaled * 10) / 10;
      const label = Number.isInteger(rounded)
        ? String(rounded)
        : String(rounded);
      return `${label}${suffix}`;
    }
  }

  return String(n);
}

/**
 * Format salary expectation with the candidate's currency (not hardcoded NGN).
 * @param {number|string|null|undefined} amount
 * @param {string|null|undefined} currency ISO code e.g. USD, EUR, NGN
 * @returns {string|null}
 */
export function formatSalaryExpectation(amount, currency) {
  if (amount == null || amount === '') return null;

  const num = Number(amount);
  if (Number.isNaN(num)) return String(amount);

  const code = String(currency || 'NGN')
    .trim()
    .toUpperCase();

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `${num.toLocaleString()} ${code}`;
  }
}

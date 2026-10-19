/**
 * Format salary expectation with the candidate's currency (not hardcoded NGN).
 * @param {number|string|null|undefined} amount
 * @param {string|null|undefined} currency ISO code e.g. USD, EUR, NGN
 * @returns {string|null}
 */
export function formatSalaryExpectation(amount, currency) {
  if (amount == null || amount === '') return null;
  if (String(amount).trim().toLowerCase() === 'any') return null;

  const cleaned = String(amount).replace(/,/g, '').replace(/[^\d.-]/g, '');
  const num = Number(cleaned);
  if (!cleaned || Number.isNaN(num)) return String(amount).trim();

  const code = String(currency || 'NGN')
    .trim()
    .toUpperCase() || 'NGN';

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `${code} ${num.toLocaleString('en-US')}`;
  }
}

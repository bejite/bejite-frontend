import { formatDisplayText } from './displayFormatUtils';

const UNAVAILABLE_STATUSES = new Set([
  'not available',
  'not currently available',
  'unknown',
]);

const IMMEDIATE_STATUSES = new Set([
  'available',
  'immediate',
  'immediately',
  'full-time available',
  'full time available',
]);

const OPEN_STATUSES = new Set([
  'open to offers',
  'available upon request',
]);

const NOTICE_STATUSES = new Set([
  '1 week notice',
  '2 weeks notice',
  '1 month notice',
  '1-2 weeks',
  '1 month',
  '2 months',
  '3+ months',
]);

const FLEXIBLE_STATUSES = new Set([
  'part-time available',
  'weekdays only',
  'weekends only',
  'evenings only',
  'flexible hours',
]);

const PROJECT_STATUSES = new Set([
  'on-call',
  'freelance basis',
  'seasonal availability',
  'temporary availability',
  'contractual availability',
]);

export const AVAILABILITY_TONE_COLORS = {
  immediate: 'bg-[#22C55E]',
  open: 'bg-[#84CC16]',
  notice: 'bg-[#F59E0B]',
  flexible: 'bg-[#0EA5E9]',
  project: 'bg-[#8B5CF6]',
  unavailable: 'bg-[#828282]',
  unknown: 'bg-[#94A3B8]',
};

function normalizeAvailabilityKey(availability) {
  return String(availability ?? '').trim().toLowerCase();
}

/** True when a candidate is open to work. */
export function isCandidateJobAvailable(availability) {
  const normalized = normalizeAvailabilityKey(availability);
  if (!normalized) return false;
  return !UNAVAILABLE_STATUSES.has(normalized);
}

/** Color tier for the availability status dot. */
export function getCandidateAvailabilityTone(availability) {
  const key = normalizeAvailabilityKey(availability);
  if (!key) return 'unknown';
  if (UNAVAILABLE_STATUSES.has(key)) return 'unavailable';
  if (IMMEDIATE_STATUSES.has(key)) return 'immediate';
  if (OPEN_STATUSES.has(key)) return 'open';
  if (NOTICE_STATUSES.has(key)) return 'notice';
  if (FLEXIBLE_STATUSES.has(key)) return 'flexible';
  if (PROJECT_STATUSES.has(key)) return 'project';
  if (isCandidateJobAvailable(availability)) return 'open';
  return 'unknown';
}

export function getCandidateAvailabilityColorClass(availability) {
  return AVAILABILITY_TONE_COLORS[getCandidateAvailabilityTone(availability)];
}

/** Human-readable availability label for tooltips and UI copy. */
export function formatCandidateAvailabilityLabel(availability) {
  const raw = String(availability ?? '').trim();
  if (!raw) return null;
  return formatDisplayText(raw) ?? raw;
}

import { toTitleCaseWords } from './displayFormatUtils';
import { formatRecruiterFullName } from './recruiterDisplayName';

/**
 * Title-case a person's display name from a user/candidate object or raw string.
 */
export function formatDisplayPersonName(input, fallback = 'Guest') {
  if (input == null) return fallback;
  if (typeof input === 'string') {
    const trimmed = input.trim();
    return trimmed ? toTitleCaseWords(trimmed) : fallback;
  }

  const user = input;
  const raw =
    formatRecruiterFullName(
      user.firstName ?? user.first_name,
      user.lastName ?? user.last_name,
    ) ||
    String(user.name ?? '').trim() ||
    String(user.nickname ?? '').trim();

  if (!raw) {
    const email = String(user.email ?? '').trim();
    return email || fallback;
  }

  return toTitleCaseWords(raw);
}

/** Title-case role labels (e.g. jobseeker → Jobseeker, corporate_recruiter → Corporate Recruiter). */
export function formatDisplayRole(role, fallback = 'User') {
  if (role == null || !String(role).trim()) return fallback;
  return toTitleCaseWords(String(role).replace(/[_-]+/g, ' '));
}

/** Format @handle from nickname/username on a user object or raw string. */
export function formatDisplayHandle(input, fallback = null) {
  if (input == null) return fallback;

  const raw =
    typeof input === 'string'
      ? input
      : input.nickname ?? input.username ?? null;

  const trimmed = String(raw ?? '').trim().replace(/^@+/, '');
  if (!trimmed) return fallback;

  const handle = trimmed.toLowerCase().replace(/\s+/g, '_');

  return `@${handle}`;
}

import {
  formatDisplayPhone,
  formatPhoneForStorage,
  normalizePhoneE164,
  isPhoneValid,
} from './phoneUtils';

export { formatDisplayPhone, formatPhoneForStorage, normalizePhoneE164, isPhoneValid };

/** Capitalize the first letter of each word (addresses, cities, names). */
export function toTitleCaseWords(value) {
  if (value == null || value === '') return '';
  return String(value)
    .trim()
    .split(/\s+/)
    .map((word) =>
      word
        .split(/([-'/])/)
        .map((part) => {
          if (part === '-' || part === "'" || part === '/') return part;
          if (!part) return part;
          // Keep trailing punctuation (e.g. "oyo,") but title-case the letters
          const match = part.match(/^([A-Za-z0-9]+)(.*)$/);
          if (!match) return part;
          const [, core, suffix] = match;
          return core.charAt(0).toUpperCase() + core.slice(1).toLowerCase() + suffix;
        })
        .join(''),
    )
    .join(' ');
}

export function formatDisplayEmail(email) {
  if (email == null || String(email).trim() === '') return null;
  return String(email).trim().toLowerCase();
}

export function formatDisplayAddress(...parts) {
  const segments = parts
    .flat()
    .filter((part) => part != null && String(part).trim() !== '')
    .map((part) => toTitleCaseWords(String(part).trim()));
  if (segments.length === 0) return null;
  return segments.join(', ');
}

export function formatCandidateAddress(candidate, bio) {
  const bioParts = [bio?.street, bio?.city, bio?.country].filter(
    (part) => part != null && String(part).trim() !== '',
  );
  if (bioParts.length > 0) {
    return formatDisplayAddress(...bioParts);
  }

  if (!candidate) return null;
  const candidateParts = [
    candidate.address,
    candidate.street,
    candidate.city,
    candidate.country,
  ].filter((part) => part != null && String(part).trim() !== '');
  if (candidateParts.length > 0) {
    return formatDisplayAddress(...candidateParts);
  }

  const fallback = candidate.location || candidate.preferred_country;
  return fallback ? toTitleCaseWords(fallback) : null;
}

/** Trim text without changing user-entered casing (degrees, acronyms, etc.). */
export function formatPreservedText(value) {
  if (value == null || String(value).trim() === '') return null;
  return String(value).trim();
}

/** Title-case a single text field for display (education, bio, job title, location, etc.). */
export function formatEducationText(value) {
  if (value == null || String(value).trim() === '') return null;
  return toTitleCaseWords(String(value));
}

export const formatDisplayText = formatEducationText;

/** Build a display location string from candidate / bio fields. */
export function formatCandidateLocation(candidate, bio) {
  const parts = [
    candidate?.location,
    [candidate?.city, candidate?.country].filter((p) => p != null && String(p).trim()).join(', '),
    [bio?.city, bio?.street, bio?.country].filter((p) => p != null && String(p).trim()).join(', '),
  ]
    .map((p) => (p != null ? String(p).trim() : ''))
    .filter(Boolean);
  const raw = parts[0] || parts[1] || parts[2] || '';
  return formatDisplayText(raw);
}

/** Title-case candidate summary fields shown under the profile name. */
export function getFormattedCandidateProfileFields(candidate = {}, options = {}) {
  const bioRow = options.bio ?? candidate.user_bio?.[0] ?? candidate.user_bio;
  const cvBio = options.cvBio;

  const bioRaw = candidate.bio ?? cvBio?.bio ?? bioRow?.bio;
  const bio =
    bioRaw != null && String(bioRaw).trim() !== ''
      ? String(bioRaw).trim()
      : null;

  return {
    bio,
    title: formatDisplayText(candidate.title),
    location: formatCandidateLocation(candidate, bioRow ?? cvBio),
    remotePreference: formatDisplayText(candidate.remote_preference),
    industry: formatDisplayText(candidate.industry),
    availability: formatDisplayText(candidate.availability),
    preferredCountry: formatDisplayText(candidate.preferred_country),
    preferredState: formatDisplayText(candidate.preferred_state),
    workType: formatDisplayText(candidate.work_type),
    rate: formatDisplayText(candidate.rate),
  };
}

export function getFormattedWorkHistoryFields(work, { legacy = false } = {}) {
  if (!work || typeof work !== 'object') {
    return { title: null, company: null, description: null };
  }
  return {
    title: formatDisplayText(legacy ? work.title : work.job_title ?? work.jobTitle),
    company: formatDisplayText(legacy ? work.company : work.company_name ?? work.companyName),
    description: formatPreservedText(
      legacy ? work.description : work.responsibilities ?? work.description,
    ),
  };
}

const INLINE_BULLET_SPLIT = /\s*(?:[•●·▪◦‣⁃]|\*+|(?:^|\s)-+\s)\s*/;
const LEADING_BULLET = /^(?:[\s\-*•●·▪◦‣⁃]+|\(?\d+[.)]\s*)/;
const TRAILING_BULLET_CLEAN = /[\s\-*•●·▪◦‣⁃]+$/;

/** Split stored responsibility text into separate bullet items for display. */
export function parseResponsibilitiesList(value) {
  if (value == null || String(value).trim() === '') return [];

  const lines = String(value).trim().split(/\n+/);
  const items = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const parts = INLINE_BULLET_SPLIT.test(trimmed)
      ? trimmed.split(INLINE_BULLET_SPLIT)
      : [trimmed];

    for (const part of parts) {
      const cleaned = part
        .replace(LEADING_BULLET, '')
        .replace(TRAILING_BULLET_CLEAN, '')
        .trim();
      if (cleaned && !/^[\s\-*•●·▪◦‣⁃()]+$/.test(cleaned)) {
        items.push(cleaned);
      }
    }
  }

  return items;
}

/**
 * Normalize education row text for display (degree, school, field, location, level).
 */
export function getFormattedEducationFields(education, { legacy = false } = {}) {
  if (!education || typeof education !== 'object') {
    return {
      degree: null,
      institution: null,
      field: null,
      location: null,
      educationLevel: null,
      year: null,
    };
  }

  const institutionRaw = legacy
    ? education.institution
    : education.institution_name ?? education.institutionName ?? education.institution;

  const fieldRaw = legacy
    ? education.field
    : education.field_of_study ?? education.fieldOfStudy ?? education.field;

  return {
    degree: formatPreservedText(education.degree),
    institution: formatEducationText(institutionRaw),
    field: formatEducationText(fieldRaw),
    location: formatEducationText(education.location),
    educationLevel: formatEducationText(
      education.education_level ?? education.educationLevel,
    ),
    year: formatEducationText(education.year),
  };
}

export function buildContactInfoItems({ candidate, bio } = {}) {
  const countryHint = bio?.country || candidate?.country || candidate?.preferred_country;
  const phoneRaw = candidate?.phone || candidate?.phone_number || bio?.phone;
  const phone = formatDisplayPhone(phoneRaw, countryHint);
  const address = formatCandidateAddress(candidate, bio);
  const email = formatDisplayEmail(candidate?.email);

  const items = [
    { type: 'Phone', value: phone },
    { type: 'Email', value: email, isEmail: true },
    { type: 'Address', value: address, fullWidth: true },
    { type: 'LinkedIn', value: candidate?.linkedin_url, href: true },
    { type: 'GitHub', value: candidate?.github_url, href: true },
    { type: 'Portfolio', value: candidate?.portfolio_url, href: true },
  ].filter((item) => item.value);

  return items;
}

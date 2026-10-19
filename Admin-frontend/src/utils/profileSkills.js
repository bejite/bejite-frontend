/**
 * Collect the best available skills payload from profile / CV / candidate sources.
 *
 * @param {{ cv?: { skills?: unknown }, candidate?: Record<string, unknown> } | null | undefined} sources
 * @returns {unknown}
 */
export function resolveProfileSkillSource(sources) {
  const cv = sources?.cv;
  const candidate = sources?.candidate;

  if (Array.isArray(cv?.skills) && cv.skills.length > 0) return cv.skills;
  if (Array.isArray(candidate?._cv?.skills) && candidate._cv.skills.length > 0) {
    return candidate._cv.skills;
  }
  if (Array.isArray(candidate?.user_skills) && candidate.user_skills.length > 0) {
    return candidate.user_skills;
  }
  if (candidate?.skills != null) return candidate.skills;

  return null;
}

const splitSkillText = (text) =>
  String(text)
    .split(/[,;|]/)
    .map((part) => part.trim())
    .filter(Boolean);

/**
 * @param {unknown} experience
 * @returns {string | null}
 */
export function formatSkillExperience(experience) {
  if (experience == null || String(experience).trim() === '') return null;
  const raw = String(experience).trim();
  const n = parseInt(raw.replace(/\D/g, ''), 10);
  if (Number.isNaN(n)) return raw;
  return `${n} ${n === 1 ? 'year' : 'years'}`;
}

/**
 * @typedef {{ id: string | number, name: string, category: string | null, experience: string | null, experienceLabel: string | null }} ProfileSkillItem
 */

/**
 * @param {unknown} skill
 * @returns {ProfileSkillItem[]}
 */
const skillObjectToEntries = (skill) => {
  if (!skill || typeof skill !== 'object') return [];

  const primary = String(
    skill.skill_sector ??
      skill.skillSector ??
      skill.name ??
      skill.skill ??
      skill.title ??
      '',
  ).trim();

  const category =
    skill.category != null && String(skill.category).trim() !== ''
      ? String(skill.category).trim()
      : null;
  const experience =
    skill.experience != null && String(skill.experience).trim() !== ''
      ? String(skill.experience).trim()
      : null;
  const experienceLabel = formatSkillExperience(experience);

  if (!primary) return [];

  const names = splitSkillText(primary);
  if (names.length === 0) return [];

  return names.map((name, index) => ({
    id: skill.id != null ? `${skill.id}-${index}` : `${name}-${category ?? ''}-${index}`,
    name,
    category,
    experience,
    experienceLabel,
  }));
};

/**
 * @param {unknown} skill
 * @returns {ProfileSkillItem[]}
 */
const expandSkillEntry = (skill) => {
  if (skill == null) return [];

  if (typeof skill === 'string') {
    const trimmed = skill.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        return normalizeProfileSkills(JSON.parse(trimmed));
      } catch {
        /* fall through */
      }
    }

    return splitSkillText(trimmed).map((name, index) => ({
      id: `legacy-${name}-${index}`,
      name,
      category: null,
      experience: null,
      experienceLabel: null,
    }));
  }

  if (typeof skill === 'object') {
    return skillObjectToEntries(skill);
  }

  return [];
};

/**
 * @param {unknown} skills
 * @returns {ProfileSkillItem[]}
 */
export function normalizeProfileSkills(skills) {
  if (skills == null) return [];

  if (typeof skills === 'string') {
    const trimmed = skills.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        return normalizeProfileSkills(JSON.parse(trimmed));
      } catch {
        return splitSkillText(trimmed).map((name, index) => ({
          id: `legacy-${name}-${index}`,
          name,
          category: null,
          experience: null,
          experienceLabel: null,
        }));
      }
    }

    return splitSkillText(trimmed).map((name, index) => ({
      id: `legacy-${name}-${index}`,
      name,
      category: null,
      experience: null,
      experienceLabel: null,
    }));
  }

  let items = skills;
  if (!Array.isArray(items)) {
    if (items && typeof items === 'object') {
      items = [items];
    } else {
      return [];
    }
  }

  const entries = [];
  const seen = new Set();

  for (const skill of items) {
    const parts = expandSkillEntry(skill);
    for (const entry of parts) {
      const key = `${entry.name.toLowerCase()}|${(entry.category ?? '').toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      entries.push(entry);
    }
  }

  return entries;
}

/**
 * Flatten profile/CV skills into display labels (e.g. "React", "Tailwind CSS").
 *
 * @param {unknown} skills
 * @returns {string[]}
 */
export function normalizeProfileSkillLabels(skills) {
  return normalizeProfileSkills(skills).map((item) => item.name);
}

/**
 * Ensure CV bundle includes skills from the best available source.
 *
 * @param {Record<string, unknown> | null | undefined} cv
 * @param {Record<string, unknown> | null | undefined} candidate
 * @returns {Record<string, unknown> | null}
 */
export function mergeCvWithCandidateSkills(cv, candidate) {
  const resolved = resolveProfileSkillSource({ cv, candidate });
  const base =
    cv ??
    ({
      bio: null,
      education: [],
      skills: [],
      workHistory: [],
      certificates: [],
      links: null,
    });

  if (!resolved) return base;

  return {
    ...base,
    skills: Array.isArray(resolved) ? resolved : base.skills ?? [],
  };
}

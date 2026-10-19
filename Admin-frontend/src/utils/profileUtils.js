/** Normalize GET /auth/me or profile payloads into the shape Profile renders. */
export function normalizeProfileData(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    ...raw,
    first_name: raw.first_name ?? raw.firstName ?? '',
    last_name: raw.last_name ?? raw.lastName ?? '',
    firstName: raw.firstName ?? raw.first_name,
    lastName: raw.lastName ?? raw.last_name,
    profile_photo: raw.profile_photo ?? raw.profilePhoto ?? raw.image ?? null,
    email: raw.email,
    job_title: raw.job_title ?? raw.jobTitle ?? null,
    title: raw.title ?? raw.job_title ?? raw.jobTitle ?? null,
    phone: raw.phone ?? raw.phone_number,
    phone_number: raw.phone_number ?? raw.phone,
    address: raw.address ?? null,
    city: raw.city ?? null,
    country: raw.country ?? null,
    location:
      raw.location ||
      [raw.address, raw.city, raw.country].filter(Boolean).join(", ") ||
      null,
    bio: raw.bio,
    summary: raw.summary ?? raw.bio,
    company_name: raw.company_name ?? raw.companyName,
    nickname: raw.nickname,
    role: raw.role,
    mode: raw.mode ?? null,
    id_document: raw.id_document ?? null,
    id_type: raw.id_type ?? null,
    verification_consent: raw.verification_consent ?? false,
    website: raw.website,
    linkedin_url: raw.linkedin_url ?? raw.linkedin ?? raw.links?.linkedin ?? null,
    twitter_url: raw.twitter_url ?? raw.twitter ?? raw.links?.twitter ?? null,
    instagram_url:
      raw.instagram_url ?? raw.instagram ?? raw.links?.instagram ?? null,
    links: raw.links ?? {
      linkedin: raw.linkedin_url ?? raw.linkedin ?? null,
      twitter: raw.twitter_url ?? raw.twitter ?? null,
      instagram: raw.instagram_url ?? raw.instagram ?? null,
      portfolio: raw.website ?? null,
    },
  };
}

export function unwrapAuthProfileBody(data) {
  if (!data || typeof data !== 'object') return null;
  if (data.user && typeof data.user === 'object') return data.user;
  if (Object.prototype.hasOwnProperty.call(data, 'success') && data.data != null) {
    return data.data;
  }
  return data;
}

export function profilePayloadLooksUsable(row) {
  if (!row || typeof row !== 'object') return false;
  return !!(
    row.id ||
    row.email ||
    row.first_name ||
    row.firstName ||
    row.last_name ||
    row.lastName ||
    row.nickname
  );
}

/** Merge CV user_bio row into profile display shape. */
export function mergeCvBioIntoProfile(base, bioRow) {
  if (!base) return null;
  if (!bioRow || typeof bioRow !== 'object') return base;
  const locationParts = [bioRow.street, bioRow.city, bioRow.country].filter(
    (p) => p != null && String(p).trim() !== '',
  );
  return normalizeProfileData({
    ...base,
    nickname: bioRow.nickname ?? base.nickname,
    phone: bioRow.phone ?? base.phone,
    phone_number: bioRow.phone ?? base.phone_number,
    bio: bioRow.bio ?? base.bio,
    summary: bioRow.bio ?? base.summary,
    profile_photo: bioRow.profile_photo ?? base.profile_photo,
    location: locationParts.length > 0 ? locationParts.join(', ') : base.location,
    country: bioRow.country ?? base.country,
    city: bioRow.city ?? base.city,
  });
}

/** Build profile row from search dropdown navigation state. */
export function profileFromSearchPreview(preview, userId) {
  if (!preview || typeof preview !== 'object') return null;
  const name = preview.name || '';
  const parts = name.trim().split(/\s+/);
  return normalizeProfileData({
    id: preview.id || userId,
    first_name: preview.firstName ?? parts[0] ?? '',
    last_name: preview.lastName ?? parts.slice(1).join(' ') ?? '',
    title: preview.subtitle ?? preview.title,
    profile_photo: preview.image ?? preview.profile_photo ?? preview.profilePhoto,
    email: preview.email,
  });
}

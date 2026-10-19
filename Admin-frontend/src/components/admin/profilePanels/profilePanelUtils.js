import { formatDisplayRole } from '../../../utils/personDisplayName';

export const PROFILE_PANEL_TYPES = {
  JOBSEEKER: 'jobseeker',
  CORPORATE: 'corporate',
  INDIVIDUAL: 'individual',
  UNKNOWN: 'unknown',
};

export const PROFILE_PANEL_TITLES = {
  [PROFILE_PANEL_TYPES.JOBSEEKER]: 'Jobseeker profile',
  [PROFILE_PANEL_TYPES.CORPORATE]: 'Corporate recruiter profile',
  [PROFILE_PANEL_TYPES.INDIVIDUAL]: 'Individual recruiter profile',
  [PROFILE_PANEL_TYPES.UNKNOWN]: 'User profile',
};

/**
 * @param {{ role?: string, mode?: string }} user
 * @param {{ role?: string, mode?: string } | null} profileUser
 */
export function getAdminProfilePanelType(user, profileUser) {
  const role = String(user?.role || profileUser?.role || '').toLowerCase();
  if (role === 'jobseeker') return PROFILE_PANEL_TYPES.JOBSEEKER;
  if (role !== 'recruiter') return PROFILE_PANEL_TYPES.UNKNOWN;

  const mode = String(profileUser?.mode || user?.mode || '').toLowerCase();
  if (mode === 'corporate') return PROFILE_PANEL_TYPES.CORPORATE;
  if (mode === 'individual') return PROFILE_PANEL_TYPES.INDIVIDUAL;
  return PROFILE_PANEL_TYPES.INDIVIDUAL;
}

export function buildOnlinePresenceItems(profileUser) {
  if (!profileUser) return [];

  return [
    { label: 'Website', value: profileUser.website },
    {
      label: 'LinkedIn',
      value: profileUser.linkedin_url ?? profileUser.links?.linkedin,
    },
    {
      label: 'X (Twitter)',
      value: profileUser.twitter_url ?? profileUser.links?.twitter,
    },
    {
      label: 'Instagram',
      value: profileUser.instagram_url ?? profileUser.links?.instagram,
    },
  ].filter((item) => item.value);
}

/**
 * @param {object} params
 */
export function buildBaseAccountItems({
  user,
  profileUser,
  profileFields,
  isVerified,
  extraItems = [],
  omitLabels = [],
}) {
  const omit = new Set(omitLabels);
  const items = [
    { label: 'User ID', value: String(user.id) },
    { label: 'Email', value: user.email },
    { label: 'Role', value: formatDisplayRole(user.role, 'Unassigned') },
    ...extraItems,
    { label: 'First name', value: profileUser?.firstName ?? user.firstName },
    { label: 'Last name', value: profileUser?.lastName ?? user.lastName },
    { label: 'Nickname', value: profileUser?.nickname },
    { label: 'Username', value: profileUser?.username },
    { label: 'Phone', value: profileUser?.phone ?? profileUser?.phone_number },
    { label: 'Location', value: profileFields.location ?? profileUser?.location },
    { label: 'Company', value: profileUser?.company_name },
    {
      label: 'Job title',
      value: profileUser?.job_title ?? profileUser?.title ?? profileFields.title,
    },
    {
      label: 'Joined',
      value: user.created_at
        ? new Date(user.created_at).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : null,
    },
    { label: 'Email verified', value: isVerified ? 'Yes' : 'No' },
    { label: 'Admin account', value: user.is_admin ? 'Yes' : 'No' },
  ].filter((item) => !omit.has(item.label));

  return items.filter((item) => item.value != null && item.value !== '');
}

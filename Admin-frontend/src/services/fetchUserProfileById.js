import axiosInstance from '../utils/axiosInstance';
import {
  normalizeProfileData,
  profilePayloadLooksUsable,
} from '../utils/profileUtils';

/**
 * Load another user's profile (tries endpoints newest → oldest).
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
export async function fetchUserProfileById(userId) {
  const id = String(userId);
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const tryEndpoint = async (url) => {
    const { data } = await axiosInstance.get(url);
    const row = data?.data ?? data?.user ?? data;
    const normalized = normalizeProfileData(row);
    return profilePayloadLooksUsable(normalized) ? normalized : null;
  };

  const endpoints = [
    `/api/users/${id}/profile`,
    `/api/connections/users/${id}/profile`,
    `/job-board/candidates/by-user/${id}`,
  ];

  for (const url of endpoints) {
    try {
      const profile = await tryEndpoint(url);
      if (profile) return profile;
    } catch {
      /* try next */
    }
  }

  // Legacy candidates route expects integer id — UUIDs cause 500 on older backends.
  if (!isUuid) {
    try {
      const profile = await tryEndpoint(`/api/candidates/${id}`);
      if (profile) return profile;
    } catch {
      /* exhausted */
    }
  }

  return null;
}

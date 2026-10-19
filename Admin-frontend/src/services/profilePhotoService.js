import axiosInstance from '../utils/axiosInstance';

/**
 * GET /auth/user/profile/photo — Bearer token.
 * Resolves jobseeker/recruiter photo according to backend (User, candidates, user_bio).
 * @returns {Promise<string|null>}
 */
export async function fetchCurrentUserProfilePhoto() {
  const { data } = await axiosInstance.get('/auth/user/profile/photo');
  const url = data?.data?.profile_photo ?? null;
  return url && String(url).trim() ? String(url).trim() : null;
}

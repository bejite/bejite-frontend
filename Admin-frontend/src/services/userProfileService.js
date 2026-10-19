import { fetchUserProfileById } from './fetchUserProfileById';

const userProfileService = {
  /**
   * Get user profile by ID
   * Uses connections search response format for consistency (id, firstName, lastName, email, jobTitle, profilePhoto)
   */
  async getUserProfile(userId) {
    const d = await fetchUserProfileById(userId);
    if (!d) return null;
    return {
      id: d.id || userId,
      firstName: d.firstName ?? d.first_name ?? '',
      lastName: d.lastName ?? d.last_name ?? '',
      email: d.email,
      jobTitle: d.jobTitle ?? d.title ?? null,
      profilePhoto: d.profilePhoto ?? d.profile_photo ?? d.image ?? null,
    };
  },
};

export default userProfileService;

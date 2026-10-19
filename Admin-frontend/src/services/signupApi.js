import axiosPublic from './axiosPublic';

/**
 * Discover recruiters during jobseeker signup (no auth token required).
 */
export const discoverRecruitersForSignup = async (email, limit = 50, offset = 0) => {
  const response = await axiosPublic.get('/auth/signup/discover-recruiters', {
    params: { email, limit, offset },
  });
  return response.data;
};

import axiosInstance from '../utils/axiosInstance';

export const followUser = async (userId) => {
  const response = await axiosInstance.post(
    `/api/follows/${encodeURIComponent(String(userId))}`,
  );
  return response.data;
};

export const unfollowUser = async (userId) => {
  const response = await axiosInstance.delete(
    `/api/follows/${encodeURIComponent(String(userId))}`,
  );
  return response.data;
};

export const getFollowStatus = async (userId) => {
  const response = await axiosInstance.get(
    `/api/follows/status/${encodeURIComponent(String(userId))}`,
  );
  return response.data;
};

export const getMyFollowers = async (page = 1, limit = 20, q = '') => {
  const response = await axiosInstance.get('/api/follows/followers', {
    params: {
      page,
      limit,
      ...(String(q || '').trim() ? { q: String(q).trim() } : {}),
    },
  });
  return response.data;
};

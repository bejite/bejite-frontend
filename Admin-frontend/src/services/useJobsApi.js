import { useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';

const handleApiError = (error) => {
  const errorMessage =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    'An error occurred';
  throw errorMessage;
};

const assertBearerAuth = () => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
  if (!token) {
    throw 'Not authenticated. Please sign in again.';
  }
};

const useJobsApi = () => {
  const getJobs = useCallback(async (params) => {
    try {
      assertBearerAuth();
      const response = await axiosInstance.get('/api/jobs', { params });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }, []);

  const getJobById = useCallback(async (jobId) => {
    try {
      assertBearerAuth();
      const response = await axiosInstance.get(`/api/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }, []);

  return { getJobs, getJobById };
};

export default useJobsApi;

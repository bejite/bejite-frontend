import { useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';

const decodeJwtPayload = (token) => {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(atob(payload));
  } catch (error) {
    console.warn('[useRecruiterProfile] Failed to decode token payload:', error);
    return null;
  }
};

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const getResolvedUserId = () => {
  const storedUser = readStoredUser();
  const accessToken = localStorage.getItem('accessToken');
  const legacyAuthToken = localStorage.getItem('authToken');
  const tokenPayload = decodeJwtPayload(accessToken || legacyAuthToken);
  const tokenUserId = tokenPayload?.id || tokenPayload?.userId || tokenPayload?.sub || null;
  return storedUser?.id || storedUser?.userId || storedUser?.sub || tokenUserId || null;
};

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
  const userId = getResolvedUserId();
  if (!userId) {
    throw 'Missing user ID. Please sign in again to continue profile setup.';
  }
};

const useRecruiterProfile = () => {
  /** GET /auth/me — canonical current user */
  const getRecruiterProfile = useCallback(async () => {
    try {
      assertBearerAuth();
      const response = await axiosInstance.get('/auth/me');
      return response.data?.user ?? response.data;
    } catch (error) {
      handleApiError(error);
    }
  }, []);

  const updateBasicDetails = useCallback(async (data) => {
    try {
      assertBearerAuth();
      const response = await axiosInstance.put('/auth/user/profile/basic-details', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }, []);

  const updateProfileSetup = useCallback(async (data) => {
    try {
      assertBearerAuth();
      const response = await axiosInstance.put('/auth/user/profile/profile-setup', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }, []);

  const updateCompanyDetails = useCallback(async (data) => {
    try {
      assertBearerAuth();
      const response = await axiosInstance.put('/auth/user/profile/company-details', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }, []);

  const updateLocation = useCallback(async (data) => {
    try {
      assertBearerAuth();
      const response = await axiosInstance.put('/auth/user/profile/location', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }, []);

  /** POST /auth/user/profile/photo — Bearer token; field name profilePhoto */
  const uploadProfilePhoto = useCallback(async (imageFile) => {
    try {
      assertBearerAuth();
      const formData = new FormData();
      formData.append('profilePhoto', imageFile);
      const response = await axiosInstance.post('/auth/user/profile/photo', formData);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }, []);

  const updateVerificationConsent = useCallback(async (consent = true) => {
    try {
      assertBearerAuth();
      const response = await axiosInstance.put('/auth/user/profile/verification', {
        verification_consent: consent,
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }, []);

  const updateIdType = useCallback(async (idType) => {
    try {
      assertBearerAuth();
      const response = await axiosInstance.put('/auth/user/profile/id-type', {
        id_type: idType,
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }, []);

  const uploadIdDocument = useCallback(async (file) => {
    try {
      assertBearerAuth();
      const formData = new FormData();
      formData.append('idDocument', file);
      const response = await axiosInstance.post('/auth/user/profile/id-document', formData);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }, []);

  return {
    getRecruiterProfile,
    updateBasicDetails,
    updateProfileSetup,
    updateCompanyDetails,
    updateLocation,
    uploadProfilePhoto,
    updateVerificationConsent,
    updateIdType,
    uploadIdDocument,
  };
};

export default useRecruiterProfile;

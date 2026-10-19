import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import useSyncProfilePhoto from '../hooks/useSyncProfilePhoto';

const stepMap = {
  '/individual/basic-details': 1,
  '/individual/profile-setup': 2,
  '/individual/location': 3,
  '/individual/verify': 4,
  '/individual/selectid': 5,
  '/individual/upload': 6,
};

const editStepMap = {
  '/edit-profile/individual/basic-details': 1,
  '/edit-profile/individual/profile-setup': 2,
  '/edit-profile/individual/location': 3,
  '/edit-profile/individual/verify': 4,
  '/edit-profile/individual/selectid': 5,
  '/edit-profile/individual/upload': 6,
};

const IndividualVerificationLayout = () => {
  useSyncProfilePhoto();
  const location = useLocation();
  const { user } = useAuth();

  const isEditMode = location.pathname.startsWith('/edit-profile/individual');

  const currentStep = isEditMode
    ? editStepMap[location.pathname] || 1
    : stepMap[location.pathname] || 1;

  const [recruiterData, setRecruiterData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isEditMode || !user?.id) return;

    let cancelled = false;

    const fetchRecruiterData = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get('/auth/user/profile');
        if (cancelled) return;
        if (response.data?.success && response.data?.data) {
          setRecruiterData(response.data.data);
        } else if (response.data?.data) {
          setRecruiterData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching recruiter data:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchRecruiterData();

    return () => {
      cancelled = true;
    };
  }, [isEditMode, user?.id, location.pathname]);

  const getPath = (step) => {
    if (isEditMode) {
      const paths = [
        '/edit-profile/individual/basic-details',
        '/edit-profile/individual/profile-setup',
        '/edit-profile/individual/location',
        '/edit-profile/individual/verify',
        '/edit-profile/individual/selectid',
        '/edit-profile/individual/upload',
      ];
      return paths[step - 1];
    }

    const paths = [
      '/individual/basic-details',
      '/individual/profile-setup',
      '/individual/location',
      '/individual/verify',
      '/individual/selectid',
      '/individual/upload',
    ];
    return paths[step - 1];
  };

  return (
    <Outlet
      context={{
        currentStep,
        isEditMode,
        recruiterData,
        isLoading,
        getPath,
      }}
    />
  );
};

export default IndividualVerificationLayout;

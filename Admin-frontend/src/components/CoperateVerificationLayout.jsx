import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import axiosInstance from "../utils/axiosInstance";
import useSyncProfilePhoto from "../hooks/useSyncProfilePhoto";

const stepMap = {
  "/corporate/basic-details": 1,
  "/corporate/profile-setup": 2,
  "/corporate/company-details": 3,
  "/corporate/location": 4,
  "/corporate/verify": 5,
  "/corporate/upload": 6,
};

const editStepMap = {
  "/edit-profile/recruiter/basic-details": 1,
  "/edit-profile/recruiter/profile-setup": 2,
  "/edit-profile/recruiter/company-details": 3,
  "/edit-profile/recruiter/location": 4,
  "/edit-profile/recruiter/verify": 5,
  "/edit-profile/recruiter/upload-doc": 6,
};

const CoperateVerificationLayout = () => {
  useSyncProfilePhoto();
  const location = useLocation();
  const { user } = useAuth();
  
  const isEditMode = location.pathname.startsWith("/edit-profile/recruiter");
  
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
        const response = await axiosInstance.get("/auth/user/profile");
        if (cancelled) return;
        if (response.data?.success && response.data?.data) {
          setRecruiterData(response.data.data);
        } else if (response.data?.data) {
          setRecruiterData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching recruiter data:", error);
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
        "/edit-profile/recruiter/basic-details",
        "/edit-profile/recruiter/profile-setup",
        "/edit-profile/recruiter/company-details",
        "/edit-profile/recruiter/location",
        "/edit-profile/recruiter/verify",
        "/edit-profile/recruiter/upload-doc",
      ];
      return paths[step - 1];
    }
    const paths = [
      "/corporate/basic-details",
      "/corporate/profile-setup",
      "/corporate/company-details",
      "/corporate/location",
      "/corporate/verify",
      "/corporate/upload",
    ];
    return paths[step - 1];
  };

  return (   
    <>
      <Outlet context={{ 
        currentStep, 
        isEditMode,
        recruiterData,
        isLoading,
        getPath
      }} />
    </>
  );
};

export default CoperateVerificationLayout;
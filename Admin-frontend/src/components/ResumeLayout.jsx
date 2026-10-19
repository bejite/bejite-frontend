import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import axiosInstance from "../utils/axiosInstance";
import useSyncProfilePhoto from "../hooks/useSyncProfilePhoto";

const stepMap = {
  "/bio": 1, 
  "/education": 2, 
  "/skills": 3,
  "/work-history": 4,
  "/certificate": 5,
  "/links": 6,
  "/job-type": 7,
};

const editStepMap = {
  "/edit-profile/bio": 1, 
  "/edit-profile/education": 2, 
  "/edit-profile/skills": 3,
  "/edit-profile/work-history": 4,
  "/edit-profile/certificate": 5,
  "/edit-profile/links": 6,
  "/edit-profile/job-type": 7,
};

const ResumeLayout = () => {
  useSyncProfilePhoto();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Determine if we're in edit mode
  const isEditMode = location.pathname.startsWith("/edit-profile");
  
  // Get current step based on path
  const currentStep = isEditMode 
    ? editStepMap[location.pathname] || 1
    : stepMap[location.pathname] || 1;
    
  const [cvData, setCvData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Fetch CV data when in edit mode
  useEffect(() => {
    if (isEditMode && user?.id && !initialLoadComplete) {
      const fetchCVData = async () => {
        setIsLoading(true);
        try {
          console.log("Fetching CV data for user:", user.id);
          const response = await axiosInstance.get(`/api/cv-builder/complete/${user.id}`);
          console.log("CV data response:", response.data);
          if (response.data.success) {
            setCvData(response.data.data);
          }
          setInitialLoadComplete(true);
        } catch (error) {
          console.error("Error fetching CV data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCVData();
    }
  }, [isEditMode, user?.id, initialLoadComplete]);

  // Determine navigation paths based on mode
  const getPath = (step) => {
    if (isEditMode) {
      const paths = ["/edit-profile/bio", "/edit-profile/education", "/edit-profile/skills", "/edit-profile/work-history", "/edit-profile/certificate", "/edit-profile/links", "/edit-profile/job-type"];
      return paths[step - 1];
    }
    const paths = ["/bio", "/education", "/skills", "/work-history", "/certificate", "/links", "/job-type"];
    return paths[step - 1];
  };

  return (
    <>
      <Outlet context={{ 
        currentStep, 
        isEditMode,
        cvData,
        isLoading,
        getPath,
        navigate
      }} />
    </>
  );
};

export default ResumeLayout;

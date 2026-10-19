import { Outlet, useLocation } from "react-router-dom";
import useSyncProfilePhoto from "../hooks/useSyncProfilePhoto";

const stepMap = {
  "/individual/basic-details": 1,
  "/individual/profile-setup": 2,
  "/individual/location": 3,
};

const IndividualVerificationLayout = () => {
  useSyncProfilePhoto();
  const location = useLocation();
  const currentStep = stepMap[location.pathname] || 1;

  return (
    <>
      <Outlet context={{ currentStep }} />
    </>
  );
};

export default IndividualVerificationLayout;

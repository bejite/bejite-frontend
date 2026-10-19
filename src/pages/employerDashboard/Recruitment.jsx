import React, { useEffect } from "react";
import NewsFeedLayout from "../../components/layout/NewsFeedLayout";
import RecruitmentMiddle from "../../components/recruitment/RecruitmentMiddle";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import TwoFactorAnnouncementModal from "../../components/modal/TwoFactorAnnouncementModal";

export default function Recruitment() {
  const location = useLocation();

  useEffect(() => {
    // Check if user just completed profile update
    if (location.state?.profileUpdateComplete) {
      toast.success("Profile update completed successfully!");
      // Clear the state to prevent showing toast on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <NewsFeedLayout showSidebars={true}>
      <RecruitmentMiddle />
      <TwoFactorAnnouncementModal />
    </NewsFeedLayout>
  );
}

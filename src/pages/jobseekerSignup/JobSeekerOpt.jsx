import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import MemberCard from "../../components/MemberCard";

const JobSeekerOpt = () => {
  const [showActiveInfo, setShowActiveInfo] = useState(false);
  const [showFreelancerInfo, setShowFreelancerInfo] = useState(false);
  const [showInactiveInfo, setShowInactiveInfo] = useState(false);

  const activeRef = useRef(null);
  const freelancerRef = useRef(null);
  const inactiveRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const emailFromQuery = queryParams.get("email")?.trim() || "";
  const roleFromQuery = queryParams.get("role")?.trim() || "";

  // Prefer URL query (survives refresh); fall back to navigation state
  const { email: emailFromState, role: roleFromState } = location.state || {};
  const email = emailFromQuery || emailFromState || "";
  const role = roleFromQuery || roleFromState || "jobseeker";

  // Log when component mounts
  useEffect(() => {
    console.log("JobSeekerOpt loaded. Email:", email, "Role:", role);
  }, [email, role]);

  // Close info popups on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activeRef.current && !activeRef.current.contains(e.target))
        setShowActiveInfo(false);
      if (freelancerRef.current && !freelancerRef.current.contains(e.target))
        setShowFreelancerInfo(false);
      if (inactiveRef.current && !inactiveRef.current.contains(e.target))
        setShowInactiveInfo(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Cleaned navigation function
  const handleSelectMode = (mode) => {
    console.log("➡️ Mode selected:", { email, role, mode });

    if (!email || !role) {
      console.warn("⚠️ Email or role is missing. Cannot navigate.");
      toast.error("Missing account email. Please restart signup from the verification link.");
      return;
    }

    navigate(
      `/jobconnection?email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}&mode=${encodeURIComponent(mode)}`
    );
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center">
      {/* Logo Header */}
      <div className="w-full px-4 py-6 flex items-center max-w-screen-xl">
        <img src="/assets/images/logo.png" alt="logo" className="h-10" />
      </div>

      {/* Title */}
      <div className="w-full px-4 sm:max-w-xl text-center mt-[10%]">
        <p className="font-dynapuff text-3xl sm:text-4xl font-semibold text-[#16730F]">
          As a Jobseeker
        </p>
        <p className="text-lg sm:text-xl text-[#333] mt-2">
          Select one of the listed options below
        </p>
      </div>

      {/* Options */}
      <div className="w-full max-w-6xl px-4 mt-12 flex flex-wrap justify-center gap-6 py-6 bg-[#E0E0E01A] rounded-2xl border border-[#82828226]">
        <MemberCard
          label={<span className="italic cursor-pointer">ACTIVE JOBSEEKER</span>}
          iconSrc="/assets/images/profile-tick.svg"
          infoText="As an ACTIVE jobseeker, employers can search you out using the advanced search engine (ASE)."
          position="above-icon"
          showInfo={showActiveInfo}
          setShowInfo={setShowActiveInfo}
          containerRef={activeRef}
          onClick={() => handleSelectMode("active_jobseeker")}
        />

        <MemberCard
          label={<span className="italic cursor-pointer">FREELANCER</span>}
          iconSrc="/assets/images/freelic2.svg"
          infoText="As a FREELANCER, employers can search you out using the advanced search engine (ASE)."
          position="above-icon"
          showInfo={showFreelancerInfo}
          setShowInfo={setShowFreelancerInfo}
          containerRef={freelancerRef}
          onClick={() => handleSelectMode("freelancer")}
        />

        <MemberCard
          label={<span className="italic cursor-pointer">INACTIVE JOBSEEKER</span>}
          iconSrc="/assets/images/profile.svg"
          infoText="As an INACTIVE jobseeker, employers cannot search you out on the platform."
          position="below-card"
          showInfo={showInactiveInfo}
          setShowInfo={setShowInactiveInfo}
          containerRef={inactiveRef}
          onClick={() => handleSelectMode("inactive_jobseeker")}
        />
      </div>
    </div>
  );
};

export default JobSeekerOpt;

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Resume = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { followings } = useSelector((state) => state.followings);
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const { email, firstName, lastName, role, mode } = location.state || {};

  const stateData = {
    email: email || userData.email || "",
    firstName: firstName || userData.firstName || "",
    lastName: lastName || userData.lastName || "",
    role: role || "",
    mode: mode || "",
    followings: followings || [],
  };

  return (
    <div className="h-dvh overflow-hidden bg-white flex flex-col">
      <div className="shrink-0 w-full px-4 py-4 sm:py-5 flex justify-start items-center max-w-screen-xl mx-auto">
        <img
          src="/assets/images/logo.png"
          alt="logo"
          className="h-10"
        />
      </div>

      <div className="flex-1 min-h-0 flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 sm:px-6 text-center gap-3 sm:gap-4 md:gap-5">
        <div className="flex-1 min-h-0 w-full flex items-center justify-center max-h-[38vh] sm:max-h-[42vh]">
          <img
            src="/assets/images/Frame.svg"
            alt="Resume Visual"
            className="max-h-full max-w-[min(100%,320px)] sm:max-w-[min(100%,380px)] w-auto h-auto object-contain mx-auto"
          />
        </div>

        <div className="shrink-0 w-full max-w-3xl px-2">
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-norican font-semibold text-[#16730F] mb-2 sm:mb-3 leading-tight">
            Build Your Resume. Get Noticed.
          </p>
          <p className="text-[#333] text-sm sm:text-base md:text-lg leading-snug sm:leading-relaxed">
            Follow the next steps to create a smart, professional CV that connects you
            to the right employers faster and easier.
          </p>
        </div>

        <div className="shrink-0 w-full flex justify-center pt-1 pb-2 sm:pb-4">
          <button
            type="button"
            className="w-full max-w-[321px] h-11 sm:h-12 bg-[#16730F] rounded-full text-white shadow-md text-sm sm:text-base font-medium transition-all hover:bg-[#145a0c]"
            onClick={() => navigate("/bio", { state: stateData })}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default Resume;

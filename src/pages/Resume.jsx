import React from "react";
import { useNavigate } from "react-router-dom";

const Resume = () => {

  const navigate = useNavigate()
  return (
    <div className="bg-white min-h-screen flex flex-col items-center">
     
      <div className="w-full px-4 py-6 flex justify-start items-center max-w-screen-xl mx-auto">
        <img
          src="/assets/images/logo.png"
          alt="logo"
          className="h-10"
        />
      </div>

    
      <div className="flex flex-col items-center justify-center w-full px-4 max-w-4xl text-center mt-[5%]">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg mb-6 mt-auto">
          <img src="/assets/images/Frame.svg" alt="Resume Visual" className="m-auto" />
        </div>

        <div className="w-full max-w-3xl mb-8">
          <p className="text-2xl sm:text-3xl md:text-5xl font-norican font-semibold text-[#E63357] mb-4">
            Build Your Resume. Get Noticed.
          </p>
          <p className="text-[#FF6F61] text-base sm:text-lg md:text-xl font-normal leading-relaxed">
            Follow the next steps to create a smart, professional CV that connects <br className="hidden sm:block" />
            you to the right employers faster and easier.
          </p>
        </div>

        <div className="mt-4 w-full flex justify-center">
          <button className="w-full max-w-[321px] h-12 bg-[#16730F] border border-[#16730F] rounded-full text-white shadow-md text-base font-medium transition-all hover:bg-[#145a0c]"
           onClick={()=>navigate("/bio")}>
            
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default Resume;


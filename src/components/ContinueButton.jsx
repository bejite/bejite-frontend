

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  SIGNUP_BTN_DISABLED,
  SIGNUP_BTN_ENABLED,
} from "../constants/signupTheme";

const ContinueButton = ({ isEnabled }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isEnabled) {
      navigate("/");
    }
  };

  return (
    <div className="w-full flex justify-center sm:justify-end mt-10 px-4">
      <button
        className={`w-52 h-12 rounded-full font-bold text-white transition-all duration-300 ${
          isEnabled ? SIGNUP_BTN_ENABLED : SIGNUP_BTN_DISABLED
        }`}    
        disabled={!isEnabled}
        onClick={handleClick}
      >
        Continue
      </button>
    </div>
  );
};

export default ContinueButton;

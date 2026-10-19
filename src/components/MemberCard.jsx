import React from "react";
import InfoBox from "./InfoBox";

const MemberCard = ({
  label,
  iconSrc,
  infoText,
  position,
  showInfo,
  setShowInfo,
  containerRef,
  onClick,
}) => {
  const handleClick = () => {
    console.log("🧩 MemberCard clicked:", label);
    if (onClick) onClick();
  };

  const handleInfoClick = (e) => {
    e.stopPropagation();
    setShowInfo((prev) => !prev);
  };

  return (
    <div
      className="w-[90%] sm:w-[270px] h-auto relative text-center cursor-pointer"
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <img
        className="m-auto pointer-events-none select-none"
        src={iconSrc}
        alt={label}
      />
      <div className="mt-5 relative bg-[#16730F] shadow-2xl rounded-2xl py-3 flex justify-center items-center gap-2">
        <p className="text-white text-sm sm:text-base font-medium pointer-events-none">
          {label}
        </p>
        <div
          ref={containerRef}
          className="relative"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {showInfo && <InfoBox text={infoText} position={position} />}
          <button
            type="button"
            aria-label={`More information about ${label}`}
            className="w-5 h-5 cursor-pointer bg-transparent border-0 p-0 flex items-center justify-center"
            onClick={handleInfoClick}
          >
            <img
              src="/assets/images/questiontag.svg"
              alt=""
              className="w-5 h-5 pointer-events-none"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberCard;
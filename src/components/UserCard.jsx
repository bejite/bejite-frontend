

import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa";

const UserCard = ({ user, isAdded, onAdd, onRemove, onToggle }) => {
  const handleAction = () => {
    if (onToggle) {
      onToggle(user.id);
      return;
    }
    if (isAdded) {
      onRemove?.(user.id);
    } else {
      onAdd?.(user.id);
    }
  };

  return (
    <div className="px-4 py-3 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 w-full sm:w-[300px] text-center sm:text-left">
          <div className="flex justify-center sm:justify-start mb-2 sm:mb-0">
            <img
              className="rounded-full w-12 h-12 object-cover"
              src={user.img}
              alt={user.name}
            />
          </div>
          <div className="flex flex-col items-center sm:items-start justify-center">
            <p className="text-lg sm:text-[20px] font-bold text-[#16730F]">{user.name}</p>
            <p className="text-[#1A3E32] text-sm sm:text-base mt-1">{user.role}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAction}
          aria-pressed={isAdded}
          aria-label={isAdded ? `Remove ${user.name}` : `Add ${user.name}`}
          title={isAdded ? "Click to remove recruiter" : "Click to select recruiter"}
          className={`group flex justify-center items-center gap-2 rounded-3xl px-4 py-1.5 shadow-2xl cursor-pointer w-full sm:w-28 mx-auto sm:mx-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16730F]/50 ${
            isAdded
              ? "bg-red-50 border border-red-300 text-red-700 sm:bg-[#E0E0E040] sm:border-[#1A3E32]/20 sm:text-[#1A3E32] sm:hover:bg-red-50 sm:hover:border-red-300 sm:hover:text-red-700"
              : "bg-[#16730F] text-white hover:bg-[#125d0c]"
          }`}
        >
          {isAdded ? (
            <>
              {/* Mobile: always show Remove (no hover). Desktop: Added → Remove on hover. */}
              <FaTimes className="text-xs sm:hidden" aria-hidden="true" />
              <span className="font-medium sm:hidden">Remove</span>
              <FaCheck
                className="text-xs hidden sm:inline-block sm:group-hover:hidden sm:group-focus-visible:hidden"
                aria-hidden="true"
              />
              <span className="font-medium hidden sm:inline sm:group-hover:hidden sm:group-focus-visible:hidden">
                Added
              </span>
              <FaTimes
                className="hidden text-xs sm:group-hover:inline-block sm:group-focus-visible:inline-block"
                aria-hidden="true"
              />
              <span className="hidden font-medium sm:group-hover:inline sm:group-focus-visible:inline">
                Remove
              </span>
            </>
          ) : (
            <>
              <span className="font-bold text-lg leading-none" aria-hidden="true">+</span>
              <span className="font-medium">Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UserCard;

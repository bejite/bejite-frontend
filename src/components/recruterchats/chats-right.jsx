import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";
import DisplayNameWithBadge from "../DisplayNameWithBadge";

function ChatsRight({ selectedChat, onBack }) {
  const navigate = useNavigate();
  const otherUser = selectedChat?.other_user;
  const otherUserId = selectedChat?.other_user_id || otherUser?.id || null;

  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/uploads")) {
      const baseUrl = API_URL || "http://localhost:3001";
      return `${baseUrl}${imagePath}`;
    }
    return `${API_URL || "http://localhost:3001"}${imagePath}`;
  };

  const getDisplayName = () => {
    if (!otherUser) return "Select a chat";
    if (otherUser.name) return otherUser.name;
    const first = otherUser.firstName || "";
    const last = otherUser.lastName || "";
    const full = `${first} ${last}`.trim();
    return full || "User";
  };

  const getDisplayRole = () => {
    if (!otherUser?.role) return "User";
    return otherUser.role.charAt(0).toUpperCase() + otherUser.role.slice(1);
  };

  const getInitials = () => {
    const first = (otherUser?.firstName || "").trim().charAt(0).toUpperCase();
    const last = (otherUser?.lastName || "").trim().charAt(0).toUpperCase();
    return `${first}${last}` || "U";
  };

  const profileImage = getProfileImageUrl(
    otherUser?.profilePictureUrl ||
      otherUser?.profile_photo ||
      otherUser?.profilePhoto,
  );

  const handleViewProfile = () => {
    if (otherUserId) {
      navigate(`/user-profile/${otherUserId}`);
    }
  };

  if (!selectedChat || !otherUser) {
    return (
      <div className="bg-[#F5F5F5] h-full p-2 flex items-center justify-center">
        <p className="text-[#16730F] text-sm text-center px-4">
          Select a conversation to view profile details
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F5F5] h-full">
      <aside className="bg-[#1A3E32] rounded-2xl h-full overflow-y-auto nfl-sidebar-scroll flex flex-col">
        <div className="bg-[#16730F] rounded-t-2xl p-4 sm:p-5 flex flex-col items-center">
          <div className="w-full flex items-center justify-between lg:hidden mb-2">
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="flex items-center gap-1.5 text-white/90 hover:text-white text-xs font-medium bg-black/20 px-3 py-1.5 rounded-full transition"
            >
              <FaArrowLeft className="text-xs" />
              <span>Back to Chat</span>
            </button>
          </div>

          <div className="flex flex-col items-center w-full max-w-full min-w-0">
            <div className="relative mt-2 rounded-full border-4 border-[#16730F] shadow-md shrink-0">
              {profileImage ? (
                <img
                  className="w-20 h-20 rounded-full object-cover"
                  src={profileImage}
                  alt={getDisplayName()}
                  loading="lazy"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#556B1F] text-white font-bold text-xl flex items-center justify-center">
                  {getInitials()}
                </div>
              )}
            </div>
            <div className="text-white text-center mt-3 w-full max-w-full px-3 min-w-0 flex flex-col items-center">
              <DisplayNameWithBadge
                user={otherUser}
                fallback={getDisplayName()}
                badgeSize="sm"
                badgePlacement="below"
                truncate={false}
                className="items-center justify-center w-full max-w-full min-w-0"
                nameClassName="text-base sm:text-lg font-semibold text-white text-center break-words whitespace-normal leading-snug w-full px-1"
              />
              <p className="text-xs sm:text-sm text-white/80 mt-1.5 font-medium">
                {getDisplayRole()}
              </p>
            </div>
            <div className="w-36 mx-auto mt-4">
              <button
                type="button"
                onClick={handleViewProfile}
                disabled={!otherUserId}
                className="bg-[#6B8E23] py-2 text-xs text-white w-full rounded-3xl hover:bg-[#5a7720] transition disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                aria-label="View Profile"
              >
                View Profile
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#16730F] px-5 py-5 space-y-4 flex-1">
          {[
            { label: "Email", value: otherUser.email || "Not provided" },
            { label: "Website", value: otherUser.website || "Not provided" },
          ].map((item) => (
            <div key={item.label} className="min-w-0">
              <hr className="border-[#6B8E23] mb-3 opacity-60" />
              <p className="text-white/70 text-xs mb-1 font-medium">
                {item.label}
              </p>
              <p className="text-white text-sm break-all font-normal">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default ChatsRight;

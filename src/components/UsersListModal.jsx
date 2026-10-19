import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaUserPlus } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import {
  getConnectionStatus as fetchConnectionStatus,
  sendConnectionRequest,
} from "../services/connectionsApi";
import { followUser, getFollowStatus } from "../services/followsApi";
import { getAuthorProfileImageUrl } from "../utils/profileImageUtils";
import { getUser } from "../utils/tokenManager";
import { resolveRecruiterMode } from "../utils/recruiterProfilePaths";

function getUserId(user) {
  return user?.id ?? user?.userId ?? user?.authorId ?? null;
}

async function resolveRelationship(userId, currentUserId) {
  if (!userId) return "none";
  if (String(userId) === String(currentUserId)) return "self";

  const status = await fetchConnectionStatus(userId);
  if (status.isConnected) return "connected";
  if (status.pendingOutgoing) return "pending";
  if (status.pendingIncoming) return "incoming";

  if (status.viewerIsCorporate) return "none";

  if (status.isCorporate) {
    const follow = await getFollowStatus(userId);
    return follow.isFollowing ? "following" : "can_follow";
  }

  return "can_connect";
}

/**
 * UsersListModal - Displays a list of users (likers, commenters, or sharers)
 */
const UsersListModal = ({ isOpen, onClose, title, users, type, loading }) => {
  const navigate = useNavigate();
  const [relationshipByUserId, setRelationshipByUserId] = useState({});
  const [statusLoading, setStatusLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(null);

  const currentUser = getUser();
  const currentUserId = currentUser?.id;
  const viewerIsCorporate =
    String(currentUser?.role || "").toLowerCase() === "recruiter" &&
    resolveRecruiterMode(currentUser) === "corporate";

  const loadRelationships = useCallback(async () => {
    if (!users?.length) {
      setRelationshipByUserId({});
      return;
    }

    setStatusLoading(true);
    try {
      const entries = await Promise.all(
        users.map(async (user) => {
          const userId = getUserId(user);
          if (!userId) return null;
          try {
            const relationship = await resolveRelationship(userId, currentUserId);
            return [String(userId), relationship];
          } catch (err) {
            console.error("Error resolving relationship:", err);
            return [String(userId), "none"];
          }
        }),
      );
      setRelationshipByUserId(
        Object.fromEntries(entries.filter(Boolean)),
      );
    } finally {
      setStatusLoading(false);
    }
  }, [users, currentUserId]);

  useEffect(() => {
    if (isOpen && (type === "likes" || type === "shares")) {
      loadRelationships();
    } else if (!isOpen) {
      setRelationshipByUserId({});
      setSendingRequest(null);
    }
  }, [isOpen, type, loadRelationships]);

  const handleUserClick = (userId) => {
    if (userId) {
      onClose();
      navigate(`/user-profile/${userId}`);
    }
  };

  const handleConnect = async (e, userId) => {
    e.stopPropagation();
    if (viewerIsCorporate || !userId) return;

    const relationship = relationshipByUserId[String(userId)];
    if (
      relationship !== "can_connect" &&
      relationship !== "can_follow"
    ) {
      return;
    }

    try {
      setSendingRequest(userId);
      if (relationship === "can_follow") {
        await followUser(userId);
        setRelationshipByUserId((prev) => ({
          ...prev,
          [String(userId)]: "following",
        }));
      } else {
        await sendConnectionRequest(userId);
        setRelationshipByUserId((prev) => ({
          ...prev,
          [String(userId)]: "pending",
        }));
      }
    } catch (err) {
      console.error("Error sending network request:", err);
      const message = String(err?.response?.data?.error || "").toLowerCase();
      if (message.includes("already connected")) {
        setRelationshipByUserId((prev) => ({
          ...prev,
          [String(userId)]: "connected",
        }));
      } else if (message.includes("pending request")) {
        setRelationshipByUserId((prev) => ({
          ...prev,
          [String(userId)]: "pending",
        }));
      }
    } finally {
      setSendingRequest(null);
    }
  };

  const renderRelationshipAction = (userId) => {
    if (!userId || String(userId) === String(currentUserId) || viewerIsCorporate) {
      return null;
    }

    const relationship = relationshipByUserId[String(userId)];

    if (statusLoading && !relationship) {
      return (
        <Loader2
          className="w-4 h-4 animate-spin text-[#16730F]"
          aria-label="Loading connection status"
        />
      );
    }

    if (relationship === "connected") {
      return <span className="text-xs text-green-600 font-medium">Connected</span>;
    }
    if (relationship === "following") {
      return <span className="text-xs text-green-600 font-medium">Following</span>;
    }
    if (relationship === "pending") {
      return <span className="text-xs text-amber-600 font-medium">Pending</span>;
    }
    if (relationship === "incoming") {
      return (
        <span className="text-xs text-amber-600 font-medium">Request received</span>
      );
    }
    if (relationship === "can_connect" || relationship === "can_follow") {
      return (
        <button
          type="button"
          onClick={(e) => handleConnect(e, userId)}
          disabled={sendingRequest === userId}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#16730F] text-white text-xs rounded-full hover:bg-[#145a0c] disabled:opacity-50 transition-colors"
        >
          <FaUserPlus />
          {sendingRequest === userId ? "Sending..." : "Connect"}
        </button>
      );
    }

    return null;
  };

  if (!isOpen) return null;

  const renderUserItem = (user) => {
    const userId = getUserId(user);
    const userName =
      user.name ||
      (user.firstName ? `${user.firstName} ${user.lastName}`.trim() : "User");

    return (
      <div
        key={userId || userName}
        className="flex items-center justify-between gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
        onClick={() => handleUserClick(userId)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={getAuthorProfileImageUrl(user)}
            alt={userName}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="font-semibold text-sm text-[#16730F] truncate">
              {userName}
            </p>
            {user.headline && (
              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                {user.headline}
              </p>
            )}
            {user.role && (
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            )}
          </div>
        </div>

        {renderRelationshipAction(userId)}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl border border-gray-300 shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-300">
          <h2 className="text-lg font-semibold text-[#1A3E32]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto nfl-scroll scroll-smooth">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading {type}...
            </div>
          ) : users && users.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {users.map((user) => renderUserItem(user))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">No {type} yet</div>
          )}
        </div>

        <div className="p-4 border-t border-gray-300">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersListModal;

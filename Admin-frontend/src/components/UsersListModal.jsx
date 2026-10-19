import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaUserPlus } from "react-icons/fa";
import {
  getConnections,
  sendConnectionRequest,
} from "../services/connectionsApi";
import { getAuthorProfileImageUrl } from "../utils/profileImageUtils";
import { getUser } from "../utils/tokenManager";

/**
 * UsersListModal - Displays a list of users (likers, commenters, or sharers)
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to close the modal
 * @param {string} title - Modal title
 * @param {Array} users - Array of user objects
 * @param {string} type - Type: 'likes' | 'comments' | 'shares'
 * @param {boolean} loading - Whether the list is loading
 */
const UsersListModal = ({ isOpen, onClose, title, users, type, loading }) => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [sendingRequest, setSendingRequest] = useState(null);

  const currentUser = getUser();
  const currentUserId = currentUser?.id;

  const fetchConnections = useCallback(async () => {
    try {
      const data = await getConnections();
      setConnections(data.connections || []);
    } catch (err) {
      console.error("Error fetching connections:", err);
    }
  }, []);

  useEffect(() => {
    if (isOpen && type === "likes") {
      void fetchConnections();
    }
  }, [isOpen, type, fetchConnections]);

  // Check connection status for a user
  const getConnectionStatus = (userId) => {
    if (String(userId) === String(currentUserId)) return "self";
    const conn = connections.find((c) => String(c.id) === String(userId));
    if (conn) return "connected";
    return "none";
  };

  const handleUserClick = (userId) => {
    if (userId) {
      onClose();
      navigate(`/user-profile/${userId}`);
    }
  };

  const handleConnect = async (e, userId) => {
    e.stopPropagation();
    try {
      setSendingRequest(userId);
      await sendConnectionRequest(userId);
    } catch (err) {
      console.error("Error sending connection request:", err);
    } finally {
      setSendingRequest(null);
    }
  };

  if (!isOpen) return null;

  const renderUserItem = (user) => {
    const userId = user.id || user.userId || user.authorId;
    const userName =
      user.name ||
      (user.firstName ? `${user.firstName} ${user.lastName}`.trim() : "User");
    const userImage = getAuthorProfileImageUrl(user);
    const connStatus =
      String(userId) === String(currentUserId)
        ? "self"
        : getConnectionStatus(userId);

    return (
      <div
        key={userId}
        className="flex items-center justify-between gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
        onClick={() => handleUserClick(userId)}
      >
        <div className="flex items-center gap-3">
          <img
            src={userImage}
            alt={userName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-sm text-[#16730F]">{userName}</p>
            {user.headline && (
              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                {user.headline}
              </p>
            )}
            {user.role && <p className="text-xs text-gray-500">{user.role}</p>}
          </div>
        </div>

        {connStatus === "none" && currentUserId !== userId && (
          <button
            type="button"
            onClick={(e) => handleConnect(e, userId)}
            disabled={sendingRequest === userId}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#16730F] text-white text-xs rounded-full hover:bg-[#145a0c] disabled:opacity-50 transition-colors"
          >
            <FaUserPlus />
            {sendingRequest === userId ? "Sending..." : "Connect"}
          </button>
        )}

        {connStatus === "connected" && (
          <span className="text-xs text-green-600 font-medium">Connected</span>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-[#1A3E32]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto nfl-scroll scroll-smooth">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading {type}...
            </div>
          ) : users && users.length > 0 ? (
            <div className="divide-y">
              {users.map((user) => renderUserItem(user))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">No {type} yet</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
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

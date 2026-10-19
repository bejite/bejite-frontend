import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaSearch, FaUserPlus, FaUserCheck, FaSpinner, FaArrowRight } from "react-icons/fa";
import { toast } from "react-toastify";
import * as connectionsApi from "../services/connectionsApi";
import * as followsApi from "../services/followsApi";
import { getUser } from "../utils/tokenManager";
import { resolveRecruiterMode } from "../utils/recruiterProfilePaths";
import { getAuthorProfileImageUrl } from "../utils/profileImageUtils";
import { formatDisplayPersonName } from "../utils/personDisplayName";
import DisplayNameWithBadge from "./DisplayNameWithBadge";

export default function ConnectModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [pendingUserIds, setPendingUserIds] = useState(new Set());
  const [connectedUserIds, setConnectedUserIds] = useState(new Set());
  const [actionLoadingIds, setActionLoadingIds] = useState(new Set());

  const searchTimeoutRef = useRef(null);

  const currentUser = getUser();
  const currentUserId = currentUser?.id;
  const viewerIsCorporate =
    String(currentUser?.role || "").toLowerCase() === "recruiter" &&
    resolveRecruiterMode(currentUser) === "corporate";

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (!isOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Load initial discoverable users
  const loadDiscoverUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await connectionsApi.discoverUsers(25, 0);
      const list = res?.users || (Array.isArray(res) ? res : []);
      // Filter out self
      const filtered = list.filter(
        (u) => String(u?.id || u?.userId) !== String(currentUserId),
      );
      setUsers(filtered);
    } catch (err) {
      console.error("Error loading suggested connections:", err);
      // Fallback: try getting public network
      try {
        const fallbackRes = await connectionsApi.getConnections(1, 20);
        const fallbackList = fallbackRes?.connections || [];
        setUsers(
          fallbackList
            .map((c) => c.user || c)
            .filter((u) => String(u?.id) !== String(currentUserId)),
        );
      } catch (fallbackErr) {
        console.error("Fallback loading failed:", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      loadDiscoverUsers();
    }
  }, [isOpen, loadDiscoverUsers]);

  // Handle search with debounce
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!val.trim()) {
      loadDiscoverUsers();
      setSearching(false);
      return;
    }

    setSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await connectionsApi.searchUsers(val.trim(), 20, 0);
        const searchList = res?.users || (Array.isArray(res) ? res : []);
        setUsers(
          searchList.filter(
            (u) => String(u?.id || u?.userId) !== String(currentUserId),
          ),
        );
      } catch (err) {
        console.error("Error searching users:", err);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleSendConnection = async (e, targetUser) => {
    e.stopPropagation();
    const targetUserId = targetUser?.id || targetUser?.userId;
    if (!targetUserId) return;

    if (viewerIsCorporate) {
      toast.info("Corporate accounts are follow-only.");
      return;
    }

    try {
      setActionLoadingIds((prev) => new Set(prev).add(targetUserId));

      // Check if target is a corporate account (use follow instead)
      const followStatus = await followsApi.getFollowStatus(targetUserId).catch(() => null);
      if (followStatus?.isCorporate) {
        await followsApi.followUser(targetUserId);
        const targetName = formatDisplayPersonName(targetUser, "Page");
        toast.success(`You are now following ${targetName}!`);
        setConnectedUserIds((prev) => new Set(prev).add(targetUserId));
        return;
      }

      const res = await connectionsApi.sendConnectionRequest(targetUserId);
      const targetName = formatDisplayPersonName(targetUser, "User");
      if (res?.connected) {
        toast.success(`Connected with ${targetName}!`);
        setConnectedUserIds((prev) => new Set(prev).add(targetUserId));
      } else {
        toast.success(`Connection request sent to ${targetName}!`);
        setPendingUserIds((prev) => new Set(prev).add(targetUserId));
      }
    } catch (err) {
      console.error("Failed to connect:", err);
      const errorMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to send connection request";
      toast.error(errorMsg);
    } finally {
      setActionLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(targetUserId);
        return next;
      });
    }
  };

  const handleUserClick = (targetUser) => {
    const targetUserId = targetUser?.id || targetUser?.userId;
    if (targetUserId) {
      onClose();
      navigate(`/user-profile/${targetUserId}`);
    }
  };

  const handleGoToConnections = () => {
    onClose();
    navigate("/connection");
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="connect-modal-title"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E8F5E6] flex items-center justify-center shrink-0">
              <img
                src="/assets/images/repeate-one.svg"
                alt="Connect icon"
                className="w-5 h-5 object-contain"
              />
            </div>
            <div>
              <h2
                id="connect-modal-title"
                className="text-lg font-bold text-[#1A3E32]"
              >
                Connect with People
              </h2>
              <p className="text-xs text-gray-500">
                Discover and grow your professional network
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors"
            aria-label="Close modal"
          >
            <FaTimes className="text-base" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 bg-white">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by name, role, or skills..."
              className="w-full pl-10 pr-10 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-[#1A3E32] placeholder-gray-400 outline-none focus:bg-white focus:border-[#16730F] focus:ring-2 focus:ring-[#16730F]/20 transition-all"
            />
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            {searching ? (
              <FaSpinner className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#16730F] text-sm animate-spin" />
            ) : searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  loadDiscoverUsers();
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            ) : null}
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto nfl-scroll p-4 space-y-3 min-h-[220px]">
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/70 animate-pulse animate-shimmer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="h-3.5 bg-gray-200 rounded-md w-28" />
                      <div className="h-2.5 bg-gray-200 rounded-md w-40" />
                    </div>
                  </div>
                  <div className="w-20 h-7 bg-gray-200 rounded-xl shrink-0" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500 space-y-2">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <FaSearch className="text-lg" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No people found</p>
              <p className="text-xs text-gray-500 max-w-xs">
                {searchQuery
                  ? `No matches found for "${searchQuery}". Try a different keyword.`
                  : "Check back later for more connection suggestions!"}
              </p>
            </div>
          ) : (
            users.map((targetUser) => {
              const targetUserId = targetUser?.id || targetUser?.userId;
              const name = formatDisplayPersonName(targetUser, "User");
              const avatar = getAuthorProfileImageUrl(targetUser);
              const headline =
                targetUser?.headline ||
                targetUser?.jobTitle ||
                targetUser?.role ||
                targetUser?.current_position ||
                "Jobseeker";
              const isActionLoading = actionLoadingIds.has(targetUserId);
              const isPending =
                pendingUserIds.has(targetUserId) ||
                targetUser?.connectionStatus === "pending" ||
                targetUser?.isPending;
              const isConnected =
                connectedUserIds.has(targetUserId) ||
                targetUser?.connectionStatus === "connected" ||
                targetUser?.isConnected;

              return (
                <div
                  key={targetUserId || Math.random()}
                  onClick={() => handleUserClick(targetUser)}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-[#F5F9F4] transition-all cursor-pointer group"
                >
                  {/* Left: Avatar + Details */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={avatar}
                      alt={name}
                      className="w-11 h-11 rounded-full object-cover shrink-0 border border-gray-200 group-hover:border-[#16730F] transition-colors"
                      onError={(e) => {
                        e.currentTarget.src = "/assets/images/photo_placeholder.png";
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-[#1A3E32] group-hover:text-[#16730F] transition-colors truncate">
                          <DisplayNameWithBadge
                            user={targetUser}
                            fallback={name}
                            badgeSize="xs"
                          />
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate capitalize">
                        {headline}
                      </p>
                    </div>
                  </div>

                  {/* Right: Connect Button */}
                  <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    {isConnected ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-300">
                        <FaUserCheck className="text-xs" />
                        <span>Connected</span>
                      </span>
                    ) : isPending ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-300">
                        <span>Pending</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleSendConnection(e, targetUser)}
                        disabled={isActionLoading || viewerIsCorporate}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#16730F] text-white hover:bg-[#135d0c] active:scale-95 disabled:opacity-50 transition-all shadow-xs"
                      >
                        {isActionLoading ? (
                          <FaSpinner className="animate-spin text-xs" />
                        ) : (
                          <FaUserPlus className="text-xs" />
                        )}
                        <span>Connect</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-200 bg-gray-50/80">
          <button
            type="button"
            onClick={handleGoToConnections}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#16730F] hover:text-[#125c0c] hover:underline"
          >
            <span>Manage all connections</span>
            <FaArrowRight className="text-[10px]" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

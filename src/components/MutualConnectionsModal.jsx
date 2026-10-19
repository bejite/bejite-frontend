import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaUserFriends } from "react-icons/fa";
import { toast } from "react-toastify";
import { getMutualConnections } from "../services/connectionsApi";
import { profileAvatarSrc } from "../utils/profilePhotoUrl";
import { formatDisplayPersonName } from "../utils/personDisplayName";
import DisplayNameWithBadge from "./DisplayNameWithBadge";

const PAGE_SIZE = 20;

export default function MutualConnectionsModal({
  open,
  onClose,
  otherUserId,
  otherUserName,
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [connections, setConnections] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    if (!open || !otherUserId) return;

    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setConnections([]);
        setPage(1);
        const data = await getMutualConnections(otherUserId, 1, PAGE_SIZE);
        if (cancelled) return;
        const rows = Array.isArray(data?.connections) ? data.connections : [];
        setConnections(rows);
        setTotal(data?.pagination?.total ?? rows.length);
        setPages(data?.pagination?.pages ?? 1);
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error?.response?.data?.error || "Failed to load mutual connections",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [open, otherUserId]);

  const handleLoadMore = async () => {
    if (loadingMore || page >= pages) return;
    const nextPage = page + 1;
    try {
      setLoadingMore(true);
      const data = await getMutualConnections(otherUserId, nextPage, PAGE_SIZE);
      const rows = Array.isArray(data?.connections) ? data.connections : [];
      setConnections((prev) => [...prev, ...rows]);
      setPage(nextPage);
      setTotal(data?.pagination?.total ?? total);
      setPages(data?.pagination?.pages ?? pages);
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to load more connections",
      );
    } finally {
      setLoadingMore(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-[#1A3E32] flex items-center gap-2">
              <FaUserFriends className="text-[#16730F] shrink-0" />
              Mutual connections
            </h2>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {otherUserName
                ? `People you and ${otherUserName} both know`
                : "People you both know"}
              {total > 0 ? ` · ${total}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-16 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#16730F]" />
            </div>
          ) : connections.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">
              No mutual connections yet.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {connections.map((row) => {
                const user = row?.user || row;
                const name = formatDisplayPersonName(user, "User");
                return (
                  <li key={String(user.id)}>
                    <button
                      type="button"
                      onClick={() => {
                        onClose?.();
                        navigate(`/user-profile/${user.id}`);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <img
                        src={profileAvatarSrc(
                          user.profile_photo || user.profilePhoto,
                        )}
                        alt={name}
                        className="h-11 w-11 rounded-full object-cover border border-gray-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#1A3E32] truncate flex items-center gap-1">
                          <DisplayNameWithBadge
                            user={user}
                            fallback="User"
                            badgeSize="sm"
                          />
                        </p>
                        {(user.jobTitle || user.role) && (
                          <p className="text-xs text-gray-500 truncate">
                            {user.jobTitle || user.role}
                          </p>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {!loading && page < pages && (
          <div className="p-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full py-2.5 text-sm font-semibold text-[#16730F] hover:bg-[#16730F]/5 rounded-xl disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "See more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

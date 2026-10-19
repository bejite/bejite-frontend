import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import NewsFeedHeader from "../components/NewsFeedHeader";
import { ConnectionList, RequestList } from "../components/connections";
import {
  FaUserFriends,
  FaUserPlus,
  FaClock,
  FaSearch,
  FaSyncAlt,
  FaCheck,
  FaSpinner,
} from "react-icons/fa";
import { toast } from "react-toastify";
import * as connectionsApi from "../services/connectionsApi";
import * as followsApi from "../services/followsApi";
import { getAuthorProfileImageUrl } from "../utils/profileImageUtils";
import useSyncProfilePhoto from "../hooks/useSyncProfilePhoto";
import NewsFeedLayout from "../components/layout/NewsFeedLayout";
import { formatDisplayPersonName } from "../utils/personDisplayName";
import DisplayNameWithBadge from "../components/DisplayNameWithBadge";
import { filterAdminUsersFromSearch } from "../utils/filterAdminUsers";
import { RecruiterSelect } from "../components/recruiter/recruiterOnboardingUi";
import { getUser, storeUser, mergeAuthUsers } from "../utils/tokenManager";
import {
  resolveRecruiterMode,
  isCorporateRecruiter,
} from "../utils/recruiterProfilePaths";
import axiosInstance from "../utils/axiosInstance";
import { updateUser } from "../features/auth/authSlice";

const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const formatUserName = (user) => formatDisplayPersonName(user, "Unknown User");

const transformDiscoverableUser = (user) => ({
  id: user.id,
  name: formatUserName(user),
  firstName: user.firstName ?? user.first_name,
  lastName: user.lastName ?? user.last_name,
  email: user.email,
  image: user.profilePhoto ?? user.profile_photo ?? user.image ?? null,
  role: user.role,
  jobTitle: user.jobTitle || user.job_title || null,
  hasVerifiedBadge: Boolean(user?.hasVerifiedBadge),
});

const transformConnectionUser = (user, connectedAt) => ({
  id: user?.id,
  name: formatUserName(user),
  firstName: user?.firstName ?? user?.first_name,
  lastName: user?.lastName ?? user?.last_name,
  email: user?.email,
  connectedAt,
  image: user?.profilePhoto ?? user?.profile_photo ?? user?.image ?? null,
  role: user?.role,
  jobTitle: user?.jobTitle || user?.job_title || null,
  hasVerifiedBadge: Boolean(user?.hasVerifiedBadge),
});

const uniqueUsersById = (users) => {
  const seen = new Set();
  return (Array.isArray(users) ? users : []).filter((user) => {
    const id = user?.id != null ? String(user.id) : "";
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

const followersListState = (followersRes, fallbackPage, fallbackLimit) => {
  const users = uniqueUsersById(followersRes?.users || []);
  const pagination = followersRes?.pagination;
  return {
    users,
    meta: {
      total: pagination?.total ?? users.length,
      pages: pagination?.pages ?? 1,
      page: pagination?.page ?? fallbackPage,
      limit: pagination?.limit ?? fallbackLimit,
    },
  };
};

const Connections = () => {
  useSyncProfilePhoto();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.auth?.user);
  const currentUser = useMemo(() => reduxUser || getUser(), [reduxUser]);
  const [isCorporateViewer, setIsCorporateViewer] = useState(() =>
    isCorporateRecruiter(currentUser),
  );
  const DEFAULT_PAGE_SIZE = 20;
  const [activeTab, setActiveTab] = useState(
    isCorporateRecruiter(currentUser) ? "followers" : "network",
  );
  const [connections, setConnections] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [discoverableUsers, setDiscoverableUsers] = useState([]);
  const [peopleSearchResults, setPeopleSearchResults] = useState(null);
  const [peopleSearchLoading, setPeopleSearchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [peopleRefreshing, setPeopleRefreshing] = useState(false);
  const [peopleHasMore, setPeopleHasMore] = useState(true);
  const [connectingUserIds, setConnectingUserIds] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [networkPage, setNetworkPage] = useState(1);
  const [invitationsPage, setInvitationsPage] = useState(1);
  const [sentPage, setSentPage] = useState(1);
  const [peoplePage, setPeoplePage] = useState(1);
  const [networkMeta, setNetworkMeta] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
  });
  const [incomingMeta, setIncomingMeta] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
  });
  const [outgoingMeta, setOutgoingMeta] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
  });
  const [debouncedNetworkSearch, setDebouncedNetworkSearch] = useState("");
  const tabContentRef = useRef(null);
  const [networkReady, setNetworkReady] = useState(false);
  const networkRequestIdRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedNetworkSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const applyNetworkResponse = useCallback((connectionsRes, page, limit) => {
    const connectionsArray =
      connectionsRes?.connections || connectionsRes || [];
    const transformedConnections = Array.isArray(connectionsArray)
      ? connectionsArray.map((conn) =>
          transformConnectionUser(conn.user, conn.connectedAt),
        )
      : [];

    setConnections(transformedConnections);
    setNetworkMeta(
      connectionsRes?.pagination || {
        total: transformedConnections.length,
        pages: 1,
        page,
        limit,
      },
    );
  }, []);

  const transformIncoming = useCallback(
    (incomingRes, page = invitationsPage) => {
      const incomingArray = incomingRes?.requests || incomingRes || [];
      const transformedIncoming = Array.isArray(incomingArray)
        ? incomingArray.map((req) => ({
            id: req.id,
            requester: {
              id: req.fromUser?.id,
              name: formatUserName(req.fromUser),
              firstName: req.fromUser?.firstName ?? req.fromUser?.first_name,
              lastName: req.fromUser?.lastName ?? req.fromUser?.last_name,
              email: req.fromUser?.email,
              image:
                req.fromUser?.profilePhoto ??
                req.fromUser?.profile_photo ??
                null,
              role: req.fromUser?.role,
              jobTitle: req.fromUser?.jobTitle || req.fromUser?.job_title || null,
              hasVerifiedBadge: Boolean(req.fromUser?.hasVerifiedBadge),
            },
            createdAt: req.createdAt,
          }))
        : [];

      setIncomingRequests(transformedIncoming);
      setIncomingMeta(
        incomingRes?.pagination || {
          total: transformedIncoming.length,
          pages: 1,
          page,
          limit: pageSize,
        },
      );
      return transformedIncoming;
    },
    [invitationsPage, pageSize],
  );

  const transformOutgoing = useCallback(
    (outgoingRes, page = sentPage) => {
      const outgoingArray = outgoingRes?.requests || outgoingRes || [];
      const transformedOutgoing = Array.isArray(outgoingArray)
        ? outgoingArray.map((req) => ({
            id: req.id,
            recipient: {
              id: req.toUser?.id,
              name: formatUserName(req.toUser),
              firstName: req.toUser?.firstName ?? req.toUser?.first_name,
              lastName: req.toUser?.lastName ?? req.toUser?.last_name,
              email: req.toUser?.email,
              image:
                req.toUser?.profilePhoto ?? req.toUser?.profile_photo ?? null,
              role: req.toUser?.role,
              jobTitle: req.toUser?.jobTitle || req.toUser?.job_title || null,
              hasVerifiedBadge: Boolean(req.toUser?.hasVerifiedBadge),
            },
            createdAt: req.createdAt,
          }))
        : [];

      setOutgoingRequests(transformedOutgoing);
      setOutgoingMeta(
        outgoingRes?.pagination || {
          total: transformedOutgoing.length,
          pages: 1,
          page,
          limit: pageSize,
        },
      );
      return transformedOutgoing;
    },
    [sentPage, pageSize],
  );

  const applySecondaryResponses = useCallback(
    (incomingRes, outgoingRes, discoverRes) => {
      transformIncoming(incomingRes);
      transformOutgoing(outgoingRes);

      const usersArray = discoverRes?.users || discoverRes || [];
      const transformedUsers = Array.isArray(usersArray)
        ? usersArray.map(transformDiscoverableUser)
        : [];

      setDiscoverableUsers(shuffleArray(transformedUsers));
      setPeopleHasMore(transformedUsers.length >= pageSize);
    },
    [transformIncoming, transformOutgoing, pageSize],
  );

  const fetchDiscoverableUsers = useCallback(
    async (page = 1, limit = pageSize, isAutoReplenish = false) => {
      if (!isAutoReplenish) {
        setPeopleLoading(true);
      }
      try {
        const offset = Math.max(0, (page - 1) * limit);
        const discoverRes = await connectionsApi.discoverUsers(limit, offset);
        const usersArray = discoverRes?.users || discoverRes || [];
        const transformedUsers = Array.isArray(usersArray)
          ? usersArray.map(transformDiscoverableUser)
          : [];

        // If current offset returned empty and we are beyond page 1, loop back to start to replenish
        if (transformedUsers.length === 0 && page > 1) {
          const resetRes = await connectionsApi.discoverUsers(limit, 0);
          const resetArray = resetRes?.users || resetRes || [];
          const resetTransformed = Array.isArray(resetArray)
            ? resetArray.map(transformDiscoverableUser)
            : [];
          setDiscoverableUsers(shuffleArray(resetTransformed));
          setPeoplePage(1);
          setPeopleHasMore(resetTransformed.length >= limit);
          return resetTransformed;
        }

        if (isAutoReplenish) {
          setDiscoverableUsers((prev) => {
            const existingIds = new Set(prev.map((u) => u.id));
            const newUsers = transformedUsers.filter((u) => !existingIds.has(u.id));
            return [...prev, ...newUsers];
          });
        } else {
          setDiscoverableUsers(shuffleArray(transformedUsers));
        }

        setPeopleHasMore(transformedUsers.length >= limit);
        return transformedUsers;
      } catch (error) {
        console.error("Error fetching discoverable users:", error);
        toast.error("Failed to load suggested professionals");
        return [];
      } finally {
        setPeopleLoading(false);
        setPeopleRefreshing(false);
      }
    },
    [pageSize],
  );

  const handleRefreshDiscover = useCallback(async () => {
    setPeopleRefreshing(true);
    setPeoplePage(1);
    await fetchDiscoverableUsers(1, pageSize, false);
    toast.info("Refreshed people suggestions");
  }, [fetchDiscoverableUsers, pageSize]);

  const handlePeoplePageChange = useCallback(
    (newPage) => {
      setPeoplePage(newPage);
      fetchDiscoverableUsers(newPage, pageSize, false);
    },
    [fetchDiscoverableUsers, pageSize],
  );

  /**
   * After accept/decline/cancel, reload the current page.
   * If that page is now empty (but earlier pages still have items), step back.
   */
  const refreshIncomingPage = useCallback(
    async (preferredPage = invitationsPage) => {
      let page = Math.max(1, preferredPage);
      let incomingRes = await connectionsApi.getIncomingRequests(
        page,
        pageSize,
      );
      let rows = transformIncoming(incomingRes, page);
      const pages = Math.max(1, incomingRes?.pagination?.pages || 1);

      if (rows.length === 0 && page > 1) {
        page = Math.min(page - 1, pages);
        page = Math.max(1, page);
        incomingRes = await connectionsApi.getIncomingRequests(page, pageSize);
        rows = transformIncoming(incomingRes, page);
      }

      if (page !== invitationsPage) {
        setInvitationsPage(page);
      }
      return rows;
    },
    [invitationsPage, pageSize, transformIncoming],
  );

  const refreshOutgoingPage = useCallback(
    async (preferredPage = sentPage) => {
      let page = Math.max(1, preferredPage);
      let outgoingRes = await connectionsApi.getOutgoingRequests(
        page,
        pageSize,
      );
      let rows = transformOutgoing(outgoingRes, page);
      const pages = Math.max(1, outgoingRes?.pagination?.pages || 1);

      if (rows.length === 0 && page > 1) {
        page = Math.min(page - 1, pages);
        page = Math.max(1, page);
        outgoingRes = await connectionsApi.getOutgoingRequests(page, pageSize);
        rows = transformOutgoing(outgoingRes, page);
      }

      if (page !== sentPage) {
        setSentPage(page);
      }
      return rows;
    },
    [sentPage, pageSize, transformOutgoing],
  );

  const refreshNetworkFirstPage = useCallback(async () => {
    try {
      const connectionsRes = await connectionsApi.getConnections(
        networkPage,
        pageSize,
        debouncedNetworkSearch,
      );
      applyNetworkResponse(connectionsRes, networkPage, pageSize);
    } catch (error) {
      console.error("Error refreshing network after accept:", error);
    }
  }, [networkPage, pageSize, debouncedNetworkSearch, applyNetworkResponse]);

  // First visit only — full page spinner
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        let corporate = isCorporateRecruiter(getUser() || currentUser);
        const localUser = getUser() || currentUser || {};
        const role = String(localUser?.role || "").toLowerCase();

        // Login payloads often omit mode; resolve from /auth/me before branching.
        if (role === "recruiter" && resolveRecruiterMode(localUser) == null) {
          try {
            const { data } = await axiosInstance.get("/auth/me");
            const me = data?.user;
            if (me && !cancelled) {
              const merged = mergeAuthUsers(localUser, me);
              storeUser(merged);
              dispatch(updateUser({ mode: me.mode ?? null }));
              corporate = isCorporateRecruiter(merged);
            }
          } catch (meError) {
            console.warn("Failed to resolve recruiter mode:", meError);
          }
        }

        if (!cancelled) {
          setIsCorporateViewer(corporate);
          if (corporate) setActiveTab("followers");
        }

        if (corporate) {
          const followersRes = await followsApi.getMyFollowers(1, pageSize, "");
          if (cancelled) return;
          const { users, meta } = followersListState(followersRes, 1, pageSize);
          setConnections(
            users.map((u) => transformConnectionUser(u, u.followedAt)),
          );
          setNetworkMeta(meta);
          setNetworkReady(true);
          return;
        }

        const [connectionsRes, incomingRes, outgoingRes, discoverRes] =
          await Promise.all([
            connectionsApi.getConnections(1, pageSize, ""),
            connectionsApi.getIncomingRequests(1, pageSize),
            connectionsApi.getOutgoingRequests(1, pageSize),
            connectionsApi.discoverUsers(pageSize, 0),
          ]);
        if (cancelled) return;
        applyNetworkResponse(connectionsRes, 1, pageSize);
        applySecondaryResponses(incomingRes, outgoingRes, discoverRes);
        setNetworkReady(true);
      } catch (error) {
        if (cancelled) return;
        console.error("Error loading connections data:", error);
        toast.error(
          isCorporateRecruiter(getUser())
            ? "Failed to load followers"
            : "Failed to load connections data",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only bootstrap
  }, []);

  // My Network search + pagination: update list only (no full-page reload)
  useEffect(() => {
    if (!networkReady) return undefined;

    let cancelled = false;
    const requestId = ++networkRequestIdRef.current;

    (async () => {
      setNetworkLoading(true);
      try {
        if (isCorporateViewer) {
          const followersRes = await followsApi.getMyFollowers(
            networkPage,
            pageSize,
            debouncedNetworkSearch,
          );
          if (cancelled || requestId !== networkRequestIdRef.current) return;
          const { users, meta } = followersListState(
            followersRes,
            networkPage,
            pageSize,
          );
          setConnections(
            users.map((u) => transformConnectionUser(u, u.followedAt)),
          );
          setNetworkMeta(meta);
          return;
        }

        const connectionsRes = await connectionsApi.getConnections(
          networkPage,
          pageSize,
          debouncedNetworkSearch,
        );
        if (cancelled || requestId !== networkRequestIdRef.current) return;
        applyNetworkResponse(connectionsRes, networkPage, pageSize);
      } catch (error) {
        if (cancelled || requestId !== networkRequestIdRef.current) return;
        console.error("Error loading network connections:", error);
        toast.error(
          isCorporateViewer
            ? "Failed to load followers"
            : "Failed to load connections",
        );
      } finally {
        if (!cancelled && requestId === networkRequestIdRef.current) {
          setNetworkLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    networkReady,
    networkPage,
    pageSize,
    debouncedNetworkSearch,
    applyNetworkResponse,
    isCorporateViewer,
  ]);

  // Invitations / Sent / People page changes
  useEffect(() => {
    if (!networkReady || isCorporateViewer) return undefined;

    let cancelled = false;

    (async () => {
      try {
        const [incomingRes, outgoingRes] = await Promise.all([
          connectionsApi.getIncomingRequests(invitationsPage, pageSize),
          connectionsApi.getOutgoingRequests(sentPage, pageSize),
        ]);
        if (cancelled) return;
        transformIncoming(incomingRes);
        transformOutgoing(outgoingRes);
      } catch (error) {
        if (cancelled) return;
        console.error("Error loading requests data:", error);
        toast.error("Failed to load requests data");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    networkReady,
    invitationsPage,
    sentPage,
    pageSize,
    transformIncoming,
    transformOutgoing,
    isCorporateViewer,
  ]);

  useEffect(() => {
    if (loading || networkLoading || peopleLoading) return;
    tabContentRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [networkPage, invitationsPage, sentPage, peoplePage, loading, networkLoading, peopleLoading]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setPeopleSearchResults(null);
      setPeopleSearchLoading(false);
      return undefined;
    }

    const timer = setTimeout(async () => {
      setPeopleSearchLoading(true);
      try {
        const searchRes = await connectionsApi.searchUsers(query, pageSize, 0);
        const usersArray = searchRes?.users || searchRes || [];
        const transformed = Array.isArray(usersArray)
          ? filterAdminUsersFromSearch(usersArray).map(
              transformDiscoverableUser,
            )
          : [];
        setPeopleSearchResults(transformed);
      } catch (error) {
        console.error("Error searching users:", error);
        toast.error("Failed to search for people");
        setPeopleSearchResults([]);
      } finally {
        setPeopleSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, pageSize]);

  useEffect(() => {
    setNetworkPage((prev) => (prev === 1 ? prev : 1));
  }, [debouncedNetworkSearch]);

  useEffect(() => {
    setNetworkPage(1);
    setInvitationsPage(1);
    setSentPage(1);
    setPeoplePage(1);
    if (networkReady && !isCorporateViewer) {
      fetchDiscoverableUsers(1, pageSize, false);
    }
  }, [pageSize, networkReady, isCorporateViewer, fetchDiscoverableUsers]);

  const handleAcceptRequest = async (requestId, requesterName) => {
    try {
      await connectionsApi.acceptConnectionRequest(requestId);
      toast.success(`Connected with ${requesterName}!`);
      await refreshIncomingPage(invitationsPage);
      await refreshNetworkFirstPage();
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept connection request");
    }
  };

  const handleRejectRequest = async (requestId, requesterName) => {
    try {
      await connectionsApi.rejectConnectionRequest(requestId);
      toast.success(`Declined request from ${requesterName}`);
      await refreshIncomingPage(invitationsPage);
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject connection request");
    }
  };

  const handleCancelRequest = async (requestId, recipientName) => {
    try {
      await connectionsApi.cancelConnectionRequest(requestId);
      toast.success(`Canceled request to ${recipientName}`);
      await refreshOutgoingPage(sentPage);
    } catch (error) {
      console.error("Error canceling request:", error);
      toast.error("Failed to cancel connection request");
    }
  };

  const handleSendRequest = async (userId, userName) => {
    if (connectingUserIds[userId]) return;

    setConnectingUserIds((prev) => ({ ...prev, [userId]: "connecting" }));
    try {
      const followStatus = await followsApi.getFollowStatus(userId);
      if (followStatus?.isCorporate) {
        await followsApi.followUser(userId);
        toast.success(`You are now following ${userName}!`);
      } else {
        await connectionsApi.sendConnectionRequest(userId);
        toast.success(`Connection request sent to ${userName}!`);
      }

      setConnectingUserIds((prev) => ({ ...prev, [userId]: "connected" }));

      // Wait a moment for visual confirmation checkmark before updating list
      setTimeout(() => {
        setConnectingUserIds((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });

        // Remove from search results if currently searching
        setPeopleSearchResults((prev) =>
          prev ? prev.filter((u) => u.id !== userId) : prev,
        );

        // Remove from discoverable users and auto-replenish if running low
        setDiscoverableUsers((prev) => {
          const updated = prev.filter((u) => u.id !== userId);

          // If the list is running low (<= 3 users left) and user isn't searching, auto-fetch more
          if (!searchQuery.trim() && updated.length <= 3) {
            const nextPage = peoplePage + 1;
            fetchDiscoverableUsers(nextPage, pageSize, true).then((newItems) => {
              if (!newItems || newItems.length === 0) {
                // If next offset is empty, refresh from beginning
                fetchDiscoverableUsers(1, pageSize, false);
                setPeoplePage(1);
              } else {
                setPeoplePage(nextPage);
              }
            });
          }

          return updated;
        });
      }, 600);
    } catch (error) {
      console.error("Error sending network request:", error);
      setConnectingUserIds((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to send request",
      );
    }
  };

  const handleRemoveConnection = async (peerUserId, peerName) => {
    try {
      await connectionsApi.removeConnection(peerUserId);
      toast.success(`Removed connection with ${peerName}`);

      // Update local state
      setConnections((prev) => prev.filter((conn) => conn.id !== peerUserId));
    } catch (error) {
      console.error("Error removing connection:", error);
      toast.error("Failed to remove connection");
    }
  };

  const filteredConnections = connections;

  const connectionSearchBar = (
    <div className="mb-4 sm:mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-md min-w-0">
        <input
          type="text"
          placeholder="Search by name, role or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border-2 border-[#16730F] p-3 pl-4 pr-12 rounded-2xl focus:outline-none text-sm sm:text-base transition-all"
        />
        <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1A3E32] h-5 w-5 pointer-events-none" />
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
        {activeTab === "people" && !searchQuery.trim() && (
          <button
            type="button"
            onClick={handleRefreshDiscover}
            disabled={peopleRefreshing || peopleLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-[#16730F] bg-[#16730F]/10 hover:bg-[#16730F]/20 active:scale-95 rounded-xl transition-all disabled:opacity-50 min-h-[38px] cursor-pointer"
            title="Refresh recommendations"
          >
            <FaSyncAlt
              className={`h-3.5 w-3.5 ${peopleRefreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        )}
        <label
          htmlFor="connections-page-size"
          className="text-xs sm:text-sm text-gray-600 whitespace-nowrap"
        >
          Page size
        </label>
        <RecruiterSelect
          name="pageSize"
          value={String(pageSize)}
          onChange={(e) => setPageSize(Number(e.target.value))}
          options={[
            { value: "10", label: "10" },
            { value: "20", label: "20" },
          ]}
          placeholder="Page size"
        />
      </div>
    </div>
  );

  const tabs = isCorporateViewer
    ? [
        {
          id: "followers",
          label: "Followers",
          icon: FaUserFriends,
          content: (
            <>
              {connectionSearchBar}
              {networkLoading ? (
                <div className="py-10 flex flex-col items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16730F]" />
                  <p className="text-sm text-gray-500">Updating followers...</p>
                </div>
              ) : (
                <ConnectionList
                  connections={filteredConnections}
                  totalCount={networkMeta.total}
                  searchQuery=""
                  onViewProfile={(userId) =>
                    navigate(`/user-profile/${userId}`)
                  }
                  variant="followers"
                  showRemoveButton={false}
                />
              )}
              <PaginationControls
                currentPage={networkPage}
                totalPages={Math.max(networkMeta.pages || 1, 1)}
                onPageChange={setNetworkPage}
              />
            </>
          ),
        },
      ]
    : [
        {
          id: "network",
          label: "My Network",
          icon: FaUserFriends,
          content: (
            <>
              {connectionSearchBar}
              {networkLoading ? (
                <div className="py-10 flex flex-col items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16730F]" />
                  <p className="text-sm text-gray-500">Updating network...</p>
                </div>
              ) : (
                <ConnectionList
                  connections={filteredConnections}
                  totalCount={networkMeta.total}
                  onRemoveConnection={handleRemoveConnection}
                  searchQuery=""
                  onViewProfile={(userId) =>
                    navigate(`/user-profile/${userId}`)
                  }
                />
              )}
              <PaginationControls
                currentPage={networkPage}
                totalPages={Math.max(networkMeta.pages || 1, 1)}
                onPageChange={setNetworkPage}
              />
            </>
          ),
        },
        {
          id: "people",
          label: "People",
          icon: FaUserPlus,
          count: discoverableUsers.length,
          content: (
            <>
              {connectionSearchBar}
              <PeopleList
                users={peopleSearchResults ?? discoverableUsers}
                onSendRequest={handleSendRequest}
                onViewProfile={(userId) => navigate(`/user-profile/${userId}`)}
                searchQuery={searchQuery}
                isSearching={Boolean(searchQuery.trim())}
                searchLoading={peopleSearchLoading}
                connectingUserIds={connectingUserIds}
                onRefresh={handleRefreshDiscover}
                isRefreshing={peopleRefreshing}
                isLoading={peopleLoading}
              />
              {!searchQuery.trim() && (
                <PaginationControls
                  currentPage={peoplePage}
                  totalPages={peopleHasMore ? peoplePage + 1 : peoplePage}
                  onPageChange={handlePeoplePageChange}
                />
              )}
            </>
          ),
        },
        {
          id: "invitations",
          label: "Invitations",
          icon: FaUserPlus,
          count: incomingMeta.total,
          content: (
            <>
              {connectionSearchBar}
              <RequestList
                requests={incomingRequests}
                totalCount={incomingMeta.total}
                type="incoming"
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
                onViewProfile={(userId) => navigate(`/user-profile/${userId}`)}
              />
              <PaginationControls
                currentPage={invitationsPage}
                totalPages={Math.max(incomingMeta.pages || 1, 1)}
                onPageChange={setInvitationsPage}
              />
            </>
          ),
        },
        {
          id: "sent",
          label: "Sent",
          icon: FaClock,
          count: outgoingMeta.total,
          content: (
            <>
              {connectionSearchBar}
              <RequestList
                requests={outgoingRequests}
                totalCount={outgoingMeta.total}
                type="outgoing"
                onCancel={handleCancelRequest}
                onViewProfile={(userId) => navigate(`/user-profile/${userId}`)}
              />
              <PaginationControls
                currentPage={sentPage}
                totalPages={Math.max(outgoingMeta.pages || 1, 1)}
                onPageChange={setSentPage}
              />
            </>
          ),
        },
      ];

  if (loading) {
    return (
      <NewsFeedLayout showSidebars={false}>
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16730F] mx-auto"></div>
            <p className="mt-4 text-gray-600 text-sm sm:text-base">
              {isCorporateViewer
                ? "Loading followers..."
                : "Loading connections..."}
            </p>
          </div>
        </div>
      </NewsFeedLayout>
    );
  }

  return (
    <NewsFeedLayout showSidebars={false}>
      <div className="min-h-screen bg-[#F5F5F5] w-full min-w-0">
        <div className="w-full min-w-0 max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1A3E32] mb-1 sm:mb-2">
              {isCorporateViewer ? "Followers" : "Connections"}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {isCorporateViewer
                ? "People following your company page"
                : "Manage your professional network"}
            </p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden min-w-0">
            <div className="flex w-full border-b border-gray-200">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-1 min-w-0 flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 py-3 px-1 sm:py-4 sm:px-4 md:px-5 transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#16730F] text-white font-semibold"
                        : "text-gray-600 hover:bg-gray-50 font-medium"
                    }`}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    <span className="text-[10px] sm:text-sm leading-tight text-center w-full min-w-0 truncate px-0.5">
                      {tab.label}
                    </span>
                    {typeof tab.count === "number" && tab.count > 0 && (
                      <span
                        className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs leading-none font-bold ${
                          isActive
                            ? "bg-white text-[#16730F]"
                            : "bg-[#16730F] text-white"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div
              ref={tabContentRef}
              className="p-3 sm:p-4 md:p-6 scroll-mt-20 min-w-0"
            >
              {tabs.find((tab) => tab.id === activeTab)?.content}
            </div>
          </div>
        </div>
      </div>
    </NewsFeedLayout>
  );
};

// People List Component
const PeopleList = ({
  users,
  onSendRequest,
  onViewProfile,
  searchQuery,
  isSearching,
  searchLoading,
  connectingUserIds = {},
  onRefresh,
  isRefreshing = false,
  isLoading = false,
}) => {
  const usersArray = Array.isArray(users) ? users : [];
  const filteredUsers = isSearching
    ? usersArray
    : usersArray.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()),
      );

  if (searchLoading || isLoading) {
    return (
      <div className="text-center py-10 sm:py-14 px-2">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#16730F] mx-auto"></div>
        <p className="mt-4 text-gray-600 text-sm sm:text-base font-medium">
          {searchLoading ? "Searching professionals..." : "Finding people you may know..."}
        </p>
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="text-center py-10 sm:py-14 px-4 bg-gray-50/70 rounded-2xl border border-gray-100">
        <div className="w-16 h-16 bg-[#16730F]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#16730F]">
          <FaUserFriends className="h-8 w-8" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-[#1A3E32] mb-1">
          {isSearching
            ? "No people found"
            : "No more recommendations right now"}
        </h3>
        <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto mb-5">
          {isSearching
            ? "Try searching with a different name, job title, or email address."
            : "You've gone through current suggestions! Refresh to discover more professionals."}
        </p>
        {!isSearching && onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#16730F] text-white rounded-xl hover:bg-[#145a0c] active:scale-95 transition-all text-sm font-semibold shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <FaSyncAlt className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Discover More People</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {filteredUsers.map((user) => {
        const state = connectingUserIds[user.id];
        const isConnecting = state === "connecting";
        const isConnected = state === "connected";

        return (
          <div
            key={user.id}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3.5 sm:p-4 bg-gray-50 hover:bg-gray-100/80 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200 min-w-0"
          >
            <button
              type="button"
              onClick={() => onViewProfile(user.id)}
              className="flex items-center gap-3 sm:gap-4 min-w-0 text-left hover:opacity-90 w-full sm:w-auto flex-1 cursor-pointer"
            >
              <img
                src={getAuthorProfileImageUrl(user)}
                alt={user.name}
                className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full object-cover ring-2 ring-white shadow-xs"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-[#1A3E32] text-sm sm:text-base truncate hover:text-[#16730F] transition-colors">
                  <DisplayNameWithBadge
                    user={user}
                    fallback={user.name}
                    badgeSize="xs"
                  />
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {user.jobTitle || "Professional"}
                </p>
              </div>
            </button>

            <button
              type="button"
              disabled={isConnecting || isConnected}
              onClick={() => onSendRequest(user.id, user.name)}
              className={`w-full sm:w-auto shrink-0 px-5 py-2.5 min-h-[44px] rounded-lg transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer ${
                isConnected
                  ? "bg-emerald-600 text-white cursor-default"
                  : isConnecting
                  ? "bg-[#16730F]/80 text-white cursor-wait opacity-90"
                  : "bg-[#16730F] text-white hover:bg-[#145a0c] active:scale-95 shadow-xs"
              }`}
            >
              {isConnected ? (
                <>
                  <FaCheck className="h-3.5 w-3.5" />
                  <span>Connected</span>
                </>
              ) : isConnecting ? (
                <>
                  <FaSpinner className="animate-spin h-3.5 w-3.5" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <FaUserPlus className="h-3.5 w-3.5" />
                  <span>Connect</span>
                </>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
};

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const buildPageItems = () => {
    const items = [];
    const add = (value) => items.push(value);

    add(1);

    const windowStart = Math.max(2, currentPage - 1);
    const windowEnd = Math.min(totalPages - 1, currentPage + 1);

    if (windowStart > 2) add("left-ellipsis");
    for (let page = windowStart; page <= windowEnd; page += 1) add(page);
    if (windowEnd < totalPages - 1) add("right-ellipsis");

    if (totalPages > 1) add(totalPages);

    return items;
  };

  const pageItems = buildPageItems();

  return (
    <div className="flex flex-col items-stretch sm:items-center gap-3 mt-4 sm:mt-6 min-w-0">
      <span className="text-xs sm:text-sm text-gray-600 text-center order-first sm:order-none">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex flex-wrap items-center justify-center gap-2 w-full">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="flex-1 sm:flex-none min-h-[44px] px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
        >
          Previous
        </button>
        <div className="hidden sm:flex items-center gap-1 flex-wrap justify-center">
          {pageItems.map((item, index) => {
            if (typeof item !== "number") {
              return (
                <span
                  key={`${item}-${index}`}
                  className="px-2 text-gray-500 select-none"
                >
                  …
                </span>
              );
            }

            const isActive = item === currentPage;
            return (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={`min-w-8 h-8 px-2 rounded-md text-sm border transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[#16730F] border-[#16730F] text-white font-bold"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="flex-1 sm:flex-none min-h-[44px] px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Connections;

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import UserList from "../../components/UserList";
import { discoverRecruitersForSignup } from "../../services/signupApi";
import axiosInstance from "../../utils/axiosInstance";
import * as connectionsApi from "../../services/connectionsApi";
import * as followsApi from "../../services/followsApi";
import { getProfileImageUrl } from "../../utils/profileImageUtils";
import { getAccessToken } from "../../utils/tokenManager";
import {
  SIGNUP_BTN_DISABLED,
  SIGNUP_BTN_ENABLED,
} from "../../constants/signupTheme";

const PAGE_SIZE = 20;

const mapRecruiterForList = (user) => ({
  id: user.id,
  name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown User",
  role: user.companyName || user.jobTitle || "Recruiter",
  img:
    getProfileImageUrl(user.profilePhoto) || "/assets/images/photo_placeholder.png",
  isCorporate: Boolean(user.isCorporate || user.mode === "corporate"),
});

const JobConnection = () => {
  const [users, setUsers] = useState([]);
  const [addedUsers, setAddedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const email = params.get("email");
  const role = params.get("role");
  const mode = params.get("mode");

  const fetchRecruitersPage = useCallback(async (pageOffset, append = false) => {
    const data = await discoverRecruitersForSignup(email, PAGE_SIZE, pageOffset);
    const list = data?.users || [];
    const mapped = Array.isArray(list) ? list.map(mapRecruiterForList) : [];

    setUsers((prev) => {
      if (!append) return mapped;
      const seen = new Set(prev.map((u) => u.id));
      return [...prev, ...mapped.filter((u) => !seen.has(u.id))];
    });
    setHasMore(mapped.length === PAGE_SIZE);
    setOffset(pageOffset + mapped.length);
  }, [email]);

  useEffect(() => {
    if (!email) {
      setLoadingUsers(false);
      toast.error("Missing email. Please restart signup.");
      return;
    }

    const loadInitial = async () => {
      setLoadingUsers(true);
      setOffset(0);
      setHasMore(false);
      try {
        await fetchRecruitersPage(0, false);
      } catch (error) {
        console.error("Failed to load recruiters:", error);
        const message =
          error.response?.data?.error || "Failed to load recruiters. Try again later.";
        toast.error(message);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadInitial();
  }, [email, fetchRecruitersPage]);

  const handleLoadMore = async () => {
    if (!email || loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      await fetchRecruitersPage(offset, true);
    } catch (error) {
      console.error("Failed to load more recruiters:", error);
      const message =
        error.response?.data?.error || "Failed to load more recruiters.";
      toast.error(message);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleAdd = (id) => {
    if (!addedUsers.includes(id)) {
      setAddedUsers((prev) => [...prev, id]);
    }
  };

  const handleContinue = async () => {
    if (addedUsers.length < 10) {
      toast.error("Please connect with at least 10 recruiters.");
      return;
    }

    setLoading(true);

    try {
      if (!getAccessToken()) {
        toast.error("Session expired. Please verify your email again.");
        setLoading(false);
        return;
      }

      const response = await axiosInstance.post("/auth/complete-signup", {
        role: role?.toLowerCase(),
        mode: mode,
        followings: addedUsers,
      });

      const data = response.data;

      const accessToken =
        data?.accessToken || data?.token || data?.data?.accessToken;
      const refreshToken = data?.refreshToken || data?.data?.refreshToken;

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("authToken", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      const responseUser = data?.user || data?.confirmedUser;
      if (responseUser) {
        localStorage.setItem("user", JSON.stringify(responseUser));
      }

      const byId = new Map(users.map((u) => [String(u.id), u]));
      const networkResults = await Promise.allSettled(
        addedUsers.map((userId) => {
          const target = byId.get(String(userId));
          if (target?.isCorporate) {
            return followsApi.followUser(userId);
          }
          return connectionsApi.sendConnectionRequest(userId);
        }),
      );

      const failedCount = networkResults.filter((r) => r.status === "rejected").length;
      if (failedCount > 0) {
        console.warn(
          `${failedCount} follow/connection request(s) failed after signup`,
          networkResults,
        );
        toast.warn(
          `Signup complete, but ${failedCount} request(s) could not be sent.`,
        );
      }

      toast.success(data.message || "Signup completed successfully!");
      navigate("/");
    } catch (error) {
      console.error("CompleteSignup error:", error);
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Something went wrong. Try again later.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const isEnabled = addedUsers.length >= 10;

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="w-full px-4 py-6 flex justify-start items-center max-w-screen-xl mx-auto shrink-0">
        <img src="/assets/images/logo.png" alt="logo" className="h-10" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center w-full px-4 mx-auto max-w-4xl pb-12">
        <div className="w-full max-w-3xl text-center mb-8">
          <p className="text-3xl sm:text-4xl md:text-5xl font-sarina font-semibold text-[#16730F]">
            Connect With Recruiters
          </p>
          <p className="text-[#333] font-normal text-sm sm:text-base md:text-lg mt-2">
            Follow or connect with at least 10 recruiters to continue
          </p>
        </div>

        {loadingUsers ? (
          <div className="w-full max-w-3xl flex justify-center py-16">
            <span className="w-8 h-8 border-2 border-[#16730F] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-[#333] text-center py-8">
            No recruiters available right now. Please try again later.
          </p>
        ) : (
          <div className="w-full max-w-3xl flex flex-col items-center">
            <UserList users={users} addedUsers={addedUsers} onAdd={handleAdd} />
            {hasMore && (
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="mt-4 px-6 py-2 rounded-2xl border-2 border-[#16730F] text-[#16730F] font-semibold text-sm hover:bg-[#16730F] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#16730F] border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load more"
                )}
              </button>
            )}
          </div>
        )}

        <div className="w-full flex flex-col sm:flex-row sm:justify-between items-center mt-10 px-4">
          <p className="text-sm sm:text-base text-[#333] mb-4 sm:mb-0">
            {addedUsers.length}/10 recruiters selected
          </p>

          <button
            className={`w-52 h-12 rounded-full font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 ${
              isEnabled ? SIGNUP_BTN_ENABLED : SIGNUP_BTN_DISABLED
            }`}
            disabled={!isEnabled || loading || loadingUsers}
            onClick={handleContinue}
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              "Continue"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobConnection;

import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { getUser } from "../utils/tokenManager";
import { getUserPosts } from "../services/postsApi";
import { getConnections } from "../services/connectionsApi";
import { fetchFullUserProfile } from "../services/fetchFullUserProfile";
import { unwrapAuthProfileBody } from "../utils/profileUtils";

async function resolveUserNickname(user) {
  if (!user?.id) return user;

  const existing = String(user.nickname ?? user.username ?? "").trim();
  if (existing) return user;

  try {
    if (user.role === "recruiter") {
      const { data } = await axiosInstance.get("/auth/user/profile");
      const row = unwrapAuthProfileBody(data);
      if (row?.nickname) {
        return { ...user, nickname: row.nickname };
      }
    }

    const full = await fetchFullUserProfile(user.id);
    if (full?.user?.nickname) {
      return { ...user, nickname: full.user.nickname };
    }
  } catch (err) {
    console.error("Error resolving nickname:", err);
  }

  return user;
}

export default function useRecruitmentRightStats() {
  const [userData, setUserData] = useState(() => getUser());
  const [postCount, setPostCount] = useState(0);
  const [connectionCount, setConnectionCount] = useState(0);

  useEffect(() => {
    const user = getUser();
    if (!user) return;

    resolveUserNickname(user).then((enriched) => {
      setUserData(enriched);
    });

    getUserPosts(user.id, 100)
      .then((data) => {
        setPostCount(data.posts?.length || 0);
      })
      .catch((err) => console.error("Error fetching posts:", err));

    getConnections(1, 1)
      .then((data) => {
        const total = data?.pagination?.total;
        setConnectionCount(
          typeof total === "number" ? total : data.connections?.length || 0,
        );
      })
      .catch((err) => console.error("Error fetching connections:", err));
  }, []);

  return { userData, postCount, connectionCount };
}

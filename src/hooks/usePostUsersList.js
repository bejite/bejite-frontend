import { useCallback, useState } from "react";
import { getPostLikes, getPostShares } from "../services/postsApi";

function normalizeUsers(data, keys) {
  let usersList = [];
  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      usersList = data[key];
      break;
    }
  }
  if (!usersList.length && Array.isArray(data?.data)) usersList = data.data;
  if (!usersList.length && Array.isArray(data)) usersList = data;
  return usersList.map((user) => ({
    ...user,
    id: user.id || user.userId,
  }));
}

export default function usePostUsersList() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("likes");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const showList = useCallback(async ({ nextTitle, nextType, fetcher, keys }) => {
    try {
      setTitle(nextTitle);
      setType(nextType);
      setLoading(true);
      setIsOpen(true);
      const data = await fetcher();
      setUsers(normalizeUsers(data, keys));
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const showLikers = useCallback(
    (postId) =>
      showList({
        nextTitle: "People who liked",
        nextType: "likes",
        fetcher: () => getPostLikes(postId),
        keys: ["likers", "users", "likes"],
      }),
    [showList],
  );

  const showSharers = useCallback(
    (postId) =>
      showList({
        nextTitle: "People who shared",
        nextType: "shares",
        fetcher: () => getPostShares(postId),
        keys: ["sharers", "users", "shares"],
      }),
    [showList],
  );

  return {
    showLikers,
    showSharers,
    usersListModalProps: {
      isOpen,
      onClose: () => setIsOpen(false),
      title,
      users,
      loading,
      type,
    },
  };
}

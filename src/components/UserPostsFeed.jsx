import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileText } from "lucide-react";
import {
  getUserPosts,
  likePost,
  unlikePost,
  savePost,
  unsavePost,
  updatePost,
  deletePost,
  voteOnPoll,
} from "../services/postsApi";
import { recordPostShare, togglePostRepost } from "../utils/postShare";
import PostCard from "./feed/PostCard";
import FeedLoadMoreButton from "./FeedLoadMoreButton";

const DEFAULT_PAGE_SIZE = 10;

const FILTER_TO_MEDIA = {
  image: "image",
  video: "video",
};

const mergePosts = (existing, incoming) => {
  const seen = new Set(existing.map((post) => post.id));
  const merged = [...existing];
  for (const post of incoming) {
    if (!seen.has(post.id)) {
      seen.add(post.id);
      merged.push(post);
    }
  }
  return merged;
};

const UserPostsFeed = ({
  userId,
  currentUserId,
  pageSize = DEFAULT_PAGE_SIZE,
  previewLimit = null,
  showFilters = true,
  emptyMessage = "Published posts from this user will appear here.",
  onMetaChange,
}) => {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [error, setError] = useState(null);
  const nextCursorRef = useRef(null);

  const isPreview = previewLimit != null && previewLimit > 0;
  const mediaType = FILTER_TO_MEDIA[filter] || null;

  useEffect(() => {
    nextCursorRef.current = nextCursor;
  }, [nextCursor]);

  const fetchPosts = useCallback(
    async (reset = false) => {
      if (!userId) return;

      try {
        if (reset) {
          setLoading(true);
          setError(null);
        } else {
          setLoadingMore(true);
        }

        const cursor = reset ? null : nextCursorRef.current;
        const requestLimit =
          isPreview && reset ? previewLimit + 1 : pageSize;

        const data = await getUserPosts(userId, requestLimit, cursor, {
          mediaType,
        });

        const incoming = data.posts || [];
        setPosts((prev) => (reset ? incoming : mergePosts(prev, incoming)));
        const newCursor = data.nextCursor ?? null;
        setNextCursor(newCursor);
        nextCursorRef.current = newCursor;
      } catch (err) {
        console.error("Error fetching user posts:", err);
        if (reset) {
          setError("Failed to load posts");
          setPosts([]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [userId, pageSize, isPreview, previewLimit, mediaType],
  );

  useEffect(() => {
    setPosts([]);
    setNextCursor(null);
    nextCursorRef.current = null;
    fetchPosts(true);
  }, [userId, filter, fetchPosts]);

  const patchPost = (postId, patch) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, ...patch } : post)),
    );
  };

  const handleLike = async (postId, isLiked) => {
    try {
      if (isLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
      const current = posts.find((post) => post.id === postId);
      patchPost(postId, {
        likedByMe: !isLiked,
        likesCount: Math.max(
          0,
          (current?.likesCount || 0) + (isLiked ? -1 : 1),
        ),
      });
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleSave = async (postId, isSaved) => {
    try {
      if (isSaved) {
        await unsavePost(postId);
        patchPost(postId, { savedByMe: false });
      } else {
        await savePost(postId);
        patchPost(postId, { savedByMe: true });
      }
    } catch (err) {
      console.error("Error toggling save:", err);
    }
  };

  const handleShare = async (postId) => {
    try {
      await recordPostShare(postId);
      const current = posts.find((post) => post.id === postId);
      if (!current?.sharedByMe) {
        patchPost(postId, {
          sharesCount: (current?.sharesCount || 0) + 1,
          sharedByMe: true,
        });
      }
    } catch (err) {
      console.error("Error sharing post:", err);
    }
  };

  const handleRepost = async (postId, currentlyShared, quote = null, scheduledAt = null) => {
    await togglePostRepost(postId, currentlyShared, quote, scheduledAt);
    await fetchPosts(true);
  };

  const handleUpdatePost = async (postId, postData) => {
    await updatePost(postId, postData);
    await fetchPosts(true);
  };

  const handleDeletePost = async (postId) => {
    await deletePost(postId);
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  const handleVotePoll = async (postId, optionId) => {
    const data = await voteOnPoll(postId, optionId);
    if (data?.poll) {
      patchPost(postId, { poll: data.poll });
    }
    return data;
  };

  const visiblePosts = useMemo(() => {
    if (!isPreview) return posts;
    return posts.slice(0, previewLimit);
  }, [posts, isPreview, previewLimit]);

  const hasMoreBeyondPreview = useMemo(() => {
    if (!isPreview) return false;
    return posts.length > previewLimit || Boolean(nextCursor);
  }, [isPreview, posts.length, previewLimit, nextCursor]);

  useEffect(() => {
    onMetaChange?.({
      hasAnyPosts: visiblePosts.length > 0,
      hasMoreBeyondPreview,
      loading,
      error,
    });
  }, [
    visiblePosts.length,
    hasMoreBeyondPreview,
    loading,
    error,
    onMetaChange,
  ]);

  const filters = [
    { value: "all", label: "Posts" },
    { value: "image", label: "Photos" },
    { value: "video", label: "Videos" },
  ];

  if (!userId) return null;

  return (
    <>
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-5">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                filter === item.value
                  ? "bg-[#1A3E32] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-500 text-sm">
          Loading posts...
        </div>
      ) : error ? (
        <div className="py-12 text-center text-red-500 text-sm">{error}</div>
      ) : visiblePosts.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-700">No posts yet</p>
          <p className="text-xs text-gray-500 mt-1">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visiblePosts.map((post) => (
            <PostCard
              key={post.feedItemKey || post.id}
              post={post}
              currentUserId={currentUserId}
              onLike={handleLike}
              onSave={handleSave}
              onShare={handleShare}
              onRepost={handleRepost}
              onUpdate={handleUpdatePost}
              onDelete={handleDeletePost}
              onVotePoll={handleVotePoll}
            />
          ))}

          {!isPreview && (
            <FeedLoadMoreButton
              hasMore={Boolean(nextCursor)}
              loading={loadingMore}
              onLoadMore={() => fetchPosts(false)}
              label="Load more posts"
            />
          )}
        </div>
      )}
    </>
  );
};

export default UserPostsFeed;

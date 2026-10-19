import { useState, useEffect, useCallback } from "react";
import { FaImage, FaVideo, FaPoll } from "react-icons/fa";
import {
  getFeed,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  savePost,
  unsavePost,
  voteOnPoll,
} from "../services/postsApi";
import { recordPostShare } from "../utils/postShare";
import { getUser } from "../utils/tokenManager";
import { getUserProfileImage } from "../utils/profileImageUtils";
import PostCreationModal from "./PostCreationModal";
import FeedLoadMoreButton from "./FeedLoadMoreButton";
import PostCard from "./feed/PostCard";

const FEED_PAGE_SIZE = 20;

const mergeFeedPosts = (existing, incoming) => {
  const seen = new Set(existing.map((p) => p.id));
  const merged = [...existing];
  for (const post of incoming) {
    if (!seen.has(post.id)) {
      seen.add(post.id);
      merged.push(post);
    }
  }
  return merged;
};

const PostContainer = () => {
  const [posts, setPosts] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("post");
  const user = getUser();
  const currentUserImage = getUserProfileImage();

  const fetchFeed = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getFeed(FEED_PAGE_SIZE);
      setPosts(data.posts || []);
      setNextCursor(data.nextCursor ?? null);
      if (!silent) setError(null);
    } catch (err) {
      console.error("Error fetching feed:", err);
      if (!silent) setError("Failed to load posts");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFeed();
  }, [fetchFeed]);

  const loadMorePosts = async () => {
    if (!nextCursor || loadingMore) return;
    try {
      setLoadingMore(true);
      const data = await getFeed(FEED_PAGE_SIZE, nextCursor);
      setPosts((prev) => mergeFeedPosts(prev, data.posts || []));
      setNextCursor(data.nextCursor ?? null);
    } catch (err) {
      console.error("Error loading more posts:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const patchPost = (postId, patch) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, ...patch } : p)),
    );
  };

  const handleLike = async (postId, isLiked) => {
    try {
      if (isLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
      const current = posts.find((p) => p.id === postId);
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
      } else {
        await savePost(postId);
      }
      patchPost(postId, { savedByMe: !isSaved });
    } catch (err) {
      console.error("Error toggling save:", err);
    }
  };

  const handleShare = async (postId) => {
    try {
      await recordPostShare(postId);
      const current = posts.find((p) => p.id === postId);
      patchPost(postId, {
        sharesCount: (current?.sharesCount || 0) + 1,
      });
    } catch (err) {
      console.error("Error sharing post:", err);
    }
  };

  const handleUpdatePost = async (postId, postData) => {
    try {
      await updatePost(postId, postData);
      fetchFeed();
    } catch (err) {
      console.error("Error updating post:", err);
      throw err;
    }
  };

  const handleVotePoll = async (postId, optionId) => {
    const data = await voteOnPoll(postId, optionId);
    if (data?.poll) {
      patchPost(postId, { poll: data.poll });
    }
    return data;
  };

  const openCreateModal = (mode = "post") => {
    setModalMode(mode);
    setShowModal(true);
  };

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      setPosts(posts.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
      throw err;
    }
  };

  return (
    <div className="max-w-3xl m-auto px-4 py-6 bg-[#F5F5F5] mt-3">
      {/* Create Post Button */}
      <div className="max-w-3xl mx-auto rounded-2xl p-4 bg-[#ffffff]">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => openCreateModal("post")}
        >
          <img
            src={currentUserImage}
            alt="profile"
            className="rounded-full w-12 h-12 object-cover object-center"
          />
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-gray-500 hover:bg-gray-200 transition-colors">
            Start a post
          </div>
        </div>
        <div className="flex items-center justify-around mt-3 pt-3 border-t border-[#A9A9A9]">
          <button
            onClick={() => openCreateModal("post")}
            className="flex items-center gap-2 text-[#1A3E32] hover:bg-gray-100 px-4 py-2 rounded-lg"
          >
            <FaImage className="text-[#16730F] text-lg" />
            <span className="text-sm">Image</span>
          </button>
          <button
            onClick={() => openCreateModal("post")}
            className="flex items-center gap-2 text-[#1A3E32] hover:bg-gray-100 px-4 py-2 rounded-lg"
          >
            <FaVideo className="text-[#16730F] text-lg" />
            <span className="text-sm">Video</span>
          </button>
          <button
            onClick={() => openCreateModal("poll")}
            className="flex items-center gap-2 text-[#1A3E32] hover:bg-gray-100 px-4 py-2 rounded-lg"
          >
            <FaPoll className="text-[#16730F] text-lg" />
            <span className="text-sm">Poll</span>
          </button>
        </div>
      </div>
      <Divider />

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading posts...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No posts yet. Be the first to post!
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.id}
              onLike={handleLike}
              onSave={handleSave}
              onShare={handleShare}
              onUpdate={handleUpdatePost}
              onDelete={handleDeletePost}
              onVotePoll={handleVotePoll}
            />
          ))}
          <FeedLoadMoreButton
            hasMore={Boolean(nextCursor)}
            loading={loadingMore}
            onLoadMore={loadMorePosts}
          />
        </>
      )}
      <PostCreationModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setModalMode("post");
        }}
        initialMode={modalMode}
        onPost={async (postData) => {
          await createPost(postData);
          fetchFeed();
        }}
      />
    </div>
  );
};

const Divider = () => {
  return <div className="max-w-3xl mx-auto my-8 border-t-2 border-[#16730F]" />;
};

export default PostContainer;

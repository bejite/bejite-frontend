import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import NewsFeedLayout from "../components/layout/NewsFeedLayout";
import PostCard from "../components/feed/PostCard";
import {
  deletePost,
  getPublicPost,
  likePost,
  unlikePost,
  savePost,
  unsavePost,
  updatePost,
  voteOnPoll,
} from "../services/postsApi";
import { recordPostShare, togglePostRepost } from "../utils/postShare";
import { getUser, mergeAuthUsers } from "../utils/tokenManager";

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const reduxUser = useSelector((state) => state.auth?.user);
  const currentUserId = useMemo(
    () => mergeAuthUsers(getUser() || {}, reduxUser || {})?.id,
    [reduxUser],
  );

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPost = useCallback(async () => {
    if (!postId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getPublicPost(postId);
      setPost(data?.post || null);
      if (!data?.post) {
        setError("Post not found");
      }
    } catch (err) {
      console.error("PostDetailPage load:", err);
      setError("This post is unavailable or you do not have access.");
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const patchPost = (patch) => {
    setPost((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleLike = async (id, isLiked) => {
    if (isLiked) {
      await unlikePost(id);
    } else {
      await likePost(id);
    }
    patchPost({
      likedByMe: !isLiked,
      likesCount: Math.max(0, (post?.likesCount || 0) + (isLiked ? -1 : 1)),
    });
  };

  const handleSave = async (id, isSaved) => {
    if (isSaved) {
      await unsavePost(id);
      patchPost({ savedByMe: false });
    } else {
      await savePost(id);
      patchPost({ savedByMe: true });
    }
  };

  const handleShare = async (id) => {
    await recordPostShare(id);
    if (!post?.sharedByMe) {
      patchPost({
        sharesCount: (post?.sharesCount || 0) + 1,
        sharedByMe: true,
      });
    }
  };

  const handleRepost = async (id, currentlyShared, quote = null, scheduledAt = null) => {
    await togglePostRepost(id, currentlyShared, quote, scheduledAt);
    await loadPost();
  };

  const handleUpdate = async (id, postData) => {
    await updatePost(id, postData);
    await loadPost();
  };

  const handleDelete = async (id) => {
    await deletePost(id);
    navigate("/news-feed", { replace: true });
  };

  const handleVotePoll = async (id, optionId) => {
    const data = await voteOnPoll(id, optionId);
    if (data?.poll) {
      patchPost({ poll: data.poll });
    }
  };

  return (
    <NewsFeedLayout showSidebars={false}>
      <div className="w-full min-w-0 max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#16730F] hover:text-[#145a0c] transition-colors mb-4 sm:mb-6 text-sm sm:text-base"
        >
          <FaArrowLeft className="shrink-0" />
          <span>Back</span>
        </button>

      

        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-10 text-center">
            <p className="text-base text-gray-500">Loading post...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
            <p className="text-base text-gray-600 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => navigate("/news-feed")}
              className="text-[#16730F] font-medium text-sm sm:text-base hover:underline"
            >
              Go to news feed
            </button>
          </div>
        )}

        {!loading && post && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <PostCard
              post={post}
              onLike={handleLike}
              onSave={handleSave}
              onShare={handleShare}
              onRepost={handleRepost}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onVotePoll={handleVotePoll}
              currentUserId={currentUserId}
              isDetailView
              defaultShowComments
            />
          </div>
        )}
      </div>
    </NewsFeedLayout>
  );
}

import React, { useState, useEffect } from 'react';
import { FaImage, FaVideo, FaPoll } from 'react-icons/fa';
import { getFeed, createPost, updatePost, deletePost, likePost, unlikePost, savePost, unsavePost, voteOnPoll } from '../services/postsApi';
import { recordPostShare, togglePostRepost } from '../utils/postShare';
import { getUser } from '../utils/tokenManager';
import { getUserProfileImage, getProfileImageUrl } from '../utils/profileImageUtils';
import PostCreationModal from './PostCreationModal';
import FeedLoadMoreButton from './FeedLoadMoreButton';
import PostCard from './feed/PostCard';
import { formatDisplayPersonName } from '../utils/personDisplayName';
import { RecruiterSelect } from './recruiter/recruiterOnboardingUi';

const FEED_PAGE_SIZE = 20;

const mergeFeedPosts = (existing, incoming) => {
  const keyOf = (p) => p.feedItemKey || p.id;
  const seen = new Set(existing.map(keyOf));
  const merged = [...existing];
  for (const post of incoming) {
    const key = keyOf(post);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(post);
    }
  }
  return merged;
};

const getDisplayName = (user) => formatDisplayPersonName(user);

const PostContainer = () => {
  const [posts, setPosts] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('post');
  const user = getUser();
  const currentUserImage = getUserProfileImage();

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getFeed(FEED_PAGE_SIZE);
      setPosts(data.posts || []);
      setNextCursor(data.nextCursor ?? null);
      if (!silent) setError(null);
    } catch (err) {
      console.error('Error fetching feed:', err);
      if (!silent) setError('Failed to load posts');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (!nextCursor || loadingMore) return;
    try {
      setLoadingMore(true);
      const data = await getFeed(FEED_PAGE_SIZE, nextCursor);
      setPosts((prev) => mergeFeedPosts(prev, data.posts || []));
      setNextCursor(data.nextCursor ?? null);
    } catch (err) {
      console.error('Error loading more posts:', err);
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
    const current = posts.find((p) => p.id === postId);
    patchPost(postId, {
      likedByMe: !isLiked,
      likesCount: Math.max(
        0,
        (current?.likesCount || 0) + (isLiked ? -1 : 1),
      ),
    });
    try {
      if (isLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      patchPost(postId, {
        likedByMe: isLiked,
        likesCount: current?.likesCount || 0,
      });
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
      console.error('Error toggling save:', err);
    }
  };

  const handleShare = async (postId) => {
    try {
      await recordPostShare(postId);
      const current = posts.find((p) => p.id === postId);
      if (!current?.sharedByMe) {
        patchPost(postId, {
          sharesCount: (current?.sharesCount || 0) + 1,
          sharedByMe: true,
        });
      }
    } catch (err) {
      console.error('Error sharing post:', err);
    }
  };

  const handleRepost = async (postId, currentlyShared, quote = null, scheduledAt = null) => {
    await togglePostRepost(postId, currentlyShared, quote, scheduledAt);
    fetchFeed(true);
  };

  const handleUpdatePost = async (postId, postData) => {
    try {
      await updatePost(postId, postData);
      fetchFeed();
    } catch (err) {
      console.error('Error updating post:', err);
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

  const openCreateModal = (mode = 'post') => {
    setModalMode(mode);
    setShowModal(true);
  };

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
      throw err;
    }
  };

  return (
    <div className="max-w-3xl m-auto px-4 py-6 bg-[#F5F5F5] mt-3">
      {/* Create Post Button */}
      <div className="max-w-3xl mx-auto rounded-2xl p-4 bg-[#ffffff]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => openCreateModal('post')}>
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
            onClick={() => openCreateModal('post')}
            className="flex items-center gap-2 text-[#1A3E32] hover:bg-gray-100 px-4 py-2 rounded-lg"
          >
            <FaImage className="text-[#16730F] text-lg" />
            <span className="text-sm">Image</span>
          </button>
          <button
            onClick={() => openCreateModal('post')}
            className="flex items-center gap-2 text-[#1A3E32] hover:bg-gray-100 px-4 py-2 rounded-lg"
          >
            <FaVideo className="text-[#16730F] text-lg" />
            <span className="text-sm">Video</span>
          </button>
          <button
            onClick={() => openCreateModal('poll')}
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
        <div className="text-center py-8 text-gray-500">No posts yet. Be the first to post!</div>
      ) : (
        <>
          {posts.map(post => (
            <PostCard 
              key={post.feedItemKey || post.id} 
              post={post} 
              currentUserId={user?.id}
              onLike={handleLike}
              onSave={handleSave}
              onShare={handleShare}
              onRepost={handleRepost}
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
          setModalMode('post');
        }}
        initialMode={modalMode}
        onPost={async (postData) => {
          const data = await createPost(postData);
          const newPost = data?.post;
          if (newPost?.status === 'published') {
            setPosts((prev) =>
              prev.some((p) => p.id === newPost.id) ? prev : [newPost, ...prev],
            );
          }
        }}
      />
    </div>
  );
};

const CreatePostSection = ({ postBody, setPostBody, visibility, setVisibility, onSubmit, submitting, user, mediaFiles, removeMedia, handleMediaSelect, uploadingMedia }) => {
  const displayName = getDisplayName(user);
  const userImage = getProfileImageUrl(user?.image);
  return (
    <form id="create-post-form" onSubmit={onSubmit} className="max-w-3xl mx-auto rounded-2xl p-6 bg-[#ffffff]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <img
          src={userImage}
          alt="profile"
          className="rounded-full w-[60px] h-[60px] object-cover object-center"
        />
        <div className="flex-1">
          <p className="font-semibold text-[#16730F] text-sm mb-1">{displayName}</p>
          <div className="relative w-full">
            <textarea
              name="post"
              id="post-input"
              placeholder="Share something"
              value={postBody}
              onChange={(e) => setPostBody(e.target.value)}
              className="w-full p-3 pl-4 pr-20 text-sm border-2 border-[#16730F] focus:outline-none rounded-2xl resize-none"
              rows={mediaFiles.length > 0 ? 3 : 1}
            />
          </div>
        </div>
      </div>
      
      {mediaFiles.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {mediaFiles.map((media, index) => (
            <div key={index} className="relative">
              {media.kind === 'image' ? (
                <img src={media.url} alt={`Media ${index + 1}`} className="w-20 h-20 object-cover rounded-lg border-2 border-[#6B8E23]" />
              ) : (
                <video src={media.url} className="w-20 h-20 object-cover rounded-lg border-2 border-[#6B8E23]" />
              )}
              <button
                type="button"
                onClick={() => removeMedia(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <PostOptions 
        visibility={visibility} 
        setVisibility={setVisibility} 
        submitting={submitting}
        handleMediaSelect={handleMediaSelect}
        uploadingMedia={uploadingMedia}
      />
    </form>
  );
};

const PostOptions = ({ visibility, setVisibility, submitting, handleMediaSelect, uploadingMedia }) => {
  return (
    <div className="flex flex-wrap justify-between items-center mt-5 gap-3 px-2">
      <MediaOptions handleMediaSelect={handleMediaSelect} uploadingMedia={uploadingMedia} />
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-[150px]">
          <img src="/assets/images/public-icon.svg" alt="Public" className="w-4 h-4 shrink-0" />
          <div className="flex-1">
            <RecruiterSelect 
              name="visibility"
              value={visibility} 
              onChange={(e) => setVisibility(e.target.value)}
              options={[
                { value: "public", label: "Public" },
                { value: "connections", label: "Connections Only" },
              ]}
              placeholder="Visibility"
            />
          </div>
        </div>
        <button
          type="submit"
          form="create-post-form"
          disabled={submitting}
          className="bg-[#16730F] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#145a0c] disabled:opacity-50 transition-colors cursor-pointer shadow-sm min-w-[80px]"
        >
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
};

const MediaOptions = ({ handleMediaSelect, uploadingMedia }) => {
  const handleImageClick = () => {
    document.getElementById('image-input').click();
  };

  const handleVideoClick = () => {
    document.getElementById('video-input').click();
  };

  const options = [
    { icon: "assets/images/gallery.svg", label: "Image", onClick: handleImageClick },
    { icon: "assets/images/video-square.png", label: "Video", onClick: handleVideoClick },
    { icon: "/assets/images/Amount_Icon_UIA.svg", label: "Poll", onClick: () => {} }
  ];

  return (
    <div className="flex gap-4 flex-wrap justify-center sm:justify-start">
      <input
        type="file"
        id="image-input"
        accept="image/*"
        onChange={(e) => handleMediaSelect(e, 'image')}
        className="hidden"
      />
      <input
        type="file"
        id="video-input"
        accept="video/*"
        onChange={(e) => handleMediaSelect(e, 'video')}
        className="hidden"
      />
      {uploadingMedia && <span className="text-sm text-[#16730F]">Uploading...</span>}
      {options.map((option, index) => (
        <div key={index} onClick={option.onClick} className="flex items-center gap-1 cursor-pointer hover:opacity-70">
          <img src={option.icon} alt={option.label} />
          <p className="text-[#1A3E32] text-[13px]">{option.label}</p>
        </div>
      ))}
    </div>
  );
};

const Divider = () => {
  return <div className="max-w-3xl mx-auto my-8 border-t-2 border-[#16730F]" />;
};

export default PostContainer;
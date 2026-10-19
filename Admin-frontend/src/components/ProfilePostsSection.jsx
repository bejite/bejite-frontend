import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserPostsFeed from "./UserPostsFeed";

const PREVIEW_LIMIT = 3;

const ProfilePostsSection = ({ userId, currentUserId }) => {
  const navigate = useNavigate();
  const [meta, setMeta] = useState({
    hasAnyPosts: false,
    hasMoreBeyondPreview: false,
    loading: true,
    error: null,
  });

  const handleMetaChange = useCallback((nextMeta) => {
    setMeta(nextMeta);
  }, []);

  const handleViewMore = () => {
    const isOwnProfile =
      currentUserId && String(userId) === String(currentUserId);
    navigate(isOwnProfile ? "/profile/posts" : `/user-profile/${userId}/posts`);
  };

  if (!userId) return null;

  const showViewMore = !meta.loading && !meta.error && meta.hasAnyPosts;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-[#1A3E32]">
          Activity
        </h2>
        {showViewMore && (
          <button
            type="button"
            onClick={handleViewMore}
            className="text-sm font-semibold text-[#16730F] hover:text-[#145a0c] hover:underline shrink-0"
          >
            View more
          </button>
        )}
      </div>

      <UserPostsFeed
        userId={userId}
        currentUserId={currentUserId}
        previewLimit={PREVIEW_LIMIT}
        onMetaChange={handleMetaChange}
      />

      {showViewMore && meta.hasMoreBeyondPreview && (
        <div className="pt-4 mt-2 border-t border-gray-100 flex justify-center">
          <button
            type="button"
            onClick={handleViewMore}
            className="px-5 py-2.5 rounded-full border border-[#16730F] text-[#16730F] text-sm font-semibold hover:bg-[#16730F] hover:text-white transition-colors"
          >
            View all posts
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePostsSection;

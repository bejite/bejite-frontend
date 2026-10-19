import PostActionIcon from "./PostActionIcon";

export default function PostActions({
  liked,
  saved,
  likesCount,
  commentsCount,
  sharesCount,
  onLike,
  onComment,
  onShare,
  onSave,
}) {
  return (
    <div className="flex flex-row justify-start items-center gap-3 sm:gap-6 border-t border-[#D3D3D3] pt-4">
      <button
        onClick={onLike}
        className={`flex items-center justify-center gap-1.5 p-0 ${
          liked ? "text-red-500" : "text-gray-600 hover:text-red-500"
        }`}
        aria-label={liked ? "Unlike" : "Like"}
      >
        <PostActionIcon type="like" active={liked} />
        <span className="text-xs tabular-nums sm:hidden">{likesCount}</span>
        <span className="hidden sm:inline text-xs sm:text-sm">
          {liked ? "Liked" : "Like"}
        </span>
      </button>
      <button
        onClick={onComment}
        className="flex items-center justify-center gap-1.5 p-0 text-gray-600 hover:text-[#16730F]"
        aria-label="Comment"
      >
        <PostActionIcon type="comment" />
        <span className="text-xs tabular-nums sm:hidden">{commentsCount}</span>
        <span className="hidden sm:inline text-xs sm:text-sm">Comment</span>
      </button>
      <button
        onClick={onShare}
        className="flex items-center justify-center gap-1.5 p-0 text-gray-600 hover:text-[#16730F]"
        aria-label="Share"
      >
        <PostActionIcon type="share" />
        <span className="text-xs tabular-nums sm:hidden">{sharesCount}</span>
        <span className="hidden sm:inline text-xs sm:text-sm">Share</span>
      </button>
      <button
        onClick={onSave}
        className={`flex items-center justify-center gap-2 p-0 ${
          saved ? "text-[#16730F]" : "text-gray-600 hover:text-[#16730F]"
        }`}
        aria-label={saved ? "Unsave post" : "Save post"}
      >
        <PostActionIcon type="save" active={saved} />
        <span className="hidden sm:inline text-xs sm:text-sm">
          {saved ? "Saved" : "Save"}
        </span>
      </button>
    </div>
  );
}

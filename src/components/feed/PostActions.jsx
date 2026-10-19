import PostActionIcon from "./PostActionIcon";

export default function PostActions({
  liked,
  saved,
  sharedByMe = false,
  repostScheduled = false,
  likesCount,
  commentsCount,
  sharesCount,
  hideCounts = false,
  onLike,
  onShowLikers,
  onComment,
  onRepost,
  onShare,
  onSave,
}) {
  const repostLabel = sharedByMe
    ? repostScheduled
      ? "Scheduled"
      : "Reposted"
    : "Repost";
  const repostAria = sharedByMe
    ? repostScheduled
      ? "Edit scheduled repost"
      : "Undo repost"
    : "Repost";

  return (
    <div className="flex flex-row justify-start items-center gap-2.5 sm:gap-5 border-t border-[#D3D3D3] pt-4 flex-wrap">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onLike}
          className={`flex items-center justify-center gap-1.5 p-0 ${
            liked ? "text-red-500" : "text-gray-600 hover:text-red-500"
          }`}
          aria-label={liked ? "Unlike" : "Like"}
        >
          <PostActionIcon type="like" active={liked} />
          <span className="hidden sm:inline text-xs sm:text-sm">
            {liked ? "Liked" : "Like"}
          </span>
        </button>
        {!hideCounts && (
          <button
            type="button"
            onClick={() => {
              if (likesCount > 0) onShowLikers?.();
            }}
            disabled={likesCount <= 0 || !onShowLikers}
            className="text-xs tabular-nums sm:hidden min-h-[28px] px-0.5 disabled:opacity-70"
            aria-label={
              likesCount > 0
                ? `View ${likesCount} people who liked this post`
                : "No likes yet"
            }
          >
            {likesCount}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onComment}
        className="flex items-center justify-center gap-1.5 p-0 text-gray-600 hover:text-[#16730F]"
        aria-label="Comment"
      >
        <PostActionIcon type="comment" />
        {!hideCounts && (
          <span className="text-xs tabular-nums sm:hidden">{commentsCount}</span>
        )}
        <span className="hidden sm:inline text-xs sm:text-sm">Comment</span>
      </button>
      <button
        type="button"
        onClick={onRepost}
        className={`flex items-center justify-center gap-1.5 p-0 ${
          sharedByMe
            ? "text-[#16730F]"
            : "text-gray-600 hover:text-[#16730F]"
        }`}
        aria-label={repostAria}
        aria-pressed={sharedByMe}
      >
        <PostActionIcon type="repost" active={sharedByMe} />
        {!hideCounts && (
          <span className="text-xs tabular-nums sm:hidden">{sharesCount}</span>
        )}
        <span className="hidden sm:inline text-xs sm:text-sm">{repostLabel}</span>
      </button>
      <button
        type="button"
        onClick={onShare}
        className="flex items-center justify-center gap-1.5 p-0 text-gray-600 hover:text-[#16730F]"
        aria-label="Share"
      >
        <PostActionIcon type="share" />
        <span className="hidden sm:inline text-xs sm:text-sm">Share</span>
      </button>
      <button
        type="button"
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

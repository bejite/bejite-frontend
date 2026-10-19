export default function FeedLoadMoreButton({
  hasMore,
  loading,
  onLoadMore,
  label = "Load older posts",
}) {
  if (!hasMore) return null;

  return (
    <div className="text-center py-6">
      <button
        type="button"
        onClick={onLoadMore}
        disabled={loading}
        className="px-6 py-2.5 rounded-full border-2 border-[#16730F] text-[#16730F] text-sm font-semibold hover:bg-[#16730F] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Loading..." : label}
      </button>
    </div>
  );
}

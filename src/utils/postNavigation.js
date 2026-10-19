export function getPostDetailPath(postId) {
  if (!postId) return "/news-feed";
  return `/post/${encodeURIComponent(postId)}`;
}

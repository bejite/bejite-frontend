export const OPEN_CREATE_POST = "bejite:open-create-post";
const PENDING_KEY = "bejite:pending-create-post";

/** Open the news-feed composer. Navigates to the feed first when needed. */
export function requestOpenCreatePost(navigate) {
  const onFeed =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/news-feed");

  if (onFeed) {
    window.dispatchEvent(new CustomEvent(OPEN_CREATE_POST));
    return;
  }

  try {
    sessionStorage.setItem(PENDING_KEY, "1");
  } catch {
    /* storage unavailable */
  }
  navigate?.("/news-feed");
}

export function consumePendingCreatePost() {
  try {
    if (sessionStorage.getItem(PENDING_KEY) !== "1") return false;
    sessionStorage.removeItem(PENDING_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Go to the previous route when history allows it; otherwise use fallback.
 */
export function navigateBack(navigate, fallback = "/news-feed") {
  const idx = window.history.state?.idx;
  if (typeof idx === "number" && idx > 0) {
    navigate(-1);
    return;
  }
  // React Router may not set idx (refresh, external entry); try history once.
  if (typeof window !== "undefined" && window.history.length > 1) {
    navigate(-1);
    return;
  }
  navigate(fallback);
}

import usePageViewTracker from "../hooks/usePageViewTracker";

/** Side-effect-only component — must live under BrowserRouter. */
export default function PageViewTracker() {
  usePageViewTracker();
  return null;
}

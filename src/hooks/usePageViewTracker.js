import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  bindPageViewLifecycle,
  trackPageView,
} from "../utils/pageViewAnalytics";

/**
 * Records main-app route changes for admin page/feature usage analytics.
 * Mount once inside the Router.
 */
export default function usePageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    bindPageViewLifecycle();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);
}

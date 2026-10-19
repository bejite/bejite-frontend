import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { hydrateAuth } from "../features/auth/authSlice";
import {
  captureOAuthSessionFromUrl,
  clearAuthData,
  dispatchHydrateAuth,
  getAccessToken,
  getRefreshToken,
  getUser,
  isOAuthCallbackPath,
  refreshAccessToken,
  restoreUserFromServer,
} from "../utils/tokenManager";

/**
 * Restores user sessions from refresh token on app load (non-admin only).
 * Admin auth is unchanged and is not silently refreshed here.
 */
export default function AuthBootstrap({ children }) {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const pathname = window.location.pathname;
      const search = window.location.search;

      dispatch(hydrateAuth());

      // OAuth callback pages store tokens from URL — do not refresh with a stale token first.
      if (isOAuthCallbackPath(pathname, search)) {
        captureOAuthSessionFromUrl(search);
        await dispatchHydrateAuth();
        if (!cancelled) setReady(true);
        return;
      }

      const storedUser = getUser();
      const refreshToken = getRefreshToken();

      if (storedUser?.is_admin) {
        if (!cancelled) setReady(true);
        return;
      }

      if (refreshToken) {
        try {
          await refreshAccessToken();
        } catch {
          // Only wipe session when there is no valid access token to fall back on.
          if (!getAccessToken()) {
            clearAuthData();
          }
        }
      }

      if (getAccessToken()) {
        await restoreUserFromServer();
        await dispatchHydrateAuth();
      } else {
        dispatch(hydrateAuth());
      }

      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  if (!ready) {
    return null;
  }

  return children;
}

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { hydrateAuth, logout } from "../features/auth/authSlice";
import PageLoader from "./PageLoader.jsx";
import {
  captureOAuthSessionFromUrl,
  clearAuthData,
  dispatchHydrateAuth,
  getAccessToken,
  getRefreshToken,
  getUser,
  hasValidAccessToken,
  isOAuthCallbackPath,
  isTokenExpired,
  refreshAccessToken,
  restoreUserFromServer,
} from "../utils/tokenManager";

const BOOTSTRAP_TIMEOUT_MS = 12_000;

function withTimeout(promise, ms = BOOTSTRAP_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Auth bootstrap timeout")), ms);
    }),
  ]);
}

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
      try {
        const pathname = window.location.pathname;
        const search = window.location.search;

        dispatch(hydrateAuth());

        // OAuth callback pages store tokens from URL — do not refresh with a stale token first.
        if (isOAuthCallbackPath(pathname, search)) {
          await captureOAuthSessionFromUrl(search);
          await dispatchHydrateAuth();
          return;
        }

        const storedUser = getUser();
        const refreshToken = getRefreshToken();
        const accessToken = getAccessToken();
        const needsRefresh =
          refreshToken && (!accessToken || isTokenExpired(accessToken));

        if (storedUser?.is_admin) {
          return;
        }

        if (needsRefresh) {
          try {
            await withTimeout(refreshAccessToken());
          } catch {
            if (!hasValidAccessToken()) {
              clearAuthData();
              dispatch(logout());
            }
          }
        }

        if (hasValidAccessToken()) {
          try {
            await withTimeout(restoreUserFromServer());
          } catch {
            /* offline or slow API — use cached user */
          }
          await dispatchHydrateAuth();
        } else {
          dispatch(hydrateAuth());
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn("[AuthBootstrap]", err?.message || err);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <PageLoader />
      </div>
    );
  }

  return children;
}

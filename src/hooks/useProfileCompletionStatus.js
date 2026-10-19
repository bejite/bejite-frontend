import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import axiosInstance from '../utils/axiosInstance';
import { updateUser } from '../features/auth/authSlice';
import {
  getUser,
  isAuthenticated,
  storeUser,
  mergeAuthUsers,
} from '../utils/tokenManager';

/**
 * Loads profileCompleted from /auth/me and syncs Redux + localStorage.
 * Re-fetches whenever `authKey` changes (new login). A failed fetch never
 * treats a stale cached `true` as complete for a new session.
 */
export default function useProfileCompletionStatus({
  enabled = true,
  authKey = null,
} = {}) {
  const dispatch = useDispatch();
  const requestIdRef = useRef(0);
  const hasServerResultRef = useRef(false);
  const [loading, setLoading] = useState(() => Boolean(enabled));
  const [profileCompleted, setProfileCompleted] = useState(false);

  const fetchStatus = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    if (!enabled || !isAuthenticated()) {
      if (requestId !== requestIdRef.current) return false;
      hasServerResultRef.current = false;
      setProfileCompleted(false);
      setLoading(false);
      return false;
    }

    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/auth/me');
      if (requestId !== requestIdRef.current) return null;

      const fromApi = data?.user?.profileCompleted === true;
      const local = getUser() || {};
      const merged = {
        ...mergeAuthUsers(local, data?.user ?? {}),
        profileCompleted: fromApi,
        mode: data?.user?.mode ?? local?.mode ?? null,
      };
      storeUser(merged);
      dispatch(updateUser({ profileCompleted: fromApi, mode: merged.mode }));
      hasServerResultRef.current = true;
      setProfileCompleted(fromApi);
      return fromApi;
    } catch {
      if (requestId !== requestIdRef.current) return null;
      // New session with no successful /auth/me yet → treat as incomplete
      // so the reminder can still appear rather than hiding forever.
      if (!hasServerResultRef.current) {
        setProfileCompleted(false);
      }
      return hasServerResultRef.current ? null : false;
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [dispatch, enabled]);

  useEffect(() => {
    hasServerResultRef.current = false;
    setProfileCompleted(false);
    if (enabled) setLoading(true);
    fetchStatus();
    return () => {
      requestIdRef.current += 1;
    };
  }, [fetchStatus, enabled, authKey]);

  return { profileCompleted, loading, refresh: fetchStatus };
}

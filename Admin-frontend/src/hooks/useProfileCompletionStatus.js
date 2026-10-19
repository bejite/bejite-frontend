import { useCallback, useEffect, useState } from 'react';
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
 */
export default function useProfileCompletionStatus({ enabled = true } = {}) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(() => {
    const u = getUser();
    return u?.profileCompleted === true;
  });

  const refresh = useCallback(async () => {
    if (!enabled || !isAuthenticated()) {
      setProfileCompleted(false);
      return false;
    }

    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/auth/me');
      const fromApi = data?.user?.profileCompleted === true;
      const local = getUser() || {};
      const merged = {
        ...mergeAuthUsers(local, data?.user ?? {}),
        profileCompleted: fromApi,
      };
      storeUser(merged);
      dispatch(updateUser({ profileCompleted: fromApi }));
      setProfileCompleted(fromApi);
      return fromApi;
    } catch {
      const local = getUser();
      const fallback = local?.profileCompleted === true;
      setProfileCompleted(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  }, [dispatch, enabled]);

  useEffect(() => {
    if (!enabled) return undefined;

    let active = true;
    if (!isAuthenticated()) {
      Promise.resolve().then(() => {
        if (active) setProfileCompleted(false);
      });
      return undefined;
    }

    (async () => {
      try {
        const { data } = await axiosInstance.get('/auth/me');
        if (!active) return;
        const fromApi = data?.user?.profileCompleted === true;
        const local = getUser() || {};
        const merged = {
          ...mergeAuthUsers(local, data?.user ?? {}),
          profileCompleted: fromApi,
        };
        storeUser(merged);
        dispatch(updateUser({ profileCompleted: fromApi }));
        setProfileCompleted(fromApi);
      } catch {
        if (!active) return;
        const local = getUser();
        setProfileCompleted(local?.profileCompleted === true);
      }
    })();

    return () => {
      active = false;
    };
  }, [enabled, dispatch]);

  return { profileCompleted, loading, refresh };
}

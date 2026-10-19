import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAccessToken } from '../utils/tokenManager';
import { refreshVerifiedBadge } from '../services/verifiedBadgeSync';

/**
 * Keeps auth.user.hasVerifiedBadge in sync with the server (once per session mount).
 */
export default function useVerifiedBadgeSync() {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth?.user?.id);
  const isAdmin = useSelector((state) => state.auth?.user?.is_admin);
  const syncedForUserRef = useRef(null);

  useEffect(() => {
    if (!userId || isAdmin || !getAccessToken()) return;
    if (syncedForUserRef.current === userId) return;

    syncedForUserRef.current = userId;
    refreshVerifiedBadge(dispatch);
  }, [userId, isAdmin, dispatch]);
}

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../features/auth/authSlice';
import { fetchCurrentUserProfilePhoto } from '../services/profilePhotoService';

/**
 * Loads GET /auth/user/profile/photo and merges into Redux + localStorage.
 * Re-runs when the access token changes (e.g. after login) so recruiters are not stuck
 * on a placeholder until full page refresh. No global singleton — Strict Mode safe.
 */
export default function useSyncProfilePhoto() {
  const dispatch = useDispatch();
  const authToken = useSelector((state) => state.auth?.token ?? null);

  useEffect(() => {
    const lsToken =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('accessToken') || localStorage.getItem('authToken')
        : null;
    const token = authToken || lsToken;
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        const url = await fetchCurrentUserProfilePhoto();
        if (cancelled || !url) return;
        dispatch(
          updateUser({
            image: url,
            profile_photo: url,
            profilePhoto: url,
          }),
        );
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn('[useSyncProfilePhoto]', err?.response?.status || err?.message);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch, authToken]);
}

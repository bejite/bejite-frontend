import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import { getUser, isAuthenticated } from '../utils/tokenManager';
import useProfileCompletionStatus from '../hooks/useProfileCompletionStatus';

const DISMISS_KEY = 'profileCompletionReminderDismissed';

const SKIP_EXACT = new Set([
  '/',
  '/signup',
  '/forgot-password',
  '/email-check',
  '/complete-signup',
  '/confirmpassword',
]);

const SKIP_PREFIXES = [
  '/auth/',
  '/admin',
  '/resume',
  '/bio',
  '/education',
  '/skills',
  '/work-history',
  '/certificate',
  '/links',
  '/job-type',
  '/save-progress',
  '/edit-profile',
  '/individual/',
  '/corporate/',
  '/jobseeker-option',
  '/employer-option',
  '/jobconnection',
  '/verify-email',
  '/verify-failed',
  '/verify-expired',
];

function shouldSkipPath(pathname) {
  if (SKIP_EXACT.has(pathname)) return true;
  return SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function getProfileSetupPath(role) {
  if (role === 'recruiter') {
    return '/edit-profile/recruiter/basic-details';
  }
  if (role === 'jobseeker') {
    return '/resume';
  }
  return '/complete-signup';
}

/**
 * Fixed corner popup reminding authenticated users to complete their profile.
 */
export default function ProfileCompletionReminder() {
  const location = useLocation();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISS_KEY) === '1',
  );

  const onAppRoute = !shouldSkipPath(location.pathname);
  const authenticated = isAuthenticated();
  const { profileCompleted, loading } = useProfileCompletionStatus({
    enabled: authenticated && onAppRoute,
  });

  const user = getUser();
  const role = user?.role;

  const visible = useMemo(() => {
    if (!authenticated || !onAppRoute || dismissed || loading) return false;
    if (!role) return false;
    return profileCompleted !== true;
  }, [
    authenticated,
    onAppRoute,
    dismissed,
    loading,
    role,
    profileCompleted,
  ]);

  useEffect(() => {
    if (profileCompleted === true) {
      sessionStorage.removeItem(DISMISS_KEY);
    }
  }, [profileCompleted]);

  if (!visible) return null;

  const setupPath = getProfileSetupPath(role);
  const title =
    role === 'recruiter'
      ? 'Complete your recruiter profile'
      : 'Complete your jobseeker profile';
  const description =
    role === 'recruiter'
      ? 'Add your company details so candidates can find and trust you.'
      : 'Add your bio, skills, and experience to get better job matches.';

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Profile completion reminder"
      className="fixed bottom-4 right-4 z-[100] w-[min(100vw-2rem,22rem)] rounded-xl border border-[#16730F]/30 bg-white p-4 shadow-lg"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[#1A3E32]">{title}</p>
          <p className="mt-1 text-xs text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Dismiss reminder"
        >
          <FaTimes size={14} />
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => navigate(setupPath)}
          className="flex-1 rounded-lg bg-[#16730F] px-3 py-2 text-sm font-medium text-white hover:bg-[#125c0c]"
        >
          Complete profile
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Later
        </button>
      </div>
    </div>
  );
}

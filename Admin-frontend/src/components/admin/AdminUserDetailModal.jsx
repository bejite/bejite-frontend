import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { fetchFullUserProfile } from '../../services/fetchFullUserProfile';
import { normalizeProfileData } from '../../utils/profileUtils';
import { mergeCvWithCandidateSkills } from '../../utils/profileSkills';
import { formatDisplayPersonName } from '../../utils/personDisplayName';
import { getFormattedCandidateProfileFields } from '../../utils/displayFormatUtils';
import { profilePhotoUrl } from '../../utils/profilePhotoUrl';
import { pickAuthorProfilePhoto } from '../../utils/profileImageUtils';
import { CertificateViewerModal } from '../CertificateViewerModal';
import AdminProfileHeader from './profilePanels/AdminProfileHeader';
import AdminProfilePanelRouter from './profilePanels/AdminProfilePanelRouter';
import {
  getAdminProfilePanelType,
  PROFILE_PANEL_TITLES,
} from './profilePanels/profilePanelUtils';

const AdminUserDetailModal = ({ user, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [cvData, setCvData] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [photoError, setPhotoError] = useState(false);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [resolvedPhotoPath, setResolvedPhotoPath] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      setPhotoError(false);
      setResolvedPhotoPath(null);

      try {
        const userId = user.id;
        let loadedUser = null;
        let cv = null;
        let candidateRow = null;
        let photoFromApi = null;

        const full = await fetchFullUserProfile(userId);
        if (full?.user) {
          loadedUser = full.user;
          cv = full.cv;
        } else {
          try {
            const { data: profileRes } = await axiosInstance.get(
              `/api/admin/data/users/${userId}/profile`,
            );
            if (profileRes?.success && profileRes.data) {
              loadedUser = normalizeProfileData(profileRes.data);
            }
          } catch {
            /* optional fallback */
          }

          if (!cv) {
            try {
              const { data: cvRes } = await axiosInstance.get(
                `/api/cv-builder/complete/${userId}`,
              );
              if (cvRes?.success && cvRes.data) {
                cv = {
                  bio: cvRes.data.bio ?? null,
                  education: cvRes.data.education ?? [],
                  skills: cvRes.data.skills ?? [],
                  workHistory: cvRes.data.workHistory ?? [],
                  certificates: cvRes.data.certificates ?? [],
                  links: cvRes.data.links ?? null,
                };
              }
            } catch {
              /* optional fallback */
            }
          }
        }

        try {
          const { data: photoRes } = await axiosInstance.get(
            `/api/admin/data/users/${userId}/profile-photo`,
          );
          photoFromApi = photoRes?.profile_photo ?? null;
        } catch {
          /* optional */
        }

        try {
          const isRecruiterRole =
            String(user?.role || loadedUser?.role || '').toLowerCase() === 'recruiter';
          if (!isRecruiterRole) {
            const { data: candRes } = await axiosInstance.get(`/api/candidates/${userId}`);
            candidateRow = candRes?.data ?? null;
          }
        } catch {
          /* not every user has a candidate row */
        }

        const mergedProfile = {
          ...user,
          ...(loadedUser || {}),
          first_name: loadedUser?.first_name ?? user.firstName,
          last_name: loadedUser?.last_name ?? user.lastName,
          firstName: loadedUser?.firstName ?? user.firstName,
          lastName: loadedUser?.lastName ?? user.lastName,
          profile_photo:
            photoFromApi ??
            loadedUser?.profile_photo ??
            loadedUser?.profilePhoto ??
            null,
        };

        const photoPath =
          photoFromApi ||
          pickAuthorProfilePhoto(mergedProfile) ||
          pickAuthorProfilePhoto(candidateRow) ||
          cv?.bio?.profile_photo ||
          null;

        setResolvedPhotoPath(photoPath);
        setProfileUser(mergedProfile);
        setCvData(mergeCvWithCandidateSkills(cv, candidateRow));
        setCandidate(candidateRow);
      } catch (err) {
        console.error('Error loading user profile', err);
        setError(err.response?.data?.error || err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, reloadToken]);

  const panelType = useMemo(
    () => getAdminProfilePanelType(user, profileUser),
    [user, profileUser],
  );

  if (!user) return null;

  const displayName = formatDisplayPersonName(
    {
      first_name: profileUser?.first_name ?? user.firstName,
      last_name: profileUser?.last_name ?? user.lastName,
      nickname: profileUser?.nickname,
      email: user.email,
    },
    'User',
  );

  const profileFields = getFormattedCandidateProfileFields(
    { ...candidate, ...profileUser },
    { cvBio: cvData?.bio },
  );

  const photoPath = resolvedPhotoPath;
  const photoViewUrl = photoPath && !photoError ? profilePhotoUrl(photoPath) : null;
  const canViewPhoto = Boolean(photoViewUrl);
  const isVerified = user.verified || user.isEmailVerified || profileUser?.verified;
  const modalTitle = PROFILE_PANEL_TITLES[panelType] || PROFILE_PANEL_TITLES.unknown;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/50"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        className="bg-gray-50 w-full max-w-3xl h-full shadow-2xl flex flex-col"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
              {modalTitle}
            </h2>
            <p className="text-sm text-gray-500 truncate">{displayName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 shrink-0"
            aria-label="Close profile"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto nfl-scroll p-4 sm:p-6 space-y-6">
          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin inline-block rounded-full h-10 w-10 border-b-2 border-[#16730F]" />
              <p className="text-gray-500 mt-3">Loading full profile...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-600">{error}</div>
          ) : (
            <>
              <AdminProfileHeader
                user={user}
                profileUser={profileUser}
                displayName={displayName}
                profileFields={profileFields}
                panelType={panelType}
                photoPath={photoPath}
                photoError={photoError}
                onPhotoError={() => setPhotoError(true)}
                onPhotoClick={() => canViewPhoto && setPhotoViewerOpen(true)}
                canViewPhoto={canViewPhoto}
                isVerified={isVerified}
              />

              <AdminProfilePanelRouter
                panelType={panelType}
                user={user}
                profileUser={profileUser}
                profileFields={profileFields}
                cvData={cvData}
                candidate={candidate}
                isVerified={isVerified}
                onBadgeReviewed={() => setReloadToken((token) => token + 1)}
              />
            </>
          )}
        </div>
      </div>

      {canViewPhoto ? (
        <CertificateViewerModal
          open={photoViewerOpen}
          onClose={() => setPhotoViewerOpen(false)}
          fileUrl={photoPath}
          title={`${displayName} — profile photo`}
        />
      ) : null}
    </div>
  );
};

export default AdminUserDetailModal;

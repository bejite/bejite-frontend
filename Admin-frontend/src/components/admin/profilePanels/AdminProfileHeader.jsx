import { Mail, Shield, CheckCircle, XCircle } from 'lucide-react';
import { formatDisplayRole } from '../../../utils/personDisplayName';
import { profileAvatarSrc, PROFILE_PHOTO_PLACEHOLDER } from '../../../utils/profilePhotoUrl';
import VerifiedBadge, { userIsRecruiter } from '../../VerifiedBadge';

const PANEL_BADGE_STYLES = {
  jobseeker: 'bg-blue-50 text-blue-700',
  corporate: 'bg-purple-50 text-purple-700',
  individual: 'bg-indigo-50 text-indigo-700',
  unknown: 'bg-gray-100 text-gray-700',
};

const PANEL_BADGE_LABELS = {
  jobseeker: 'Jobseeker',
  corporate: 'Corporate recruiter',
  individual: 'Individual recruiter',
  unknown: 'User',
};

export default function AdminProfileHeader({
  user,
  profileUser,
  displayName,
  profileFields,
  panelType,
  photoPath,
  photoError,
  onPhotoError,
  onPhotoClick,
  canViewPhoto,
  isVerified,
}) {
  const badgeStyle = PANEL_BADGE_STYLES[panelType] || PANEL_BADGE_STYLES.unknown;
  const badgeLabel = PANEL_BADGE_LABELS[panelType] || formatDisplayRole(user.role, 'Unassigned');

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
        <div className="flex flex-col items-center sm:items-start gap-2 shrink-0">
          <button
            type="button"
            onClick={onPhotoClick}
            disabled={!canViewPhoto}
            className={`rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16730F] ${
              canViewPhoto ? 'cursor-pointer hover:opacity-90' : 'cursor-default'
            }`}
            title={canViewPhoto ? 'View profile photo' : 'No profile photo'}
          >
            <img
              src={
                photoError || !photoPath
                  ? PROFILE_PHOTO_PLACEHOLDER
                  : profileAvatarSrc(photoPath)
              }
              alt={displayName}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md bg-gray-100"
              onError={onPhotoError}
            />
          </button>
          {!canViewPhoto ? (
            <span className="text-xs text-gray-400">No profile photo</span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold text-[#1A3E32]">{displayName}</h3>
            {profileUser?.hasVerifiedBadge ? (
              <VerifiedBadge user={profileUser} />
            ) : userIsRecruiter(profileUser || user) ? (
              <VerifiedBadge user={profileUser || user} unverified />
            ) : null}
            {user.is_admin ? (
              <Shield className="text-blue-500" size={18} title="Admin" />
            ) : null}
          </div>
          {profileFields.title ? (
            <p className="text-gray-700 mt-1">{profileFields.title}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1 min-w-0">
              <Mail size={14} className="shrink-0" />
              <span className="truncate">{user.email}</span>
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                isVerified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              {isVerified ? <CheckCircle size={12} /> : <XCircle size={12} />}
              {isVerified ? 'Verified' : 'Pending verification'}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeStyle}`}
            >
              {badgeLabel}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

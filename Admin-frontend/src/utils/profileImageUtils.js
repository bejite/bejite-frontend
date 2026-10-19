import { getUser } from './tokenManager';
import { profileAvatarSrc } from './profilePhotoUrl';

export const getUserProfileImage = () => {
  const user = getUser();
  const raw = user?.image || user?.profilePhoto || user?.profile_photo;
  return profileAvatarSrc(raw);
};

/**
 * @param {string | null | undefined} imagePath
 * @returns {string}
 */
export const getProfileImageUrl = (imagePath) => profileAvatarSrc(imagePath);

/** Author/connection payloads may use multiple photo key variants. */
export const pickAuthorProfilePhoto = (entity) => {
  if (!entity || typeof entity !== 'object') return null;
  const raw =
    entity.image ??
    entity.profile_photo ??
    entity.profilePhoto ??
    entity.profilePictureUrl ??
    entity.profile_picture_url ??
    entity.avatar ??
    entity.avatar_url ??
    entity.author_profile_photo ??
    null;
  return raw && String(raw).trim() ? String(raw).trim() : null;
};

export const getAuthorProfileImageUrl = (entity) =>
  profileAvatarSrc(pickAuthorProfilePhoto(entity));

export { profilePhotoUrl, profileAvatarSrc, PROFILE_PHOTO_PLACEHOLDER } from './profilePhotoUrl';

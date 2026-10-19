import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaComment, FaChevronDown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosInstance';
import { fetchFullUserProfile } from '../../services/fetchFullUserProfile';
import { profileAvatarSrc } from '../../utils/profilePhotoUrl';
import { pickAuthorProfilePhoto } from '../../utils/profileImageUtils';
import { formatSalaryExpectation } from '../../utils/formatSalary';
import ProfileCvSections from '../ProfileCvSections';
import { mergeCvWithCandidateSkills } from '../../utils/profileSkills';
import { useCandidateConnect } from '../../hooks/useCandidateConnect';
import { resolveCandidateUserId } from '../../utils/resolveCandidateUserId';
import messagingService from '../../services/messagingService';
import CandidateJobPreferences from './CandidateJobPreferences';
import CandidateContactInfo from './CandidateContactInfo';
import { formatDisplayPersonName, formatDisplayRole } from '../../utils/personDisplayName';
import DisplayNameWithBadge from '../DisplayNameWithBadge';
import { getFormattedCandidateProfileFields } from '../../utils/displayFormatUtils';

const UserMainProfileCard = ({ candidateId, connectUserId: connectUserIdProp }) => {
  const [candidate, setCandidate] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!candidateId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data: candidateRes } = await axiosInstance.get(
          `/api/candidates/${candidateId}`,
        );
        const candidateRow = candidateRes?.data ?? candidateRes;
        if (!candidateRow?.user_id && !candidateRow?.id) {
          throw new Error('Candidate not found');
        }
        setCandidate(candidateRow);

        const userId = candidateRow.user_id;
        if (userId) {
          let cv = null;
          const full = await fetchFullUserProfile(userId);
          if (full?.user) {
            setProfileUser(full.user);
            cv = full.cv;
          } else {
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
          }
          setCvData(mergeCvWithCandidateSkills(cv, candidateRow));
        }
      } catch (err) {
        console.error('Error fetching full profile:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [candidateId]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#16730F]" />
        <p className="mt-4 text-[#1A3E32]">Loading full profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const displayName = formatDisplayPersonName(
    {
      first_name: candidate?.first_name ?? profileUser?.first_name ?? profileUser?.firstName,
      last_name: candidate?.last_name ?? profileUser?.last_name ?? profileUser?.lastName,
      nickname: profileUser?.nickname,
      name: profileUser?.name,
    },
    'Candidate',
  );

  const photoPath =
    pickAuthorProfilePhoto(candidate) ||
    pickAuthorProfilePhoto(profileUser) ||
    (Array.isArray(candidate?.user_bio)
      ? candidate.user_bio[0]?.profile_photo
      : candidate?.user_bio?.profile_photo) ||
    cvData?.bio?.profile_photo;

  const profileFields = getFormattedCandidateProfileFields(
    { ...candidate, ...profileUser },
    { cvBio: cvData?.bio },
  );
  const aboutText = profileFields.bio;
  const title = profileFields.title;
  const location = profileFields.location;

  const getAboutPreview = (text) => {
    if (!text) return { text: "", needsTruncation: false };
    const words = text.split(/\s+/).filter(Boolean);
    if (text.length > 240 || words.length > 35) {
      const truncatedByChar = text.slice(0, 240).trim();
      const lastSpaceIndex = truncatedByChar.lastIndexOf(" ");
      const cleanTruncated =
        lastSpaceIndex > 80
          ? truncatedByChar.slice(0, lastSpaceIndex)
          : truncatedByChar;
      return {
        text: cleanTruncated + "...",
        needsTruncation: true,
      };
    }
    return { text, needsTruncation: false };
  };

  const aboutPreview = aboutText ? getAboutPreview(aboutText) : { text: "", needsTruncation: false };

  const salaryPreview = formatSalaryExpectation(
    candidate?.salary_expectation,
    candidate?.currency,
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
      <ProfileHeaderCard
        displayName={displayName}
        profileUser={profileUser}
        hasVerifiedBadge={Boolean(profileUser?.hasVerifiedBadge)}
        title={title}
        location={location}
        experienceYears={candidate?.experience_years}
        salaryPreview={salaryPreview}
        photoPath={photoPath}
        candidate={candidate}
        connectUserIdProp={connectUserIdProp}
        onOpenPhotoViewer={() => setIsPhotoViewerOpen(true)}
      />

      {aboutText && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-[#1A3E32] mb-4">About</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
            {!aboutPreview.needsTruncation || isAboutExpanded
              ? aboutText
              : aboutPreview.text}
          </p>
          {aboutPreview.needsTruncation && (
            <button
              type="button"
              onClick={() => setIsAboutExpanded(!isAboutExpanded)}
              className="mt-3 text-[#16730F] hover:text-[#145a0c] font-semibold text-xs sm:text-sm transition-colors inline-flex items-center gap-1 group cursor-pointer"
            >
              <span>{isAboutExpanded ? "See Less" : "See More"}</span>
              <FaChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isAboutExpanded ? "rotate-180 text-[#16730F]" : ""
                }`}
              />
            </button>
          )}
        </section>
      )}

      <ProfileCvSections cv={cvData} candidate={candidate} />

      <CandidateJobPreferences candidate={candidate} />

      <CandidateContactInfo candidate={candidate} bio={cvData?.bio} />

      {isPhotoViewerOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4"
          onClick={() => setIsPhotoViewerOpen(false)}
        >
          <img
            src={profileAvatarSrc(photoPath)}
            alt={`${displayName} full view`}
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(event) => event.stopPropagation()}
          />
          <button
            type="button"
            aria-label="Close photo viewer"
            className="absolute top-4 right-4 text-white text-2xl bg-black/40 hover:bg-black/60 rounded-full w-10 h-10 flex items-center justify-center"
            onClick={() => setIsPhotoViewerOpen(false)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

const ProfileHeaderCard = ({
  displayName,
  profileUser = null,
  hasVerifiedBadge = false,
  title,
  location,
  experienceYears,
  salaryPreview,
  photoPath,
  candidate,
  connectUserIdProp,
  onOpenPhotoViewer,
}) => {
  const navigate = useNavigate();
  const connectUserId =
    resolveCandidateUserId(candidate) || connectUserIdProp || null;
  const { sendRequest, acceptRequest, connectLabel, connectDisabled, status, sending } =
    useCandidateConnect(connectUserId, displayName);
  const [messaging, setMessaging] = useState(false);
  const isStatusLoading = Boolean(status.loading);
  const showConnectSpinner = isStatusLoading || sending;
  const isFollowingState = Boolean(status.isCorporate && status.isFollowing);
  const isConnectedState = Boolean(!status.isCorporate && status.isConnected);
  const isPendingState = Boolean(status.pendingOutgoing);
  const isSettledNetworkState =
    isFollowingState || isConnectedState || isPendingState;

  const handleConnect = async () => {
    if (isStatusLoading || sending) return;
    if (status.pendingIncoming) {
      await acceptRequest();
      return;
    }
    if (isFollowingState || !connectDisabled) {
      sendRequest();
    }
  };

  const handleMessage = async () => {
    if (!connectUserId || messaging) return;
    try {
      setMessaging(true);
      const conversation = await messagingService.startConversation(
        String(connectUserId),
      );
      navigate('/chats', {
        state: { openConversationId: conversation?.id },
      });
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Could not start conversation';
      toast.error(msg);
    } finally {
      setMessaging(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        <img
          src={profileAvatarSrc(photoPath)}
          alt={displayName}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-[#16730F] shrink-0 cursor-zoom-in"
          onClick={onOpenPhotoViewer}
        />
        <div className="flex-1 min-w-0 text-center sm:text-left w-full">
          <h1 className="text-2xl font-bold text-[#1A3E32] flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
            <DisplayNameWithBadge
              user={{ ...profileUser, hasVerifiedBadge }}
              fallback={displayName}
              badgeSize="md"
            />
          </h1>
          <p className="text-[#16730F] font-medium mt-1">{formatDisplayRole('jobseeker')}</p>
          {title && <p className="text-gray-600 mt-1">{title}</p>}
          {location && (
            <p className="text-sm text-gray-500 mt-1">📍 {location}</p>
          )}
          {experienceYears > 0 && (
            <p className="text-sm text-gray-500">
              💼 {experienceYears} Years Experience
            </p>
          )}
          {salaryPreview && (
            <p className="text-sm text-gray-500 break-words">💰 Expected: {salaryPreview}</p>
          )}
          <div
            className={`mt-4 grid gap-2 sm:gap-3 w-full max-w-lg mx-auto sm:mx-0 ${
              status.viewerIsCorporate
                ? 'grid-cols-1'
                : 'grid-cols-1 min-[420px]:grid-cols-2'
            }`}
          >
            {!status.viewerIsCorporate && (
            <button
              type="button"
              onClick={handleConnect}
              disabled={isStatusLoading || (!isFollowingState && connectDisabled)}
              aria-busy={showConnectSpinner}
              aria-pressed={isFollowingState || isConnectedState}
              className={`inline-flex w-full min-h-[44px] items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                isStatusLoading
                  ? 'bg-[#556B1F]/80 text-white cursor-wait border-2 border-transparent'
                  : isSettledNetworkState
                    ? 'bg-white text-[#556B1F] border-2 border-[#556B1F] hover:bg-[#556B1F]/10'
                    : connectDisabled
                      ? 'bg-gray-400 text-white cursor-not-allowed border-2 border-transparent'
                      : 'bg-[#556B1F] text-white border-2 border-transparent hover:bg-[#6B8E23]'
              }`}
            >
              {showConnectSpinner ? (
                <span
                  className={`inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-t-transparent ${
                    isSettledNetworkState ? 'border-[#556B1F]' : 'border-white'
                  }`}
                  aria-hidden="true"
                />
              ) : (
                <>
                  <img className="w-4 h-4 shrink-0" src="/assets/images/repeate-one.svg" alt="" />
                  <span>{connectLabel}</span>
                </>
              )}
              {showConnectSpinner && (
                <span className="sr-only">Loading connection status</span>
              )}
            </button>
            )}
            <button
              type="button"
              onClick={handleMessage}
              disabled={!connectUserId || messaging}
              aria-busy={messaging}
              className="inline-flex w-full min-h-[44px] items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-[#556B1F] border-2 border-[#556B1F] bg-white hover:bg-[#556B1F]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {messaging ? (
                <span
                  className="inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-[#556B1F] border-t-transparent"
                  aria-hidden="true"
                />
              ) : (
                <FaComment className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>Message</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMainProfileCard;

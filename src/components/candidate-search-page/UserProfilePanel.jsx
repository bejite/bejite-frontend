import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { pickAuthorProfilePhoto } from "../../utils/profileImageUtils";
import { profilePhotoUrl } from "../../utils/profilePhotoUrl";
import { CertificateViewLink } from "../CertificateViewerModal";
import { formatSalaryExpectation } from "../../utils/formatSalary";
import { useCandidateConnect } from "../../hooks/useCandidateConnect";
import { resolveCandidateUserId } from "../../utils/resolveCandidateUserId";
import { fetchFullUserProfile } from "../../services/fetchFullUserProfile";
import {
  formatDateRange,
  formatDateToMonthYear,
  isOngoingCvEntry,
} from "../../utils/checksFormat";
import {
  normalizeProfileSkills,
  resolveProfileSkillSource,
} from "../../utils/profileSkills";
import ProfileSkillsDisplay from "../ProfileSkillsDisplay";
import ResponsibilitiesList from "../ResponsibilitiesList";
import {
  buildContactInfoItems,
  getFormattedEducationFields,
} from "../../utils/displayFormatUtils";
import {
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { formatDisplayPersonName, formatDisplayRole } from "../../utils/personDisplayName";
import DisplayNameWithBadge from "../DisplayNameWithBadge";
import AvailabilityStatusDot from "./AvailabilityStatusDot";
import {
  getFormattedCandidateProfileFields,
  getFormattedWorkHistoryFields,
} from "../../utils/displayFormatUtils";

const mergeFullProfileIntoCandidate = (base, full) => {
  if (!full?.user) return base;
  return {
    ...base,
    profile_photo:
      base.profile_photo ||
      full.user.profile_photo ||
      full.user.profilePhoto ||
      full.user.image ||
      full.cv?.bio?.profile_photo ||
      null,
    profilePhoto:
      base.profilePhoto ||
      full.user.profilePhoto ||
      full.user.profile_photo ||
      full.user.image ||
      null,
    image:
      base.image ||
      full.user.image ||
      full.user.profile_photo ||
      full.user.profilePhoto ||
      null,
    _cv: full.cv,
  };
};

const enrichCandidateWithFullProfile = async (row) => {
  let merged = row;
  const userId = row?.user_id ?? row?.userId ?? null;
  if (!userId) return merged;

  try {
    const full = await fetchFullUserProfile(userId);
    if (full?.user) {
      merged = mergeFullProfileIntoCandidate(row, full);
    }
  } catch (fullProfileError) {
    console.warn(
      "Full profile fetch failed:",
      fullProfileError?.message || fullProfileError,
    );
  }

  const hasSkills =
    normalizeProfileSkills(
      resolveProfileSkillSource({ candidate: merged, cv: merged._cv }),
    ).length > 0;

  if (!hasSkills) {
    try {
      const { data: cvRes } = await axiosInstance.get(
        `/api/cv-builder/complete/${userId}`,
      );
      if (cvRes?.success && cvRes.data?.skills?.length) {
        merged = {
          ...merged,
          user_skills: merged.user_skills?.length
            ? merged.user_skills
            : cvRes.data.skills,
          _cv: {
            ...(merged._cv || {}),
            skills: cvRes.data.skills,
          },
        };
      }
    } catch (cvError) {
      console.warn("CV complete fallback failed:", cvError?.message || cvError);
    }
  }

  return merged;
};

const UserProfilePanel = ({ candidateId, connectUserId: connectUserIdProp, onViewMainProfile }) => {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);

  useEffect(() => {
    const fetchCandidateDetails = async () => {
      if (!candidateId) {
        setError("No candidate ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let candidateRow = null;

        try {
          const { data } = await axiosInstance.get(
            `/api/candidates/${candidateId}`,
          );
          candidateRow = data?.data ?? data;
        } catch (primaryError) {
          const { data: searchData } = await axiosInstance.get(
            `/api/candidates?search=${candidateId}`,
          );
          const list = searchData?.data ?? searchData?.candidates ?? [];
          if (!Array.isArray(list)) {
            throw primaryError;
          }
          candidateRow = list.find(
            (c) => String(c.id) === String(candidateId),
          );
          if (!candidateRow) {
            throw new Error(
              `Candidate with ID ${candidateId} not found in the database`,
            );
          }
        }

        if (!candidateRow) {
          throw new Error("No candidate data received from API");
        }

        const mergedCandidate = await enrichCandidateWithFullProfile(
          candidateRow,
        );
        setCandidate(mergedCandidate);
      } catch (error) {
        console.error("Error fetching candidate details:", error);
        setError(error.message || "Failed to load candidate profile");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateDetails();
  }, [candidateId]);

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 md:px-8 py-6 bg-[#F5F5F5] mt-1">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B8E23]"></div>
          <p className="text-[#6B8E23] mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-4 sm:px-6 md:px-8 py-6 bg-[#F5F5F5] mt-1">
        <div className="max-w-4xl mx-auto text-center py-20">
          <p className="text-red-500 text-lg font-semibold">
            Error Loading Profile
          </p>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="w-full px-4 sm:px-6 md:px-8 py-6 bg-[#F5F5F5] mt-1">
        <div className="max-w-4xl mx-auto text-center py-20">
          <p className="text-gray-600">No candidate data found</p>
        </div>
      </div>
    );
  }

  const educationRows =
    candidate._cv?.education?.length > 0
      ? candidate._cv.education
      : candidate.user_education?.length > 0
        ? candidate.user_education
        : null;

  const workRows =
    candidate._cv?.workHistory?.length > 0
      ? candidate._cv.workHistory
      : candidate.user_work_history?.length > 0
        ? candidate.user_work_history
        : null;

  const certificateRows =
    candidate._cv?.certificates?.length > 0
      ? candidate._cv.certificates
      : candidate.user_certificates?.length > 0
        ? candidate.user_certificates
        : null;

  const skillItems = normalizeProfileSkills(
    resolveProfileSkillSource({ candidate, cv: candidate._cv }),
  );

  const legacyEducation = candidate.education;
  const legacyWork = candidate.work_history;

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-6 bg-[#F5F5F5] mt-1">
      <div className="max-w-4xl mx-auto">
        <ProfileHeader
          candidate={candidate}
          onOpenPhotoViewer={() => setIsPhotoViewerOpen(true)}
        />
        <ProfileStats
          candidate={candidate}
          connectUserIdProp={connectUserIdProp}
          onViewMainProfile={onViewMainProfile}
        />
        <Divider />

        {educationRows?.length > 0 ? (
          <ProfileSection title="Education">
            {educationRows.map((edu, index) => (
              <EducationItem key={edu.id ?? index} education={edu} />
            ))}
          </ProfileSection>
        ) : (
          legacyEducation?.length > 0 && (
            <ProfileSection title="Education">
              {legacyEducation.map((edu, index) => (
                <EducationItem key={index} education={edu} legacy />
              ))}
            </ProfileSection>
          )
        )}

        {skillItems.length > 0 && (
          <ProfileSection title="Skills">
            <ProfileSkillsDisplay
              skills={resolveProfileSkillSource({
                candidate,
                cv: candidate._cv,
              })}
              variant="panel"
            />
          </ProfileSection>
        )}

        {workRows?.length > 0 ? (
          <ProfileSection title="Work History">
            {workRows.map((work, index) => (
              <WorkHistoryItem key={work.id ?? index} work={work} />
            ))}
          </ProfileSection>
        ) : (
          legacyWork?.length > 0 && (
            <ProfileSection title="Work History">
              {legacyWork.map((work, index) => (
                <WorkHistoryItem key={index} work={work} legacy />
              ))}
            </ProfileSection>
          )
        )}

        {certificateRows?.length > 0 ? (
          <ProfileSection title="Certificates">
            {certificateRows.map((cert, index) => (
              <CertificateCvItem key={cert.id ?? index} cert={cert} />
            ))}
          </ProfileSection>
        ) : (
          candidate.certifications?.length > 0 && (
            <ProfileSection title="Certifications">
              {candidate.certifications.map((cert, index) => (
                <CertificationItem key={index} certification={cert} />
              ))}
            </ProfileSection>
          )
        )}

        <ProfileSection title="Contact Info">
          <ContactInfoList candidate={candidate} />
        </ProfileSection>
      </div>

      {isPhotoViewerOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4"
          onClick={() => setIsPhotoViewerOpen(false)}
        >
          <img
            src={profilePhotoUrl(
              pickAuthorProfilePhoto({
                profile_photo:
                  candidate.profile_photo ||
                  (Array.isArray(candidate.user_bio)
                    ? candidate.user_bio[0]?.profile_photo
                    : candidate.user_bio?.profile_photo) ||
                  null,
                profilePhoto: candidate.profilePhoto || null,
                image: candidate.image || null,
              }),
            ) || "/assets/images/photo_placeholder.png"}
            alt={`${candidate.first_name || ""} ${candidate.last_name || ""} full view`}
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

const ProfileHeader = ({ candidate, onOpenPhotoViewer }) => {
  const initials = `${candidate.first_name?.[0] || ""}${
    candidate.last_name?.[0] || ""
  }`;
  const bioRow = Array.isArray(candidate.user_bio)
    ? candidate.user_bio[0]
    : candidate.user_bio;

  const photoPath = pickAuthorProfilePhoto({
    profile_photo: candidate.profile_photo ?? bioRow?.profile_photo ?? null,
    profilePhoto: candidate.profilePhoto ?? null,
    image: candidate.image ?? null,
  });

  const profileImage = profilePhotoUrl(photoPath) ?? null;

  return (
    <div>
      <div className="p-4 sm:p-8 bg-gradient-to-r from-[#1A3E32] to-[#6B8E23] rounded-lg">
        <div className="h-32"></div>
      </div>
      <div className="relative left-8 sm:left-20 bottom-15 sm:bottom-16">
        <div className="relative w-[80px] sm:w-[100px] h-[80px] sm:h-[100px]">
          <div className="rounded-full w-full h-full bg-[#6B8E23] flex items-center justify-center border-4 border-white overflow-hidden">
            {profileImage ? (
              <img 
                src={profileImage} 
                alt={`${candidate.first_name} ${candidate.last_name}`}
                className="w-full h-full object-cover cursor-zoom-in"
                onClick={onOpenPhotoViewer}
              />
            ) : (
              <span className="text-white text-3xl font-bold">{initials}</span>
            )}
          </div>
          <AvailabilityStatusDot
            availability={candidate.availability}
            className="bottom-0 right-0"
          />
        </div>
      </div>
    </div>
  );
};

const ProfileStats = ({ candidate, connectUserIdProp, onViewMainProfile }) => {
  const displayName = formatDisplayPersonName(candidate, "Candidate");
  const profile = getFormattedCandidateProfileFields(candidate);
  const connectUserId =
    resolveCandidateUserId(candidate) || connectUserIdProp || null;
  const { sendRequest, acceptRequest, connectLabel, connectDisabled, status, sending } = useCandidateConnect(
    connectUserId,
    displayName,
  );
  const isStatusLoading = Boolean(status.loading);
  const showConnectSpinner = isStatusLoading || sending;

  const handleConnectClick = async () => {
    if (isStatusLoading || sending) return;
    if (status.pendingIncoming) {
      await acceptRequest();
      return;
    }
    if (status.isCorporate) {
      // Follow / Following toggle (including unfollow)
      await sendRequest();
      return;
    }
    if (!status.isConnected && !status.pendingOutgoing && !status.loading) {
      await sendRequest();
    }
  };

  return (
  <div className="px-4 sm:px-8 mt-[-60px] sm:mt-[-40px]">
    <div className="flex gap-2 items-center">
      <p className="text-[#6B8E23] font-semibold text-[16px]">
        <DisplayNameWithBadge user={candidate} fallback={displayName} badgeSize="xs" />
      </p>
      <p className="text-[#E09A36] font-semibold text-[10px]">
        • {formatDisplayRole("jobseeker")}
      </p>
    </div>

    {profile.bio && (
      <div className="text-[12px] mt-2">
        <p className="text-[#6B8E23] whitespace-pre-wrap">{profile.bio}</p>
      </div>
    )}

    <div className="mt-4">
      {profile.title && (
        <p className="text-[#E09A36] text-[14px] font-semibold">{profile.title}</p>
      )}
      {profile.location && (
        <p className="text-[#6B8E23] text-[10px]">📍 {profile.location}</p>
      )}
      {candidate.experience_years > 0 && (
        <p className="text-[#6B8E23] text-[10px]">
          💼 {candidate.experience_years} Years Experience
        </p>
      )}
      {profile.remotePreference && (
        <p className="text-[#6B8E23] text-[10px]">🏠 {profile.remotePreference}</p>
      )}
      {candidate.salary_expectation != null && (
        <p className="text-[#6B8E23] text-[10px]">
          💰 Expected:{' '}
          {formatSalaryExpectation(
            candidate.salary_expectation,
            candidate.currency,
          ) || candidate.salary_expectation}
        </p>
      )}
    </div>

<ActionButtons
      onViewMainProfile={onViewMainProfile}
      connectLabel={connectLabel}
      connectDisabled={connectDisabled || isStatusLoading}
      loading={showConnectSpinner}
      isStatusLoading={isStatusLoading}
      handleConnectClick={handleConnectClick}
      hideConnect={Boolean(status.viewerIsCorporate)}
      settled={Boolean(
        (status.isCorporate && status.isFollowing) ||
          (!status.isCorporate &&
            (status.isConnected || status.pendingOutgoing)),
      )}
      allowWhileSettled={Boolean(status.isCorporate && status.isFollowing)}
    />
  </div>
  );
};

const ActionButtons = ({
  onViewMainProfile,
  connectLabel,
  connectDisabled,
  loading = false,
  isStatusLoading = false,
  handleConnectClick,
  hideConnect = false,
  settled = false,
  allowWhileSettled = false,
}) => (
  <div className="flex flex-col sm:flex-row sm:justify-start items-center mt-6 gap-3 w-full">
    {!hideConnect && (
    <Button
      icon="/assets/images/repeate-one.svg"
      text={connectLabel}
      onClick={handleConnectClick}
      disabled={allowWhileSettled ? isStatusLoading : connectDisabled}
      loading={loading}
      isStatusLoading={isStatusLoading}
      settled={settled}
    />
    )}
    {/* <Button icon="/assets/images/Send_Submit.svg" text="Reviews" /> */}
    <button 
      className="text-[#6B8E23] text-[12px] hover:underline"
      onClick={onViewMainProfile}
    >
      View Full Profile
    </button>
  </div>
);

const Button = ({
  icon,
  text,
  onClick,
  disabled = false,
  loading = false,
  isStatusLoading = false,
  settled = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-busy={loading}
    className={`w-full sm:w-[180px] text-center text-[12px] flex p-2 rounded-3xl gap-2 justify-center items-center transition-colors border-2 ${
      isStatusLoading
        ? "bg-[#556B1F]/80 text-white border-transparent cursor-wait"
        : settled
          ? "bg-white text-[#556B1F] border-[#556B1F] hover:bg-[#556B1F]/10"
          : disabled
            ? "bg-[#828282] text-white border-transparent cursor-not-allowed opacity-80"
            : "bg-[#556B1F] text-white border-transparent hover:bg-[#6B8E23]"
    }`}
  >
    {loading ? (
      <>
        <span
          className={`inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-t-transparent ${
            settled ? "border-[#556B1F]" : "border-white"
          }`}
          aria-hidden="true"
        />
        <span className="sr-only">Loading connection status</span>
      </>
    ) : (
      <>
        <img className="w-4 h-4" src={icon} alt="" />
        {text}
      </>
    )}
  </button>
);

const Divider = () => (
  <div className="w-full mx-auto my-6 border-t-2 border-[#6B8E23]"></div>
);

const ProfileSection = ({ title, children }) => (
  <div className="bg-[#556B1F] rounded-2xl mt-4 mb-4">
    <div className="pt-6 px-4 sm:px-8">
      <p className="text-[#E09A36] text-[18px] font-semibold mb-2">{title}</p>
    </div>
    <div className="w-full border-t-2 border-[#E0E0E0] mb-4"></div>
    {children}
  </div>
);

const EducationItem = ({ education, legacy = false }) => {
  const formatted = getFormattedEducationFields(education, { legacy });
  const period = legacy
    ? formatted.year
    : formatDateRange(
        education.start_date ?? education.startDate,
        education.end_date ?? education.endDate,
        isOngoingCvEntry(education),
      );

  return (
    <div className="px-4 sm:px-8 pb-6 text-[#F5F5F5] flex flex-col sm:flex-row justify-between gap-3 items-start">
      <div className="bg-gradient-to-br from-[#6B8E23] to-[#556B1F] w-16 h-16 rounded-lg flex items-center justify-center">
        <span className="text-white text-xl font-bold">🎓</span>
      </div>
      <div className="flex-1">
        {formatted.educationLevel && (
          <p className="text-[11px] text-[#E0E0E0] uppercase tracking-wide">
            {formatted.educationLevel}
          </p>
        )}
        {formatted.degree && (
          <p className="text-[14px] font-semibold">{formatted.degree}</p>
        )}
        {formatted.institution && (
          <p className="text-[12px]">{formatted.institution}</p>
        )}
        {formatted.field && (
          <p className="text-[11px] text-[#E0E0E0]">{formatted.field}</p>
        )}
        {formatted.location && (
          <p className="text-[11px] text-[#E0E0E0]">{formatted.location}</p>
        )}
        {period && (
          <span className="text-[#FFB54780] text-[11px]">{period}</span>
        )}
      </div>
    </div>
  );
};

const WorkHistoryItem = ({ work, legacy = false }) => {
  const formatted = getFormattedWorkHistoryFields(work, { legacy });
  const duration = legacy
    ? work.duration
    : formatDateRange(
        work.start_date ?? work.startDate,
        work.end_date ?? work.endDate,
        isOngoingCvEntry(work),
      );

  return (
    <>
      <div className="px-4 sm:px-8 pb-6 text-[#F5F5F5] flex flex-col sm:flex-row gap-4 items-start">
        <div className="bg-gradient-to-br from-[#6B8E23] to-[#556B1F] w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xl font-bold">💼</span>
        </div>
        <div className="flex-1">
          {formatted.title && (
            <p className="text-[14px] font-semibold">{formatted.title}</p>
          )}
          {formatted.company && (
            <p className="text-[13px]">{formatted.company}</p>
          )}
          {formatted.description && (
            <ResponsibilitiesList
              text={formatted.description}
              className="mt-1 space-y-1 list-disc list-outside pl-4 text-[11px] text-[#E0E0E0] break-words"
            />
          )}
          {duration && (
            <span className="text-[#FFB54780] text-[11px]">{duration}</span>
          )}
        </div>
      </div>
      <div className="w-full border-t-2 border-[#E0E0E0] mb-4"></div>
    </>
  );
};

const CertificateCvItem = ({ cert }) => {
  const name = cert.cert_name ?? cert.certName;
  const issuer = cert.issuer;
  const issueDate = formatDateToMonthYear(cert.issue_date ?? cert.issueDate);

  return (
    <>
      <div className="px-4 sm:px-8 pb-6 text-[#F5F5F5] flex flex-col sm:flex-row gap-4 items-start">
        <div className="bg-gradient-to-br from-[#E09A36] to-[#6B8E23] w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xl font-bold">🏆</span>
        </div>
        <div className="flex-1">
          {name && <p className="text-[14px] font-semibold">{name}</p>}
          {issuer && <p className="text-[13px]">{issuer}</p>}
          {issueDate && (
            <span className="text-[#FFB54780] text-[11px]">{issueDate}</span>
          )}
          <CertificateViewLink
            fileUrl={cert.file_url ?? cert.fileUrl}
            title={name}
            className="text-[11px] text-[#FFB54780] underline mt-1 inline-block text-left"
          />
        </div>
      </div>
      <div className="w-full border-t-2 border-[#E0E0E0] mb-4"></div>
    </>
  );
};

const CertificationItem = ({ certification }) => (
  <div className="px-4 sm:px-8 pb-6 text-[#F5F5F5] flex flex-col sm:flex-row gap-4 items-start">
    <div className="bg-gradient-to-br from-[#E09A36] to-[#6B8E23] w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0">
      <span className="text-white text-xl font-bold">🏆</span>
    </div>
    <div className="flex-1">
      <p className="text-[14px] font-semibold">{certification}</p>
    </div>
  </div>
);

const CONTACT_ICONS = {
  Phone: FaPhone,
  Address: FaMapMarkerAlt,
  Email: FaEnvelope,
  LinkedIn: FaLinkedin,
  GitHub: FaGithub,
  Portfolio: FaGlobe,
};

const ContactInfoList = ({ candidate }) => {
  const bioRow = Array.isArray(candidate?.user_bio)
    ? candidate.user_bio[0]
    : candidate?.user_bio;
  const contacts = buildContactInfoItems({ candidate, bio: bioRow });

  return (
    <div className="px-4 sm:px-8 pb-6 text-[#FFFFFF] space-y-3.5">
      {contacts.map((contact) => {
        const Icon = CONTACT_ICONS[contact.type] || FaGlobe;
        const href = contact.href
          ? contact.value.startsWith("http")
            ? contact.value
            : `https://${contact.value}`
          : null;

        return (
          <div key={contact.type} className="flex gap-3 items-center min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
              <Icon className="text-base text-[#9AE6B0]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-[#E0E0E0] uppercase tracking-wider">
                {contact.type}
              </p>
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] font-semibold text-[#9AE6B0] hover:text-white hover:underline truncate max-w-full inline-flex items-center gap-1.5 mt-0.5"
                >
                  <span className="truncate">{contact.value}</span>
                  <FaExternalLinkAlt className="text-[10px] shrink-0 opacity-70" />
                </a>
              ) : (
                <p className="text-[13px] font-semibold break-words leading-relaxed mt-0.5">
                  {contact.value}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserProfilePanel;

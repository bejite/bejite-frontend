import ProfileCvSections from '../../ProfileCvSections';
import ContactInfoSection from '../../ContactInfoSection';
import AdminUserJobPreferences from '../AdminUserJobPreferences';
import { buildBaseAccountItems } from './profilePanelUtils';
import { AboutSection, AccountDetailsSection } from './ProfilePanelShared';

export default function JobseekerProfilePanel({
  user,
  profileUser,
  profileFields,
  cvData,
  candidate,
  isVerified,
}) {
  const accountItems = buildBaseAccountItems({
    user,
    profileUser,
    profileFields,
    isVerified,
    omitLabels: ['Company'],
  });

  return (
    <>
      <AccountDetailsSection items={accountItems} />
      <AboutSection bio={profileFields.bio} />
      <ProfileCvSections
        cv={cvData}
        candidate={candidate ?? profileUser}
        showCertificates
      />
      <AdminUserJobPreferences candidate={candidate} profileUser={profileUser} />
      <ContactInfoSection
        candidate={{ ...candidate, ...profileUser, email: user.email }}
        bio={cvData?.bio}
      />
    </>
  );
}

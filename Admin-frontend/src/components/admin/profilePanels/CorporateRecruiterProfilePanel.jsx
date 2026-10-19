import {
  buildBaseAccountItems,
  buildOnlinePresenceItems,
} from './profilePanelUtils';
import {
  AboutSection,
  AccountDetailsSection,
  OnlinePresenceSection,
  VerificationDocumentsSection,
} from './ProfilePanelShared';
import RecruiterBadgeReviewSection from './RecruiterBadgeReviewSection';

export default function CorporateRecruiterProfilePanel({
  user,
  profileUser,
  profileFields,
  isVerified,
  onBadgeReviewed,
}) {
  const accountItems = buildBaseAccountItems({
    user,
    profileUser,
    profileFields,
    isVerified,
    extraItems: [{ label: 'Employer type', value: 'Corporate' }],
  });

  const onlinePresenceItems = buildOnlinePresenceItems(profileUser);

  return (
    <>
      <AccountDetailsSection items={accountItems} />
      <AboutSection bio={profileFields.bio ?? profileUser?.summary} />
      <OnlinePresenceSection items={onlinePresenceItems} />
      <VerificationDocumentsSection
        userId={user.id}
        profileUser={profileUser}
        documentTypeLabel={
          profileUser?.id_type || 'Company registration (CAC)'
        }
        documentTitle="Company registration document"
        viewLinkLabel="View uploaded company document"
        emptyDocumentLabel="No company registration document uploaded."
      />
      <RecruiterBadgeReviewSection
        userId={user.id}
        profileUser={profileUser}
        onReviewed={onBadgeReviewed}
      />
    </>
  );
}

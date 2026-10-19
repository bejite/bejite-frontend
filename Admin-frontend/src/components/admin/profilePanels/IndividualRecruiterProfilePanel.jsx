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

export default function IndividualRecruiterProfilePanel({
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
    extraItems: [{ label: 'Employer type', value: 'Individual' }],
    omitLabels: ['Company'],
  });

  const onlinePresenceItems = buildOnlinePresenceItems(profileUser);
  const idType = profileUser?.id_type;

  return (
    <>
      <AccountDetailsSection items={accountItems} />
      <AboutSection bio={profileFields.bio ?? profileUser?.summary} />
      <OnlinePresenceSection items={onlinePresenceItems} />
      <VerificationDocumentsSection
        userId={user.id}
        profileUser={profileUser}
        documentTypeLabel={idType || 'Not provided'}
        documentTitle={idType ? `Government ID — ${idType}` : 'Government ID'}
        viewLinkLabel="View uploaded ID document"
        emptyDocumentLabel="No government ID uploaded."
      />
      <RecruiterBadgeReviewSection
        userId={user.id}
        profileUser={profileUser}
        onReviewed={onBadgeReviewed}
      />
    </>
  );
}

import JobseekerProfilePanel from './JobseekerProfilePanel';
import CorporateRecruiterProfilePanel from './CorporateRecruiterProfilePanel';
import IndividualRecruiterProfilePanel from './IndividualRecruiterProfilePanel';
import { PROFILE_PANEL_TYPES, buildBaseAccountItems } from './profilePanelUtils';
import { AccountDetailsSection } from './ProfilePanelShared';

const PANEL_COMPONENTS = {
  [PROFILE_PANEL_TYPES.JOBSEEKER]: JobseekerProfilePanel,
  [PROFILE_PANEL_TYPES.CORPORATE]: CorporateRecruiterProfilePanel,
  [PROFILE_PANEL_TYPES.INDIVIDUAL]: IndividualRecruiterProfilePanel,
};

export default function AdminProfilePanelRouter({
  panelType,
  user,
  profileUser,
  profileFields,
  cvData,
  candidate,
  isVerified,
  onBadgeReviewed,
}) {
  const Panel = PANEL_COMPONENTS[panelType];

  if (!Panel) {
    const accountItems = buildBaseAccountItems({
      user,
      profileUser,
      profileFields,
      isVerified,
    });
    return <AccountDetailsSection items={accountItems} />;
  }

  return (
    <Panel
      user={user}
      profileUser={profileUser}
      profileFields={profileFields}
      cvData={cvData}
      candidate={candidate}
      isVerified={isVerified}
      onBadgeReviewed={onBadgeReviewed}
    />
  );
}

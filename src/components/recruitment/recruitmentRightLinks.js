import { isRecruiterAccount } from "../../services/accountDelegationService";

export const RECRUITMENT_RIGHT_LINKS = [
  {
    label: "Saved Posts",
    icon: "/assets/images/setting.png",
    mobileIcon: "/assets/images/saved-posts-nav.svg",
    path: "/news-feed?feed=saved",
  },
  {
    label: "Activity Log",
    icon: "/assets/images/task-square.svg",
    mobileIcon: "/assets/images/activity-log-nav.svg",
    path: "/activity-logs",
    tourId: "activity-log",
  },
  {
    label: "Badge Status",
    icon: "/assets/images/award.svg",
    mobileIcon: "/assets/images/badge-nav.svg",
    path: "/badge",
    tourId: "badge-status",
  },
  {
    label: "Account Settings",
    icon: "/assets/images/setting-2.svg",
    mobileIcon: "/assets/images/account-settings-nav.svg",
    path: "/account-settings",
  },
  {
    label: "Help",
    icon: "/assets/images/repeate-one.svg",
    mobileIcon: "/assets/images/help-nav.svg",
    secondaryIcon: "/assets/images/questiontag.svg",
    path: "/help",
  },
];

// export const JOBSEEKER_ELEARNING_RIGHT_LINK = {
//   label: "E-Learning",
//   icon: "/assets/images/elearning-sidebar.svg",
//   mobileIcon: "/assets/images/elearning-nav.svg",
//   path: "/e-learning/jobseeker",
//   tourId: "e-learning",
// };

// export const RECRUITER_ELEARNING_RIGHT_LINK = {
//   label: "E-Learning",
//   icon: "/assets/images/elearning-sidebar.svg",
//   mobileIcon: "/assets/images/elearning-nav.svg",
//   path: "/e-learning/partner",
//   tourId: "recruiter-e-learning",
// };

export function getRecruitmentRightLinks(user) {
  if (isRecruiterAccount(user)) {
    return [...RECRUITMENT_RIGHT_LINKS];
  }
  return [...RECRUITMENT_RIGHT_LINKS];
}

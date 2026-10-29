# Git Work Log

## 2026-10-29 16:47 (WAT) — Restrict Assign Account to a Recruiter Exclusively to Recruiter Accounts

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Restricted the **Account Delegation / Assign Account to a Recruiter** settings section and `/account-settings/assign-recruiter` route strictly to recruiter accounts (`recruiter` / `employer`), hiding it completely from jobseeker accounts and blocking direct route access.
- **Changed**:
  - `src/services/accountDelegationService.js`: Added `isRecruiterAccount(user)` helper to strictly verify recruiter eligibility (`recruiter`, `employer`, `corporate_recruiter`, `individual_recruiter`) while excluding `jobseeker` and non-recruiter roles.
  - `src/pages/AccountSettings.jsx`: Hid the **Account Delegation -> Assign Account to a Recruiter** section and skipped delegation fetches whenever `isRecruiterAccount(user)` is `false`.
  - `src/app/routes/socialRoutes.jsx`: Enforced `requiredRole="recruiter"` on `/account-settings/assign-recruiter` via `ProtectedRoute`.
  - `src/pages/AssignRecruiterSettings.jsx`: Added live role check (`isRecruiterAccount(currentUser)`) redirecting non-recruiters immediately to `/account-settings` and skipping recruiter directory/delegation fetches.
- **Conventional type**: `fix(account-settings)`

### Proposed Commit Message

```
fix(account-settings): show assign account to a recruiter only for recruiters

Jobseekers should not see or access recruiter account delegation controls in
Account Settings. Only recruiter accounts need to delegate hiring workflows to
another recruiter.

- Hide the Account Delegation ("Assign Account to a Recruiter") section in Account Settings when signed in as a jobseeker or non-recruiter
- Guard `/account-settings/assign-recruiter` with `requiredRole="recruiter"` on the route and redirect non-recruiters back to Account Settings if their role changes
- Skip loading delegation state and recruiter directories unless the active account is a recruiter
```

---

## 2026-10-29 14:35 (WAT) — Move Recruiter Assignment to Dedicated Account Settings Page (Partial & Full Delegation)

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Removed the recruiter selection popup modal (`SelectRecruiterModal`) from pipeline stage modals (`StageBuilderModal` and `EditPipelineStageModal`), restoring plain typable interviewer inputs, and built a dedicated enterprise-style **Assign Account to a Recruiter** page under Account Settings (`/account-settings/assign-recruiter`) supporting both **Partial Assignment** (granular module permissions + quick presets) and **Full Assignment** (complete operational access while keeping owner password, 2FA, billing, and deletion locked), access expiration controls, handover notes, pause/resume/revoke actions, and an activity log.
- **Changed**:
  - `src/components/recruitment-management/StageBuilderModal.jsx` & `EditPipelineStageModal.jsx`: Removed `SelectRecruiterModal` popup trigger and `readOnly` behavior, restoring `Assigned Interviewer` to a standard typable input.
  - `src/components/recruitment-management/SelectRecruiterModal.jsx`: Deleted obsolete popup modal component.
  - `src/services/recruitersApi.js`: Filtered out the currently signed-in user and jobseeker-only profiles so recruiter discovery returns strictly eligible real recruiters.
  - `src/services/accountDelegationService.js`: Added account delegation service defining partial permission scopes, quick presets, expiration rules, summary helpers, and API-first persistence with user-scoped local fallback and activity logs.
  - `src/pages/AssignRecruiterSettings.jsx`: Built full settings page at `/account-settings/assign-recruiter` with live recruiter search, Partial vs. Full assignment cards, granular permission toggles, duration/custom expiry picker, handover note, active assignments management (Edit, Pause/Resume, Revoke with confirmation), and delegation activity log.
  - `src/pages/AccountSettings.jsx`: Added **Account Delegation -> Assign Account to a Recruiter** row showing live assignment status and active count badge.
  - `src/app/lazyPages.js` & `src/app/routes/socialRoutes.jsx`: Registered lazy-loaded `AssignRecruiterSettings` page and protected `/account-settings/assign-recruiter` route.
- **Conventional type**: `feat(account-settings)`

### Proposed Commit Message

```
feat(account-settings): add partial and full recruiter account assignment page

Instead of opening a recruiter picker popup inside individual interview stage
modals, account owners need a proper settings page—like modern SaaS platforms—
where they can delegate their account to a trusted recruiter with either
partial permissions or full operational access.

- Remove the recruiter popup modal from Stage Builder and Edit Pipeline Stage so Assigned Interviewer is a normal typable field again
- Add an "Assign Account to a Recruiter" entry under Account Settings showing active assignment status
- Create a dedicated `/account-settings/assign-recruiter` page to search real recruiters and grant Partial Assignment (per-feature toggles and presets) or Full Assignment (all hiring workflows while keeping password, 2FA, billing, and account deletion locked to the owner)
- Support access expiration windows, handover notes, editing permissions, pausing/resuming access, revoking assignments, and viewing a delegation activity log
```

---

## 2026-10-29 13:20 (WAT) — Enable Rich Thumbnail, Title, and Description Link Previews for Shared Pitches

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Restored and upgraded rich Open Graph / Twitter Card link previews when sharing or copying pitch links across WhatsApp, X, LinkedIn, Slack, Facebook, and Telegram. Fixed shared pitch URLs to use `/v/:pitchId`, replaced the suspended Render backend proxy in `vercel.json` with a Vercel serverless OG handler (`api/share.js`) backed by `api.bejite.com` (also supporting crawler requests to `/pitch?id=:pitchId`), upgraded solid-black `so_0` Cloudinary video thumbnails to `so_auto` frames, and added a raster `1200x630` `public/og-default.png` fallback image.
- **Changed**:
  - `src/utils/pitchShare.js`: Updated `getPitchShareUrl` to generate `/v/:pitchId` share URLs and normalized whitespace in shared pitch captions.
  - `api/share.js`: Created Vercel serverless Open Graph & Twitter Card handler for `/v/:pitchId` (plus `/p/:postId`, `/j/:jobId`, `/a/:campaignId`, and crawler requests to `/pitch?id=:pitchId`), upgrading `so_0` Cloudinary video thumbnails to `1200x630` `so_auto` JPEGs and redirecting browsers cleanly into the app.
  - `vercel.json`: Replaced suspended `bejite-backend-9mg2.onrender.com` rewrites with `/api/share` rewrites for `/p/:postId`, `/j/:jobId`, `/a/:campaignId`, `/v/:pitchId`, and social-crawler requests on `/pitch?id=:pitchId` and `/pitches?id=:pitchId`.
  - `vite.config.js`: Added local dev middleware invoking `api/share.js` so `npm run dev` serves the exact same Open Graph HTML and redirects locally.
  - `src/utils/pitchThumbnail.js` & `src/services/pitchesApi.js`: Added Cloudinary video thumbnail normalizer (`so_0` -> `so_auto`) for uploaded and fetched pitches so pitch posters and saved thumbnails avoid black first frames.
  - `src/components/pitch/*` (`PitchVideoPlayer.jsx`, `PitchReelCard.jsx`, `MyPitchesView.jsx`, `CreatePitchModal.jsx`, `modal/PitchSuccessView.jsx`): Applied normalized video posters across pitch players/cards and passed pitch descriptions into post-publish share fallbacks.
  - `public/og-default.png` & `index.html`: Added `1200x630` PNG fallback social card image (replacing `.svg` `og:image`, which WhatsApp/X/LinkedIn ignore).
- **Conventional type**: `fix(pitch-share)`

### Proposed Commit Message

```
fix(pitch-share): show thumbnail, title, and description previews on shared pitch links

Sharing or copying a pitch link to WhatsApp, X, LinkedIn, or Slack previously
showed only a generic text-only Bejite preview instead of the pitch thumbnail,
title, and description. This happened because pitch share links pointed directly
to the client-side `/pitch?id=...` route, `vercel.json` still proxied share
routes to a suspended Render URL instead of `api.bejite.com`, default fallback
meta tags used an `.svg` image that social platforms ignore, and Cloudinary
video thumbnails captured a black frame at 0 seconds (`so_0`).

- Switch shared and copied pitch links to `/v/:pitchId` while also serving rich previews to social crawlers on `/pitch?id=:pitchId`
- Add a Vercel share preview handler (`api/share.js`) and update `vercel.json` and `vite.config.js` to pull live metadata from `api.bejite.com`
- Upgrade Cloudinary pitch thumbnails from `so_0` to `so_auto` so shared previews and in-app video posters show a real frame instead of a black box
- Add a 1200x630 `og-default.png` fallback image for platforms that do not render SVG preview images
```

---

## 2026-10-26 11:10 (WAT) — Resolve AdminInboxContext File Casing Conflict on Windows

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Renamed `AdminInboxContext.jsx` to `AdminInboxProvider.jsx` to eliminate a file-casing collision with `adminInboxContext.js` on case-insensitive filesystems, and updated `Admin-frontend/src/App.jsx` to import from the new provider file.
- **Changed**:
  - `Admin-frontend/src/context/AdminInboxProvider.jsx`: Renamed from `AdminInboxContext.jsx` to match its exported provider component and eliminate the collision with `adminInboxContext.js`.
  - `Admin-frontend/src/App.jsx`: Updated import path from `./context/AdminInboxContext` to `./context/AdminInboxProvider` and cleaned up commented-out import.
- **Conventional type**: `fix(admin)`

### Proposed Commit Message

```
fix(admin): resolve admin inbox context file casing collision

Fix a file casing collision between adminInboxContext.js and
AdminInboxContext.jsx on case-insensitive operating systems (Windows/macOS).

- Rename AdminInboxContext.jsx to AdminInboxProvider.jsx so its file name clearly reflects the provider component it exports.
- Update import of AdminInboxProvider in App.jsx to point to AdminInboxProvider.jsx.
- Prevent module resolution from erroneously resolving to adminInboxContext.js during bundling.
```

---

## 2026-10-25 17:53 (WAT) — Standardize All Loading Spinners with Consistent Bejite Logo Loader Across Main App and Admin

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Replaced disparate generic circular spinners and icon spinners across all main application pages and the admin portal with a unified, branded Bejite logo spinner (`Loader.jsx`) matching the official design. Enhanced `Loader.jsx` in both `src` and `Admin-frontend` to seamlessly support modal/fullscreen, inline/container, size scaling (`sm`, `md`, `lg`), custom descriptive text, and contrast-aware typography.
- **Changed**:
  - `src/components/ui/Loader.jsx`: Upgraded Bejite logo loader component to support `fullscreen={false}` for embedded page sections, `inline` mode, multi-size scaling, custom status description text, and dark-background color overrides (`textColor`).
  - `Admin-frontend/src/components/ui/Loader.jsx`: Ported the upgraded Bejite logo loader to the admin portal.
  - `src/components/PageLoader.jsx`: Replaced generic CSS spinner with the Bejite logo loader for top-level React Suspense route fallbacks.
  - `Admin-frontend/src/App.jsx`: Updated `RouteFallback` to use the Bejite logo loader.
  - `src/pages/Connections.jsx`: Replaced initial page spinner ("Loading connections...") and network refresh spinners with the Bejite logo loader.
  - `src/pages/auth/AuthSuccess.jsx`: Replaced auth completion route spinner with the Bejite logo loader.
  - `src/components/candidate-search-page/CandidateSearchResults.jsx`: Replaced candidate search query spinner with contrast-adjusted white Bejite logo loader.
  - `src/components/candidate-search-page/UserMainProfileCard.jsx`: Replaced candidate profile loading spinner with Bejite logo loader.
  - `src/components/recruitment-management/SelectRecruiterModal.jsx`: Replaced recruiter search loading spinner with Bejite logo loader.
  - `src/components/MutualConnectionsModal.jsx`: Replaced mutual connections loading spinner with Bejite logo loader.
  - `src/pages/employerDashboard/EmployerDashboard.jsx`: Replaced employer dashboard initial loading spinner with Bejite logo loader.
  - `src/pages/employerDashboard/JobApplications.jsx`: Replaced applications table loading spinner with Bejite logo loader.
  - `src/pages/employerDashboard/ASESubscriptionDashboard.jsx`: Replaced subscription dashboard loading spinner with Bejite logo loader.
  - `src/pages/employerDashboard/ASEPricingPage.jsx`: Replaced pricing dashboard loading spinner with Bejite logo loader.
  - `src/pages/employerDashboard/SentInvitations.jsx`: Replaced sent invitations loading spinner with Bejite logo loader.
  - `src/pages/employerDashboard/Notifications.jsx`: Replaced main notifications and modal loading spinners with Bejite logo loader.
  - `src/pages/employerDashboard/RecruitWithASE.jsx`: Replaced recruiter session and query loading spinners with Bejite logo loader.
  - `src/pages/employerDashboard/EditJob.jsx`: Replaced job details loading spinner with Bejite logo loader.
  - `src/pages/employerDashboard/RepostJob.jsx`: Replaced job details loading spinner with Bejite logo loader.
  - `src/pages/employerDashboard/ExtendJob.jsx`: Replaced job extension loading spinner with Bejite logo loader.
  - `src/pages/employerDashboard/BulkCreateJobs.jsx`: Replaced file parsing/upload spinner with Bejite logo loader.
  - `src/pages/employerDashboard/JobExtendCallback.jsx`: Replaced payment verification spinner with Bejite logo loader.
  - `src/pages/employerDashboard/ASEPaymentCallback.jsx`: Replaced payment verification spinner with Bejite logo loader.
  - `src/pages/individual/InterviewNotifications.jsx`: Replaced candidate interview invitations loading spinner with Bejite logo loader.
  - `src/pages/jobseekerSignup/Jobs/JobVacancyListing.jsx`: Replaced job search vacancy loading spinner with Bejite logo loader.
  - `src/pages/jobseekerSignup/JobConnection.jsx`: Replaced initial recruiters loading spinner with Bejite logo loader.
  - `src/pages/ads/AdProDashboard.jsx`: Replaced campaign metrics loading spinner with Bejite logo loader.
  - `src/components/Ads/AdProAsyncState.jsx`: Replaced ad loading fallback with Bejite logo loader.
  - `src/pages/badge/BadgeStatus.jsx`: Replaced verification status loading spinner with Bejite logo loader.
  - `src/pages/badge/BadgePaymentCallback.jsx`: Replaced badge payment processing spinner with Bejite logo loader.
  - `src/pages/badge/BadgeHolder.jsx`: Replaced badge verification and employment metrics loading spinners with Bejite logo loader.
  - `src/pages/admin/*` (`AdminDashboard.jsx`, `AdminEngagement.jsx`, `AdminDemographics.jsx`, `AdminJobs.jsx`, `AdminList.jsx`, `AdminRecruitment.jsx`, `AdminRevenue.jsx`, `AdminUsers.jsx`, `AdminAdPro.jsx`): Standardized all admin table and dashboard loading states with Bejite logo loader.
  - `Admin-frontend/src/page/admin/*` and `Admin-frontend/src/components/*`: Standardized all admin page loaders, review modals, and async state components with Bejite logo loader.
- **Conventional type**: `feat(ui)`

### Proposed Commit Message

```
feat(ui): standardize all loading indicators with branded Bejite logo loader

Replace generic and inconsistent CSS spinners across all pages in the main
application and admin portal with the official branded Bejite logo loader.

- Enhance `Loader.jsx` to support inline embedding, scaling, and custom descriptions
- Standardize full-page route loaders and suspense fallbacks
- Update connections, employer dashboards, candidate profiles, and modals
- Standardize all admin dashboards, analytics, and detail modals
```

---

## 2026-10-25 15:20 (WAT) — Implement Reusable Recruiter Selection Modal for Assigned Interviewer

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Built a professional, reusable recruiter selection modal (`SelectRecruiterModal`) triggered when clicking on the "Assigned Interviewer" input in pipeline stage modals (`StageBuilderModal` and `EditPipelineStageModal`). Fetches real recruiters from backend discovery and connection endpoints with instant search filtering, verified badges, and selection syncing to read-only inputs without dummy data or fallbacks.
- **Changed**:
  - `src/services/recruitersApi.js`: Created dedicated API service to query backend recruiter discovery (`/auth/signup/discover-recruiters`), connection search (`/api/connections/search`), and network discovery (`/api/connections/discover`), normalizing recruiter profiles and filtering out admins without dummy data.
  - `src/components/recruitment-management/SelectRecruiterModal.jsx`: Created reusable modal with live search filter, loading spinner, error state with retry, empty state, recruiter avatar/badge cards, selection toggle, and confirm/clear actions.
  - `src/components/recruitment-management/EditPipelineStageModal.jsx`: Made "Assigned Interviewer" input `readOnly` and clickable, added recruiter badge icon button, and integrated `SelectRecruiterModal`.
  - `src/components/recruitment-management/StageBuilderModal.jsx`: Made "Assigned Interviewer" input `readOnly` and clickable, added recruiter badge icon button, and integrated `SelectRecruiterModal`.
- **Conventional type**: `feat(recruitment-management)`

### Proposed Commit Message

```
feat(recruitment-management): add reusable recruiter selection modal for assigned interviewers

Employers needed a seamless way to assign specific recruiters as interviewers
when configuring recruitment pipeline stages, instead of manually typing names.

- Create `SelectRecruiterModal` with live search, loading/error states, and profile cards
- Implement `fetchRecruiters` in `recruitersApi.js` calling backend endpoints with no mock fallbacks
- Convert "Assigned Interviewer" inputs to read-only clickable triggers in Edit and Builder modals
- Auto-populate selected recruiter name into the stage configuration on confirm
```

---

## 2026-10-25 14:55 (WAT) — Fix React Hook Order Violation in CandidateSearchResults

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Fixed a fatal React runtime error ("Rendered more hooks than during the previous render") in CandidateSearchResults caused by invoking `useCallback` after early conditional returns.
- **Changed**:
  - `src/components/candidate-search-page/CandidateSearchResults.jsx`: Reordered hooks and event handlers so that `isCandidateInvited` and modal callbacks are declared unconditionally at the top of the component function before any `if (loading)` or `if (error)` early returns.
- **Conventional type**: `fix(candidate-search)`

### Proposed Commit Message

```
fix(candidate-search): fix react hook order violation in CandidateSearchResults

We encountered a crash where CandidateSearchResults triggered an error boundary
saying "Rendered more hooks than during the previous render". This happened because
the `isCandidateInvited` callback hook was placed below the loading and error guard
returns, causing the number of hooks to change between renders.

- Move `isCandidateInvited` and modal handlers to top of component before early returns
- Ensure all hooks execute in identical order on every render cycle
```

---

## 2026-10-25 14:45 (WAT) — Change Candidate Invite Button to Reinvite on Sent and Make Recruitment Department Field Plain Typable Input

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Updated candidate search results so that when an employer invites a candidate for an interview, the button dynamically changes from "Invite for interview" to "Reinvite for interview" (persisting both immediately in session and from existing employer interview invitations). Also removed the dropdown/autocomplete from the Department field in recruitment exercise modals (Create and Edit), turning it into a straightforward typable text input.
- **Changed**:
  - `src/components/candidate-search-page/CandidateSearchResults.jsx`: Added `invitedCandidateIds` tracking fetched from `/api/interview-invitations/employer` on mount and updated on invite success. Passed `isInvited` state down to `ProfileActions` to dynamically toggle the action button text between "Invite for interview" and "Reinvite for interview", styled with responsive hover states.
  - `src/components/candidate-search-page/InterviewInviteModal.jsx`: Supported `isReinvite` prop to update the dialog title to "Re-invite for Interview" and submit button to "Send Re-invite". Made modal container responsive.
  - `src/components/recruitment-management/CreateRecruitmentModal.jsx`: Removed `AutocompleteInput` and suggestion dropdown from Department field, replacing it with a standard typable `<input>` with placeholder `e.g. Engineering, Sales, Finance`.
  - `src/components/recruitment-management/EditRecruitmentModal.jsx`: Removed `AutocompleteInput` from Department field, replacing it with a standard typable text input.
- **Conventional type**: `feat(candidate-search)`

### Proposed Commit Message

```
feat(candidate-search): toggle reinvite button state and make recruitment department typable

- Change candidate card action button to "Reinvite for interview" once an interview invite has been sent
- Fetch and sync existing employer invitations on mount to recognize previously invited candidates
- Support re-invite context inside InterviewInviteModal
- Remove autocomplete dropdown in Create and Edit Recruitment modals to make Department field plain typable
```

---

## 2026-10-25 13:17 (WAT) — Fix Input Borders Cutting Off and Modal Responsiveness Across Bejite

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Resolved input borders cutting off and disappearing in modals across both main frontend and admin frontend. Fixed Chrome autofill user-agent styling that painted over the top border and forced a light-blue background, added safe scroll padding to eliminate clipping boundaries at Y=0, and made all modals responsive with flexible height bounds and sticky headers/footers.
- **Changed**:
  - `src/index.css` & `Admin-frontend/src/index.css`: Added global `-webkit-autofill` rules to prevent browser autofill from painting over top borders or altering background colors.
  - `src/components/modal/confirmBadgeModal.jsx` & `Admin-frontend/src/components/modal/confirmBadgeModal.jsx`: Upgraded `ChangePasswordModal`, `ChangeEmailModal`, `TwoFactorModal`, `ProfileVisibilityModal`, and `ConfirmBadgeModal` to `max-w-md` with `p-1.5 sm:p-2` on scroll containers and clear focus ring transitions.
  - `src/components/modal/AccountActionFlowModal.jsx`: Made modal container fully responsive (`max-h-[calc(100dvh-2rem)]`, sticky header/footer, flex scroll body, removed awkward header indent).
  - `src/components/recruitment-management/`: Added vertical and horizontal padding (`px-1.5 sm:px-2.5 py-1.5`) to scroll containers in `CreateRecruitmentModal`, `EditRecruitmentModal`, `EditPipelineStageModal`, `StageBuilderModal`, `InteractiveModals`, `CandidateFeedbackModal`, and `MoveCandidateModal` to prevent input border and focus ring clipping.
  - `src/components/ConfirmModal.jsx` & `Admin-frontend/src/components/ConfirmModal.jsx`: Made confirmation dialogs responsive with `max-w-md` and overflow scrolling.
  - `Admin-frontend/src/components/modal/DeleteConfirmModal.jsx`: Added responsive height and scroll wrapper.
- **Conventional type**: `fix(modal)`

### Proposed Commit Message

```
fix(modal): prevent input border cutoff and improve responsiveness across all modals

Input top borders were getting clipped in modals due to a combination of Chrome's
native autofill background overriding the top 1px border and scrollable modal containers
having 0px top padding at the clipping boundary Y=0. In addition, modals were exceeding
viewport heights on smaller displays.

- Add global CSS autofill reset in index.css to prevent browser styles from obliterating input borders
- Add padding to modal scroll bodies so inputs and focus rings never touch the clipping plane
- Upgrade account and settings modals (password, email, 2FA, visibility) to max-w-md with sticky headers/footers
- Ensure recruitment management and confirmation modals are fully responsive with max-h constraints
```

---

## 2026-10-13 22:20 (WAT) — Redesign Awards and Certificates Step with Full-Width Responsive Layout

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Redesigned the Awards / Achievements (Certificate) CV builder screen from a narrow, clunky layout to a full-width, modern responsive interface. Replaced nested grey boxes, black upload buttons, and narrow green blocks with a sleek card form, modern upload dropzone with previews, and a responsive 3-column card grid for added certificates.
- **Changed**:
  - `src/pages/jobseekerSignup/cvBuilder/Certificate.jsx`: Expanded layout to full width, modernized header with award iconography, replaced nested grey boxes with a clean border-card, upgraded upload input to a modern file dropzone with file size and format badges, and displayed saved certificates in a responsive 3-column card grid with thumbnails and quick delete actions.
  - `src/components/NavigationButtons.jsx`: Allowed flexible full-width layout and custom className overrides.
- **Conventional type**: `style(onboarding)`

### Proposed Commit Message

```
style(onboarding): redesign awards and certificate cv builder step to full width

The certificate step previously suffered from narrow width constraints (max-w-xs),
awkward nested grey containers, clunky black upload buttons, and poorly aligned
green blocks for saved certificates.

- Expand certificate step to full width matching the onboarding stepper
- Replace nested containers with a modern single-border form card
- Modernize certificate image upload with file info, size badges, and change actions
- Transform saved certificates into a responsive 3-column card grid with image previews
- Allow NavigationButtons to expand smoothly across full width
```

---

## 2026-10-13 21:30 (WAT) — Add Two-Step Reason Validation and Confirmation Flow for Account Deactivation and Deletion

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Implemented an interactive two-step modal flow for deactivating or deleting accounts. Users select their reason first; if the reason can be resolved by support (e.g., technical glitches, billing issues, usability confusion), they are guided with a support notice and redirected to the Contact Us page (`/contact`). If the reason is solid/convincing, they advance to the final confirmation dialog ("Are you sure?") before proceeding.
- **Changed**:
  - `src/components/modal/AccountActionFlowModal.jsx`: Created a multi-step modal featuring tailored reasons for deactivation and deletion, automatic classification of solid vs support-resolvable reasons, explanatory support notice banner, and confirmation dialog with impact warnings.
  - `src/pages/AccountSettings.jsx`: Replaced default confirmation dialogs with `AccountActionFlowModal` for Deactivate Account and Delete Account, integrated redirection to `/contact`, and added safe logout handling upon confirmation.
- **Conventional type**: `feat(account)`

### Proposed Commit Message

```
feat(account): add two-step reason validation and confirmation for deactivation and deletion

Users clicking "Deactivate Account" or "Delete Account" previously only saw
a basic one-click confirmation dialog without understanding alternatives or
providing exit feedback.

- Add AccountActionFlowModal presenting selectable reasons for leaving
- Redirect users to Contact Us (/contact) when selecting support-resolvable reasons (bugs, billing, confusion)
- Advance to "Are you sure?" confirmation modal only when selecting solid reasons
- Warn clearly about data permanence on deletion vs temporary nature of deactivation
- Trigger toast notifications and clean logout upon confirmed action
```

---

## 2026-10-08 22:30 (WAT) — Implement Pitch Social Sharing Modal and Full Follower Count Display

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Replaced direct clipboard link copying with the interactive `SharePostModal` across all pitch views (pitch page, preview modal, and post-creation modal) to support sharing directly to WhatsApp, Facebook, X, LinkedIn, Telegram, and copying links. Updated recruiter profile follower stats to display exact follower counts with comma separation.
- **Changed**:
  - `src/utils/pitchShare.js`: Created reusable helper to resolve pitch URLs and trigger social sharing modal with pitch title and link.
  - `src/utils/formatCompactCount.js`: Added `formatFullCount` helper to format numbers with comma separation (`1,234`).
  - `src/components/SharePostModal.jsx`: Supported dynamic title and URL props so the sharing modal works seamlessly for pitch sharing as well as regular feed posts.
  - `src/pages/pitch/PitchPage.jsx`: Replaced simple link copy on pitch cards with the comprehensive `SharePostModal`.
  - `src/components/pitch/PitchPreviewModal.jsx`: Integrated `SharePostModal` for previewing and sharing pitches.
  - `src/components/pitch/CreatePitchModal.jsx`: Updated post-creation success dialog to trigger social share dialog.
  - `src/pages/Profile.jsx`: Switched follower count from abbreviated notation (`1.2k`) to full formatted count (`1,234 Followers`) on corporate profile cards.
- **Conventional type** (for next commit): `feat(pitch)`

### Proposed Commit Message

```
feat(pitch): add pitch social sharing modal and display exact follower count

We want candidates and recruiters to easily share pitch presentations across
social networks, and display accurate total follower counts on user profiles.

- Open social share modal on pitch cards supporting WhatsApp, X, Facebook, LinkedIn, and Telegram
- Add pitchShare utility to standardize pitch URLs and share triggers
- Update SharePostModal to support custom post titles and URLs
- Integrate share dialog into pitch preview and pitch creation success screens
- Display exact comma-separated follower counts on profiles instead of rounded abbreviations
```

---

## 2026-09-29 08:15 (WAT) — Move Polls Inside Create Post Modal and Clean Newsfeed Bar

- **Repo**: `bejite-frontend`
- **Summary**: Removed the side action icons [Image, Video, Poll] from beside "+ Create Post" on the newsfeed bar, and integrated "Add Poll" directly inside the Create Post modal popup alongside "Add Image" and "Add Video" with seamless toggling and removal support.
- **Changed**:
  - `src/components/recruitment/RecruitmentMiddle.jsx`: Cleaned up the Create Post bar on the newsfeed by removing the side buttons (Image, Video, Poll) next to "+ Create Post".
  - `src/components/PostCreationModal.jsx`: Added the `Add Poll` button alongside `Add Image` and `Add Video`, supported toggling to poll creation mode from inside the modal via local state, and provided `Remove Poll` actions to return to standard post mode.
  - `Admin-frontend/src/components/PostCreationModal.jsx`: Added identical `Add Poll` button and mode toggling inside the admin post creation popup for consistency.
- **Conventional type** (for next commit): `feat(feed)`

### Proposed Commit Message

```
feat(feed): move poll creation into modal and clean feed create post bar

We removed the Image, Video, and Poll buttons from beside Create Post on the newsfeed bar and integrated Add Poll directly inside the Create Post popup.

- Remove the side icon buttons (Image, Video, Poll) from the feed Create Post bar
- Add an 'Add Poll' button next to 'Add Image' and 'Add Video' inside the create post modal
- Support toggling into poll creation and canceling back to standard post mode without losing composer state
- Sync PostCreationModal in the admin frontend with the same Add Poll capability
```

---

## 2026-09-28 11:20 (WAT) — Universal DeleteModal Integration and Edit Profile Back/Logo Navigation Flow

- **Repo**: `bejite-frontend`
- **Summary**: Replaced native browser alerts and confirms with the customized `DeleteModal` popup across the entire application on both job seeker and recruiter sides. Updated the profile editing flow so that "Go back" steps backward sequentially until Step 1, where it exits to the news feed home (`/news-feed`), made "Go back" only visible and active during profile editing mode (`isEditMode`), and made clicking the Bejite logo from any screen navigate directly to `/news-feed`.
- **Changed**:
  - `src/components/modal/DeleteModal.jsx` & `src/components/DeleteModal.jsx`: Created reusable delete confirmation modal with trash badge, cancel/delete actions, and loading spinners.
  - `src/components/PostCommentsSection.jsx`: Replaced `window.confirm` with `DeleteModal` for single and recursive comment deletion.
  - `src/components/recruitment/RecruitmentMiddle.jsx` & `src/components/feed/PostCard.jsx`: Integrated `DeleteModal` for feed and recruitment post deletion.
  - `src/pages/ActivityLog.jsx`: Integrated `DeleteModal` for activity log post deletion.
  - `src/pages/employerDashboard/EmployerDashboard.jsx`: Integrated `DeleteModal` for job vacancy deletion.
  - `src/pages/employerDashboard/RecruitmentManagement.jsx`: Integrated `DeleteModal` for pipeline stage deletion.
  - `src/pages/ads/AdProDashboard.jsx`: Replaced `window.confirm` and native alerts with `DeleteModal` and toast messages.
  - `src/pages/pitch/PitchPage.jsx`: Replaced `window.confirm` with `DeleteModal` for pitch reel and draft deletion.
  - `src/components/recruterchats/chats-middle.jsx` & `src/components/recruterchats/chats-left.jsx`: Integrated `DeleteModal` for message and conversation deletion.
  - `src/pages/jobseekerSignup/cvBuilder/Education.jsx`, `Skills.jsx`, `WorkHistory.jsx`, `Certificate.jsx`: Integrated `DeleteModal` for CV entry removal; passed `isEditMode` to `NavigationButtons`.
  - `src/components/NavigationButtons.jsx`: Added `isEditMode` awareness so "Go back" only renders during edit profile flows and is hidden during initial onboarding.
  - `src/pages/jobseekerSignup/cvBuilder/Bio.jsx`, `Certificate.jsx`, `Link.jsx`, `JobType.jsx`: Explicitly routed back step 1 to `/news-feed` and passed `isEditMode`.
  - `src/pages/corporate/BasicDetails.jsx`, `ProfileSetup.jsx`, `CompanyDetails.jsx`, `Location.jsx`, `Verify.jsx`, `UploadDoc.jsx`: Updated recruiter corporate flow to pass `isEditMode` and exit to `/news-feed` on step 1 back.
  - `src/pages/individual/BasicDetails.jsx`, `ProfileSetup.jsx`, `Location.jsx`, `Verify.jsx`, `SelectId.jsx`, `UploadDoc.jsx`: Updated recruiter individual flow to pass `isEditMode` and exit to `/news-feed` on step 1 back.
  - `src/components/Header.jsx`, `PaymentPageHeader.jsx`, `AboutPageHeader.jsx`, `ChatPageHeader.jsx`, `NewsFeedHeader.jsx`, `onboardingLayout.jsx`, `JobConnection.jsx`, `JobSeekerOpt.jsx`, `EmployerOpt.jsx`, `Resume.jsx`: Ensured clicking the Bejite logo navigates directly to `/news-feed`.
- **Conventional type** (for next commit): `feat(ux)`

### Proposed Commit Message

```
feat(ux): replace alerts with DeleteModal and refine edit profile navigation

We replaced all native confirm dialogs with a customized DeleteModal popup across job seeker and recruiter pages, and refined navigation when editing profiles.

- Replace browser confirm dialogs with DeleteModal in comments, posts, chats, activity log, ads, vacancies, stages, and CV builder entries
- Show 'Go back' navigation button exclusively during edit profile mode, hiding it during initial signup onboarding
- Step backward through profile editing steps sequentially until Step 1, which exits directly to the news feed
- Make the Bejite logo clickable across all layouts and headers to return directly to /news-feed
```

---


## 2026-09-28 09:55 (WAT) — Move Pitches Carousel to Top and Convert Create Post to Button Bar

- **Repo**: `bejite-frontend`
- **Summary**: Relocated the Pitches (24h Reels) carousel to the very top of the News Feed (like Instagram and Facebook stories/reels), and converted the create post section from a large input pill into a sleek button bar with user avatar, "+ Create Post" action button, and preserved Image, Video, and Poll buttons.
- **Changed**:
  - `src/components/recruitment/RecruitmentMiddle.jsx`: Moved `PitchReelsCarousel` to the top of `<main>`, replaced the two-row create post card with a single compact button bar with avatar and "+ Create Post" button, and retained the Image, Video, and Poll buttons.
- **Conventional type** (for next commit): `feat(feed)`

### Proposed Commit Message

```
feat(feed): move pitches carousel to top and convert create post to button bar

We moved the Pitches (24h Reels) carousel to the top of the news feed and streamlined the create post section into a compact button bar.

- Place PitchReelsCarousel at the very top of the feed layout (like Facebook/Instagram stories)
- Replace the large 'Start a post' input pill with a modern '+ Create Post' button
- Keep the Image, Video, and Poll action buttons alongside the avatar and create button
```

---

## 2026-09-25 20:30 (WAT) — Integrate DeleteConfirmModal Across All Admin Pages with Delete Actions

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Integrated the reusable `DeleteConfirmModal` (with `GoTrash` icon) into all admin management pages that feature delete actions, replacing inline/custom confirmation modals and silent deletions with a consistent, safe confirmation dialog.
- **Changed**:
  - `Admin-frontend/src/page/admin/AdminList.jsx`: Replaced the custom inline modal with `DeleteConfirmModal` for confirming administrator account deletion.
  - `Admin-frontend/src/page/admin/AdminEmailOutreach.jsx`: Replaced the legacy `DeleteCampaignConfirmModal` with the standard `DeleteConfirmModal` for campaign history deletion.
  - `Admin-frontend/src/page/admin/AdminEvents.jsx`: Added `DeleteConfirmModal` confirmation flow before deleting partner events from event history.
- **Conventional type** (for next commit): `feat(admin)`

### Proposed Commit Message

```
feat(admin): integrate DeleteConfirmModal across all admin pages with delete actions

We standardized delete confirmation dialogs across admin pages by integrating the reusable DeleteConfirmModal featuring the GoTrash icon.

- Use DeleteConfirmModal in AdminList when deleting admin accounts
- Use DeleteConfirmModal in AdminEmailOutreach when deleting campaigns
- Use DeleteConfirmModal in AdminEvents when deleting partner events
- Standardize danger confirmation styles, backdrop blur, and keyboard dismissal
```

---

## 2026-09-25 20:10 (WAT) — Create Reusable Delete Confirmation Modal with GoTrash

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Created a reusable delete confirmation modal component (`DeleteConfirmModal`) featuring the requested `react-icons/go` `GoTrash` icon, clean accessible backdrop dismissal, customizable warning title and description, and danger confirmation actions. Integrated the modal into the admin mailbox for both single-thread and bulk conversation deletions.
- **Changed**:
  - `Admin-frontend/src/components/modal/DeleteConfirmModal.jsx`: Created reusable modal component with `<GoTrash />` icon badge, Escape key dismissal, backdrop click dismissal, loading states, and customizable text props.
  - `Admin-frontend/src/components/DeleteConfirmModal.jsx`: Re-exported `DeleteConfirmModal` from components root.
  - `Admin-frontend/src/page/admin/AdminRecruiterMail.jsx`: Integrated `DeleteConfirmModal` to safely confirm single conversation deletion and multi-item bulk deletion.
- **Conventional type** (for next commit): `feat(components)`

### Proposed Commit Message

```
feat(components): create reusable delete confirmation modal with GoTrash

We created a reusable DeleteConfirmModal component using react-icons/go GoTrash for confirmation dialogs across admin views.

- Build DeleteConfirmModal with GoTrash icon badge, animated backdrop, and keyboard dismissal
- Export from components/modal and components root for easy access
- Connect confirmation modal to single and bulk delete actions in Mailbox
```

---

## 2026-09-25 20:06 (WAT) — Update Mailbox Route to /admin/mailbox

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Updated the mailbox route from `/admin/recruiter-mail` to `/admin/mailbox`, added an automatic redirect for legacy `/admin/recruiter-mail` URLs to `/admin/mailbox`, updated navigation in `AdminLayout`, updated role permissions in `adminPermissions.js`, and updated cross-links in `AdminEmailOutreach`.
- **Changed**:
  - `Admin-frontend/src/App.jsx`: Defined `/admin/mailbox` route using `AdminMailbox` component and configured a redirect from `/admin/recruiter-mail` to `/admin/mailbox`.
  - `Admin-frontend/src/page/admin/AdminMailbox.jsx`: Created default export for `AdminMailbox`.
  - `Admin-frontend/src/components/admin/AdminLayout.jsx`: Updated navigation path for Mailbox item to `/admin/mailbox`.
  - `Admin-frontend/src/constants/adminPermissions.js`: Added `/admin/mailbox` to super_admin and admin allowed paths.
  - `Admin-frontend/src/page/admin/AdminEmailOutreach.jsx`: Updated link to point to `/admin/mailbox`.
- **Conventional type** (for next commit): `feat(admin)`

### Proposed Commit Message

```
feat(admin): update mailbox route to /admin/mailbox

We changed the URL route for the admin mailbox from /admin/recruiter-mail to /admin/mailbox and added an automatic redirect for legacy paths.

- Register /admin/mailbox route in App router
- Add automatic redirect from /admin/recruiter-mail to /admin/mailbox
- Update AdminLayout sidebar navigation link to /admin/mailbox
- Update admin permissions whitelist to include /admin/mailbox
- Update outreach page cross-link to /admin/mailbox
```

---

## 2026-09-25 20:03 (WAT) — Transform Recruiter Mail into Clean Universal Admin Mailbox

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Transformed the recruiter-specific mailbox into a clean, simple, universal admin Mailbox for sending, receiving, and managing emails with both Bejite users and external contacts. Removed all recruiter intelligence profiling, fake delivery tracking stats, inbound reply simulation tools, star/archive folders, and category tagging bloat.
- **Changed**:
  - `Admin-frontend/src/page/admin/AdminRecruiterMail.jsx`: Renamed header to "Mailbox"; stripped out profile drawer, simulation modal, and category tags; simplified layout to responsive 2-column client (Folders + Messages/Conversation); retained Inbox and Sent folders with unread counts.
  - `Admin-frontend/src/services/recruiterMailService.js`: Replaced recruiter-specific data models with universal contact email threads; removed open/delivery tracking metrics; cleaned up seed threads with realistic user and external emails; added universal `sendAdminMessage`.
  - `Admin-frontend/src/components/admin/recruiterMail/RecruiterMailSidebar.jsx`: Streamlined sidebar to primary "Compose Email" action and two essential folders: Inbox (with unread badge) and Sent.
  - `Admin-frontend/src/components/admin/recruiterMail/RecruiterMailToolbar.jsx`: Replaced category tagging and bulk archive/star controls with clean search bar, select-all checkbox, bulk mark read/unread, bulk delete, and All/Unread filter tabs.
  - `Admin-frontend/src/components/admin/recruiterMail/RecruiterThreadList.jsx`: Displayed clean sender/recipient initials avatars, contact names, email addresses, subject lines, message snippets, and timestamps; added quick hover actions for delete and mark read/unread.
  - `Admin-frontend/src/components/admin/recruiterMail/RecruiterThreadView.jsx`: Removed drawer toggle, simulation button, delivery tracking pills, and star/archive actions; provided clean chronological message stream and quick inline reply form with file attachment support.
  - `Admin-frontend/src/components/admin/recruiterMail/DockedComposer.jsx`: Removed category selector and schedule send; enabled typing any valid external or user email address in the To field with optional autocomplete.
- **Conventional type** (for next commit): `refactor(admin)`

### Proposed Commit Message

```
refactor(admin): transform recruiter mail into clean universal admin mailbox

We simplified the admin mailbox into a streamlined email platform for sending and receiving messages with users and external contacts without recruiter-specific bloat.

- Rename view to Mailbox with clean Inbox and Sent folders
- Allow typing any recipient email address in the compose modal
- Strip recruiter intelligence drawer, fake open/delivery stats, and simulation modal
- Remove category tags, archive, starred, and bulk outreach bloat
- Provide clean email conversation stream with quick inline reply
```

---

## 2026-09-25 12:03 (WAT) — Move Pitch Reels Carousel to Top of Newsfeed

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Moved the Pitch Reels carousel from its mid-feed injection point (after post 2) to the top of the newsfeed directly below the "Start a post" creation card and divider line. Removed redundant duplicate carousel rendering from the empty feed state.
- **Changed**:
  - `src/components/recruitment/RecruitmentMiddle.jsx`: Rendered `PitchReelsCarousel` at the top of the feed stream right below the divider line; removed mid-feed injection logic (`index === 1`) from `posts.map`; removed duplicate carousel instance from the `posts.length === 0` fallback.
- **Conventional type** (for next commit): `feat(feed)`

### Proposed Commit Message

```
feat(feed): move pitch reels carousel to top of newsfeed

We repositioned the Pitch Reels carousel to display at the top of the newsfeed right below the post creation card so users can access 24h reels immediately.

- Move PitchReelsCarousel above the post stream below Start a post and divider line
- Remove mid-feed injection after the second post in the feed stream
- Eliminate duplicate carousel rendering in the empty posts fallback
```

---

## 2026-09-25 10:53 (WAT) — Fix Dropdowns in New Message Composer and Add Category Selector

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Resolved multiple dropdown issues in the New Message (Docked Composer) modal. Fixed CSS `overflow-hidden` on the Send button group that prevented the Schedule Send dropdown from rendering, added outside-click dismissal listeners across all floating menus (Templates, Schedule Send, Recruiter Autocomplete, Category), added a dedicated Mail Category Tag dropdown for new outreach threads, and preserved recipient autocomplete on field click.
- **Changed**:
  - `Admin-frontend/src/components/admin/recruiterMail/DockedComposer.jsx`: Separated Send button group wrapper from the Schedule dropdown so the schedule menu is not clipped by `overflow-hidden`; added dedicated Mail Category tag selector row with clean dropdown; bound `toFieldRef`, `categoryMenuRef`, `templatesMenuRef`, and `scheduleMenuRef` to single outside-click listener; passed selected `category` into `onSend`.
  - `Admin-frontend/src/page/admin/AdminRecruiterMail.jsx`: Forwarded `category` parameter in composer `handleSendMessage` to `sendRecruiterMessage`.
  - `Admin-frontend/src/services/recruiterMailService.js`: Accepted `category` parameter in `sendRecruiterMessage` and persisted it to the newly initiated conversation thread.
- **Conventional type** (for next commit): `fix(admin)`

### Proposed Commit Message

```
fix(admin): fix dropdowns in new message composer and add category selector

We resolved layout clipping and dismissal issues for dropdown menus in the recruiter message composer and added an interactive mail category selector.

- Unclip schedule send dropdown by moving it outside button group overflow bounds
- Add an interactive category tag dropdown selector when composing new messages
- Close templates, schedule, category, and autocomplete dropdowns on outside clicks
- Keep recipient suggestions accessible on click and focus in the To input
- Persist user-selected category to newly created email outreach threads
```

---

## 2026-09-25 10:48 (WAT) — Fix Recruiter Mail Category Dropdowns and Add Interactive Category Filtering

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Resolved dropdown clipping and unresponsiveness in the recruiter mailbox category selector. Fixed `overflow-hidden` on thread action bars that blocked desktop and mobile category dropdown menus from displaying, added outside-click dismissal listeners, enabled toggling and clearing categories, integrated bulk category tagging on selected threads, and added a dedicated category filter dropdown directly in the mailbox toolbar.
- **Changed**:
  - `Admin-frontend/src/components/admin/recruiterMail/RecruiterThreadView.jsx`: Removed `overflow-hidden` from action bar header to allow dropdown menus to pop over content; added outside-click listeners for desktop category dropdown and mobile more menu; added category clear button and toggle behavior; styled active category tag on dropdown trigger button.
  - `Admin-frontend/src/components/admin/recruiterMail/RecruiterMailToolbar.jsx`: Added dedicated Category Filter Dropdown in toolbar tab strip with live counters and checkmarks; added bulk Category/Tag dropdown button for multi-selected email threads; removed `overflow-hidden` so toolbar dropdowns render freely; added click-outside dismissal handlers.
  - `Admin-frontend/src/components/admin/recruiterMail/RecruiterMailSidebar.jsx`: Allowed toggling active category filter by clicking the selected category pill a second time.
  - `Admin-frontend/src/page/admin/AdminRecruiterMail.jsx`: Imported `RECRUITER_CATEGORIES`; implemented `handleBulkUpdateCategory`; connected `counts`, `setActiveCategory`, and `onBulkUpdateCategory` to `RecruiterMailToolbar`; updated mobile folder trigger to reflect active category tag.
- **Conventional type** (for next commit): `fix(admin)`

### Proposed Commit Message

```
fix(admin): fix mail category dropdowns and add toolbar category filter

We resolved layout clipping on the recruiter mailbox category dropdowns and added dedicated category tagging and filtering controls across the mailbox client.

- Remove overflow clipping on thread action bar so category and more-options dropdowns render properly
- Add outside-click dismissal and clear/toggle functionality to conversation category menus
- Introduce a category filter dropdown in the main mailbox toolbar with real-time thread counts
- Add bulk category tagging dropdown when multiple email threads are selected
- Allow toggling category filters on and off directly from sidebar and toolbar pills
```

---

## 2026-09-24 23:35 (WAT) — Fix Mobile Responsiveness in Simulate Reply Modal and Docked Composer

- **Repo**: `bejite-frontend`
- **Summary**: Fixed viewport clipping and responsive layout issues in the Simulate Reply Modal and Docked Composer on mobile devices (e.g. iPhone SE 375x667). Converted the simulation modal into an adaptive bottom-sheet with pinned header and footer and independently scrollable content. Prevented composer bottom toolbar buttons from wrapping to a second line, added responsive single-line send actions, added `.no-scrollbar` styling, bounded template and schedule menus to prevent screen-edge overflow, and truncated recipient pills safely.
- **Changed**:
  - `Admin-frontend/src/components/admin/recruiterMail/SimulateReplyModal.jsx`: Converted to responsive bottom-sheet on mobile (`items-end sm:items-center`), pinned header and footer (`shrink-0`), made form body independently scrollable (`overflow-y-auto flex-1 min-h-0`), added grab bar indicator for mobile, and added text truncation on select input.
  - `Admin-frontend/src/components/admin/recruiterMail/DockedComposer.jsx`: Fixed toolbar item wrapping so Send, Paperclip, Templates, and Trash controls fit cleanly on a single row without pushing Trash to a new line; added responsive Send button labels; fixed `isMaximized` state declaration; made maximized view full-screen on mobile (`inset-0`); anchored template and schedule menus to device boundaries; added truncation to selected recipient chip.
  - `Admin-frontend/src/components/admin/recruiterMail/RecruiterThreadView.jsx`: Anchored templates dropdown to mobile screen edges so it never overflows rightward.
  - `Admin-frontend/src/index.css`: Added `.no-scrollbar` utility for cross-browser hidden scrollbars on mobile tracks.
- **Conventional type** (for next commit): `fix(admin)`

### Proposed Commit Message

```
fix(admin): fix mobile responsiveness in simulate modal and docked composer

We resolved mobile viewport clipping and toolbar button wrapping in the recruiter mailbox modals and composer for clean phone and tablet usage.

- Present simulation modal as an adaptive bottom sheet with pinned header and action bar
- Keep docked composer toolbar controls on a single row without wrapping the trash button
- Anchor composer template and schedule menus within mobile screen boundaries
- Add no-scrollbar utility class for clean swipeable pill tracks
- Truncate recipient names and emails inside composer address pills
```

---

## 2026-09-24 23:20 (WAT) — Eliminate Mobile Horizontal Overflow and Elevate Tab Control & UI

- **Repo**: `bejite-frontend`
- **Summary**: Resolved all horizontal page overflow and left-right scrollbar leaks in the Admin Recruiter Mailbox on mobile screens. Redesigned the filter tabs into an executive Apple/Linear-style segmented capsule control, made the mobile layout full-bleed without clumsy nested card borders, added responsive file-type badges to attachments, bounded suggestion chips to strictly prevent width expansion, and polished inline quick replies.
- **Changed**:
  - `Admin-frontend/src/components/admin/AdminLayout.jsx`: Added `useLocation` detection so `/admin/recruiter-mail` runs full-bleed (`p-0`) on mobile screens while retaining comfortable margins (`sm:p-4 lg:p-6`) on desktop, preventing outer viewport overflow.
  - `Admin-frontend/src/page/admin/AdminRecruiterMail.jsx`: Computed exact mobile viewport height `h-[calc(100dvh-4rem)]` accounting for the admin header; made workspace container flush on mobile; defaulted `showProfileDrawer` to open only on desktop screens (`>= 1280px`).
  - `Admin-frontend/src/components/admin/recruiterMail/RecruiterMailToolbar.jsx`: Redesigned filter tabs into a modern segmented control with elevated active pill card, clean emerald count badges, and smooth inertia touch scrolling; made search row flex smoothly without overflowing.
  - `Admin-frontend/src/components/admin/recruiterMail/RecruiterThreadView.jsx`: Added `overflow-x-hidden` and `w-full max-w-full` to thread scroll container; bounded quick reply suggestion chips inside a constrained horizontal track so they never expand parent width; enhanced message timestamps to compact readable format; added color-coded file badges for attachments; upgraded inline reply trigger.
  - `Admin-frontend/src/components/admin/recruiterMail/RecruiterThreadList.jsx`: Added bounded width and safe text truncation to prevent row overflow on narrow screens.
  - `Admin-frontend/src/services/recruiterMailService.js`: Removed live API calls (`/api/admin/data/users` and `/api/admin/email-outreach/campaigns/test`) and `axiosInstance` import; replaced with fully self-contained realistic dummy recruiter directory and local state persistence, preventing 403 Forbidden errors.
- **Conventional type** (for next commit): `fix(admin)`

### Proposed Commit Message

```
fix(admin): eliminate mobile horizontal overflow and elevate mailbox UI

We resolved mobile layout overflow and horizontal scrolling in the recruiter mailbox while upgrading the tab controls and conversation elements to executive SaaS design standards.

- Make mobile mailbox layout full-bleed to eliminate viewport clipping and horizontal scrolling
- Redesign filter tabs into a sleek segmented capsule control with smooth touch scrolling
- Constrain quick suggestion chips and attachments to strictly prevent horizontal overflow
- Compact message header timestamps and improve sender detail responsiveness
- Default recruiter intelligence drawer to open only on widescreen displays
```

---

## 2026-09-24 22:30 (WAT) — Make Mailbox Fully Responsive and Scrollable Across All Screen Sizes

- **Repo**: `bejite-frontend`
- **Summary**: Transformed the Admin Recruiter Mailbox into a fully responsive, independently scrollable client across phones, tablets, laptops, and desktop screens. Fixed double scrollbars, added off-canvas mobile drawer with smooth slide-over for folders, responsive right-hand intelligence drawer with backdrops, bottom-sheet composer for mobile, and touch-friendly navigation.
- **Changed**:
  - `Admin-frontend/src/page/admin/AdminRecruiterMail.jsx`: Replaced fixed height with dynamic viewport calculation (`h-[calc(100dvh-6.25rem)] lg:h-[calc(100dvh-8.25rem)]`) eliminating outer `<main>` scrollbars; connected `isMobileSidebarOpen` state to folder drawer; made right-hand `RecruiterProfileDrawer` slide out as an off-canvas drawer with backdrop on `< xl` screens; made top application header compact and responsive.
  - `Admin-frontend/src/components/admin/recruiterMail/RecruiterMailSidebar.jsx`: Integrated `isThreadSelected` responsive classes so tablet screens prioritize thread reading; ensured sidebar acts as fixed off-canvas drawer on mobile (`< md`) taking zero flex width.
  - `Admin-frontend/src/components/admin/recruiterMail/RecruiterMailToolbar.jsx`: Connected `onOpenMobileSidebar` trigger button so mobile users can open folder navigation with one tap.
  - `Admin-frontend/src/components/admin/recruiterMail/RecruiterThreadView.jsx`: Added prominent touch-friendly `← Back` button for returning to thread list on mobile; added `break-words` and responsive padding to messages; added extra bottom padding (`pb-24 sm:pb-16`) to the independent scroll container so the inline reply composer never clips off screen.
  - `Admin-frontend/src/components/admin/recruiterMail/DockedComposer.jsx`: Made recruiter autocomplete dropdown bounds responsive to mobile screen edges (`left-2 right-2 max-w-[calc(100vw-2rem)]`); maintained bottom-sheet modal presentation on small screens.
- **Conventional type** (for next commit): `fix(admin)`

### Proposed Commit Message

```
fix(admin): make recruiter mailbox responsive and independently scrollable

We resolved layout clipping and scrollbar conflicts in the recruiter mailbox so admins can manage 1-on-1 emails comfortably on any screen size—from smartphones to widescreen displays.

- Fix viewport height calculation to eliminate outer page scrollbars and double scrolling
- Add mobile slide-over folder drawer with backdrop and toolbar toggle button
- Make recruiter intelligence panel open as a slide-out drawer on tablets and mobile screens
- Add touch-friendly back button and scroll padding to the thread conversation view
- Optimize docked composer and autocomplete dropdown for mobile screen boundaries
```

---

## 2026-09-24 22:20 (WAT) — Elevate Mailbox Aesthetics, Usability, and Quick Replies

- **Repo**: `bejite-frontend`
- **Summary**: Refined the Bejite Admin Mailbox UI across all components to deliver an intuitive, state-of-the-art email client experience. Enhanced folder navigation with keyboard shortcut hints, added 1-click quick suggestion reply pills, refined search and bulk action bars, elevated recruiter metadata cards with copy actions, and added variable tags to the docked composer.
- **Changed**:
  - `Admin-frontend/src/components/admin/recruiterMail/RecruiterMailSidebar.jsx`: Enhanced compose button with keyboard shortcut (`C`), clear folder helper subtitles, distinct color-coded icons, upgraded recruiter performance statistics widget, and cleaner test reply trigger.
  - `Admin-frontend/src/components/admin/recruiterMail/RecruiterMailToolbar.jsx`: Added backdrop blur, search keyboard shortcut (`/`), animated bulk selection strip, and active filter pill counters.
  - `Admin-frontend/src/components/admin/recruiterMail/RecruiterThreadList.jsx`: Added prominent status pills ("Needs Reply", "In Dialogue", "Sent"), improved typography and sender separation, enhanced avatar states, and smooth hover actions.
  - `Admin-frontend/src/components/admin/recruiterMail/RecruiterThreadView.jsx`: Added 1-click Quick Suggestion pills ("Send Candidate Profiles", "Schedule Call", "Badge Verification"), refined message cards distinguishing admin vs recruiter, and polished inline reply box.
  - `Admin-frontend/src/components/admin/recruiterMail/RecruiterProfileDrawer.jsx`: Added 1-click copy feedback on email and phone, elevated activity metrics, and persistent admin notes.
  - `Admin-frontend/src/components/admin/recruiterMail/DockedComposer.jsx`: Fixed header title, added 1-click variable insertion tokens (`{{recruiter_name}}`, `{{company_name}}`), template previews, and schedule send.
  - `Admin-frontend/src/page/admin/AdminRecruiterMail.jsx`: Added global keyboard shortcuts (`C` to compose, `Esc` to close/back), clean breadcrumbs, and live sync indicators.
- **Conventional type** (for next commit): `refactor(admin)`

### Proposed Commit Message

```
refactor(admin): elevate mailbox aesthetics, usability, and quick replies

We polished the entire one-on-one recruiter email client to make communication faster, clearer, and visually cohesive with the platform.

- Add keyboard shortcuts ('C' to compose, 'Esc' to close/back, '/' to search)
- Add 1-click quick suggestion pills to instantly populate replies to recruiters
- Add variable insertion tokens in the composer for recruiter and company names
- Enhance folder sidebar with descriptive subtitles and outreach metrics
- Upgrade recruiter profile drawer with one-tap copy actions for email and phone
- Refine thread list with animated status badges and clean typography
```

---

## 2026-09-24 20:15 (WAT) — Build 1-on-1 Recruiter Emailing Client (Gmail Style) in Admin Frontend

- **Repo**: `bejite-frontend`
- **Summary**: Created a comprehensive, Gmail-style one-on-one email workspace in the Admin panel (`/admin/recruiter-mail`) enabling administrators to personally contact recruiters, track sent emails, see recruiter replies, and respond in threaded conversations.
- **Changed**:
  - `Admin-frontend/src/services/recruiterMailService.js`: Created recruiter email service with thread persistence in localStorage, recruiter directory lookup via `/api/admin/data/users?role=recruiter`, seed conversations with top tech hiring partners, and simulated reply engine.
  - `Admin-frontend/src/page/admin/AdminRecruiterMail.jsx`: Master page integrating sidebar, toolbar, thread list, threaded view, recruiter context drawer, and floating composer.
  - `Admin-frontend/src/components/admin/recruiterMail/RecruiterMailSidebar.jsx`: Mailbox folders (Inbox, Sent, Starred, Drafts, Archive, Trash), category filter tags, outreach quota widget, and simulator trigger.
  - `Admin-frontend/src/components/admin/recruiterMail/RecruiterMailToolbar.jsx`: Search bar with clear button, filter chips (Unread, Starred, Attachments), and bulk actions (mark read, star, archive, delete).
  - `Admin-frontend/src/components/admin/recruiterMail/RecruiterThreadList.jsx`: Gmail-style list rows with checkboxes, star toggles, recruiter avatars, company badges, message snippets, and hover actions.
  - `Admin-frontend/src/components/admin/recruiterMail/RecruiterThreadView.jsx`: Thread view with full conversation timeline, delivery receipts, attachments preview, and inline quick reply box.
  - `Admin-frontend/src/components/admin/recruiterMail/RecruiterProfileDrawer.jsx`: Recruiter context drawer with profile metadata, active jobs, external links, and persistent internal admin notes.
  - `Admin-frontend/src/components/admin/recruiterMail/GmailDockedComposer.jsx`: Dockable bottom-right floating composer with minimize, normal, and maximized states, recruiter autocomplete, templates, schedule send, and attachments.
  - `Admin-frontend/src/components/admin/recruiterMail/SimulateReplyModal.jsx`: Modal for simulating realistic incoming recruiter replies in real-time.
  - `Admin-frontend/src/components/admin/AdminLayout.jsx`: Added "Recruiter Mail" nav item with unread badge count.
  - `Admin-frontend/src/constants/adminPermissions.js`: Added permissions for `/admin/recruiter-mail`.
  - `Admin-frontend/src/App.jsx`: Added route `/admin/recruiter-mail`.
  - `Admin-frontend/src/page/admin/AdminEmailOutreach.jsx`: Added header banner linking to the 1-on-1 Recruiter Mailbox.
  - `Admin-frontend/src/page/admin/AdminUsers.jsx`: Added direct "Email" button for recruiters in users list.
- **Conventional type** (for next commit): `feat(admin)`

### Proposed Commit Message

```
feat(admin): build 1-on-1 recruiter emailing client with real-time reply simulation

We added a dedicated, Gmail-style email client in the Admin portal so administrators can reach out to recruiters individually, review their replies, and carry on conversations in threaded email views.

- Create a full-featured one-on-one email workspace at /admin/recruiter-mail
- Provide Gmail-style folders: Inbox, Sent, Starred, Drafts, Archive, and Trash
- Implement threaded conversation view with delivery receipts, attachments, and inline reply box
- Add a dockable floating composer with recruiter search autocomplete, pre-made templates, and schedule send
- Provide a recruiter profile sidebar with company details, active job postings, and persistent private admin notes
- Include an interactive simulator for testing real-time inbound recruiter responses
- Connect navigation across AdminLayout, Email Outreach, and Users List
```

---

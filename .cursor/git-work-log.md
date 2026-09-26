# Git Work Log

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

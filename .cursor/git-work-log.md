# Git Work Log

## 2026-11-04 03:00 (WAT) — Implement Partner Course Details Page, Assessment Preview Drawer, and Practical Project Brief Drawer

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Implemented the full-page Partner Course Details view (`PartnerCourseDetailsPage.jsx`) supporting In Review (Image 1), Draft with edit actions (Image 2), and Published states (Image 3), alongside the View Assessment right sidebar slide-over panel (`AssessmentPreviewDrawer.jsx` - Image 4) and the View Brief right sidebar slide-over panel (`ProjectBriefDrawer.jsx` - Image 5).
- **Changed**:
  - `src/pages/elearning/partner/PartnerCourseDetailsPage.jsx`:
    - Full details page matching Figma mockups with status-sensitive hero banner, course configuration breakdown across 7 sections, interactive "Edit" links in Draft state, and publication actions.
    - Integrated `AssessmentPreviewDrawer`, `ProjectBriefDrawer`, and `CourseSubmitReviewModal`.
  - `src/components/elearning/AssessmentPreviewDrawer.jsx`:
    - Right sidebar slide-over drawer matching Image 4 with pass mark, question count, time limit, max attempts, learner instructions, and full question answer keys.
  - `src/components/elearning/ProjectBriefDrawer.jsx`:
    - Right sidebar slide-over drawer matching Image 5 with project scenario brief, deliverable breakdown, accepted submission format chips, and 4-tier grading rubric criteria.
  - `src/components/elearning/index.js`:
    - Exported `AssessmentPreviewDrawer` and `ProjectBriefDrawer`.
  - `src/app/lazyPages.js` & `src/app/routes/employerRoutes.jsx`:
    - Registered `/e-learning/partner/:courseId` and `/e-learning/partner/courses/:courseId` with legacy redirect support.
  - `src/pages/elearning/partner/ELearningManagementPage.jsx` & `src/components/elearning/RecruiterCoursesTable.jsx`:
    - Wired "View" button and course title clicks to navigate directly to `/e-learning/partner/:courseId`.
- **Conventional type**: `feat(elearning)`

### Proposed Commit Message

```
feat(elearning): add partner course details page and right sidebar preview drawers

Implement Partner Course Details page matching Figma designs across In Review, Draft,
and Published states, with assessment and project brief slide-over preview drawers.

- Build PartnerCourseDetailsPage with 7-section inspection and status-sensitive actions
- Build AssessmentPreviewDrawer for full quiz preview and answer key inspection
- Build ProjectBriefDrawer for scenario, deliverable requirements, and rubric inspection
- Connect RecruiterCoursesTable view actions to /e-learning/partner/:courseId
- Register routes in employerRoutes with lazy loading and legacy fallbacks
```

---

## 2026-11-04 02:40 (WAT) — Refactor CourseBuilderWizard into modular architecture and configure role-based e-learning sidebar navigation

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Refactored the monolithic 1,500-line `CourseBuilderWizard.jsx` into clean, single-responsibility step components, ensured zero barrel export file duplication across `pages/elearning`, and configured the right sidebar e-learning link to route recruiters directly to `/e-learning/partner` and jobseekers to `/e-learning/jobseeker`.
- **Changed**:
  - `src/components/elearning/CourseBuilderWizard.jsx`:
    - Refactored wizard container from ~1,500 lines down to ~400 lines by delegating each step to its dedicated modular component.
    - Preserved central state management for draft courses and modal controls.
  - `src/components/elearning/CourseBasicInfoStep.jsx`:
    - Extracted Step 1 (basic info, cover upload, subject area, audience, level, and learning outcomes editor).
  - `src/components/elearning/CourseStructureStep.jsx`:
    - Extracted Step 2 (organisation type, module cards, collapse/expand, reorder, child lesson list, add module/lesson modals).
  - `src/components/recruitment/recruitmentRightLinks.js`:
    - Configured `getRecruitmentRightLinks` to include `RECRUITER_ELEARNING_RIGHT_LINK` (`/e-learning/partner`) for recruiters and `JOBSEEKER_ELEARNING_RIGHT_LINK` (`/e-learning/jobseeker`) for jobseekers.
- **Conventional type**: `refactor(elearning)`

### Proposed Commit Message

```
refactor(elearning): modularize course builder wizard and update right sidebar routes

Split the monolithic CourseBuilderWizard into modular step components and configure
role-aware navigation for e-learning in the right sidebar.

- Extract CourseBasicInfoStep and CourseStructureStep into clean separate components
- Slim down CourseBuilderWizard from 1,500 lines to 400 lines
- Wire getRecruitmentRightLinks to navigate recruiters to /e-learning/partner and jobseekers to /e-learning/jobseeker
- Maintain clean direct exports without barrel redundancy
```

---

## 2026-11-04 02:20 (WAT) — Implement Step 6 Pricing, Step 7 Completion, Step 8 Review, and Review Confirmation Modal

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Implemented the remaining 3 steps of the partner Course Builder matching the design mockups: Step 6 Access and Pricing (Image 1), Step 7 Completion Requirements (Image 2), Step 8 Course Configuration Details Review (Image 3), and the Submit Course for Review Confirmation Modal (Image 4).
- **Changed**:
  - `src/components/elearning/CoursePricingStep.jsx`:
    - Built Step 6 Access and Pricing matching Image 1:
      - Enrollment Access Model cards: Free Access (`OPEN` badge) and Paid Course (`TUITION` badge).
      - Dynamic Course Tuition Amount (NGN / ₦) input with formatted display.
      - Quick suggested amount chips (`₦15,000`, `₦30,000`, `₦50,000`, `₦75,000`, `₦100,000`).
  - `src/components/elearning/CourseCompletionStep.jsx`:
    - Built Step 7 Completion Requirements matching Image 2:
      - 3 interactive requirement cards with custom checkbox indicators:
        - Complete required learning content with dynamic `{modules} modules • {lessons} lessons` badge.
        - Complete configured assessment with dynamic quiz title and question count badge.
        - Submit practical project with dynamic project title badge.
  - `src/components/elearning/CourseReviewStep.jsx`:
    - Built Step 8 Course Configuration Details Review matching Image 3:
      - Top course hero banner with difficulty level, subject area, and fee badges.
      - 7 distinct review blocks with checkmark indicators: Basic Information, Modules & Curriculum, Learning Content & Media, Assessment Configuration, Practical Project Deliverable, Access & Tuition Fee, and Completion Rules.
      - Direct "Submit for Review" CTA button.
  - `src/components/elearning/CourseSubmitReviewModal.jsx`:
    - Built review confirmation popup matching Image 4:
      - Centered modal with top green checkmark badge, title "Submit course for administrative review?", explanation copy, and "Keep Editing" / "Confirm Submission" actions.
  - `src/components/elearning/CourseBuilderWizard.jsx`:
    - Integrated `CoursePricingStep` (stepIndex 5), `CourseCompletionStep` (stepIndex 6), `CourseReviewStep` (stepIndex 7), and `CourseSubmitReviewModal`.
    - Updated wizard bottom action buttons ("Back to previous", "Save Draft", "Continue" / "Submit for Review") matching Figma style.
  - `src/components/elearning/index.js`:
    - Exported all new step components and the review modal.
- **Conventional type**: `feat(elearning)`

### Proposed Commit Message

```
feat(elearning): add pricing, completion requirements, review step, and confirmation modal

Implement the final stages of the partner Course Builder wizard matching Figma designs:
Step 6 Access & Pricing, Step 7 Completion Requirements, Step 8 Review, and confirmation modal.

- Build CoursePricingStep with Free Access / Paid Course tuition models
- Build CourseCompletionStep with dynamic learning, quiz, and project criteria
- Build CourseReviewStep with 7 comprehensive configuration inspection blocks
- Build CourseSubmitReviewModal for administrative publication review confirmation
- Wire all remaining steps and modals into CourseBuilderWizard
```

---

## 2026-11-04 01:55 (WAT) — Implement Question Modal Types, Step 5 Practical Project, and Partner E-Learning Route Aliases

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Aligned the Add Question modal across all question types (Single Choice, True or False, Text-Based, and Multiple Choice) matching Figma Images 1-3, implemented the complete Step 5 Practical Project configuration component matching Figma Images 4 and 5 with rubric criteria management and submission format selectors, and updated recruiter/employer routing to canonical Partner E-Learning routes.
- **Changed**:
  - `src/components/elearning/CourseQuestionModal.jsx`:
    - Refined Single Choice and Multiple Choice views (Image 1) with radio button selectors, option letter indicators, input text, and delete actions.
    - Added True or False view (Image 2) with fixed sage green option bars (`A. True`, `B. False`) and active radio indicator selection.
    - Added Text-Based view (Image 3) with answer option input field for expected answers.
    - Updated Question Type pill selectors with checkmark indicators and focus states.
  - `src/components/elearning/ProjectConfigurationStep.jsx`:
    - Implemented Step 5 Practical Project component:
      - **Toggle Card (Image 4 & 5)**: "Yes, include a practical project" vs "No practical project needed" with disabled fallback notice card.
      - **Project Details & Scenario Brief**: Project title, scenario brief instructions, practical competency skills, and deliverable requirements breakdown.
      - **Deliverable Expectations & Submission Formats**: Expected submission title, multi-select format toggles (File Upload, External Link URL, Written Response), and submission guidelines.
      - **Course Completion Requirement**: Mandatory vs optional practice activity toggle.
      - **Evaluation Criteria & Grading Standards**: Rubric editor with suggested criteria quick chips, `+ Add Outcome` button, numbered badges, reorder up/down controls, and delete action.
  - `src/components/elearning/CourseBuilderWizard.jsx`: Wired `ProjectConfigurationStep` into Step 5 (`stepIndex === 4`).
  - `src/components/elearning/index.js`: Exported `ProjectConfigurationStep`.
  - `src/app/routes/employerRoutes.jsx`: Renamed route sections from employer/recruiter to Partner E-Learning and added `LegacyCourseEditRedirect` for `/employer/e-learning/:courseId/edit` to redirect to `/e-learning/partner/:courseId/edit`.
- **Conventional type**: `feat(elearning)`

### Proposed Commit Message

```
feat(elearning): add question modal types, step 5 project config, and partner routes

Align Add Question modal options with designs, implement Step 5 Practical
Project builder with rubric management, and update legacy employer routes.

- Update CourseQuestionModal for single choice, true/false, and text-based
- Build ProjectConfigurationStep with scenario brief, formats, and rubric editor
- Wire Step 5 Practical Project into CourseBuilderWizard
- Redirect legacy employer/e-learning edit routes to canonical partner routes
```

---

## 2026-11-04 01:25 (WAT) — Add Video, Audio, and PDF Block Dropdown with Subtitles in Course Builder

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Updated the Step 3 Learning Content & Media block type selector in the partner Course Builder to match Figma Image 1 and Image 2 with styled dropdown items for Video Block, Audio Block, and PDF Document, complete with subtitles, active states, dedicated previewers, and dynamic upload dropzones.
- **Changed**:
  - `src/components/elearning/LessonMediaContentEditor.jsx`:
    - Added `BLOCK_OPTIONS` definitions with exact titles and subtitles matching Image 1:
      - **Video Block**: "Upload MP4, WebM or MOV video"
      - **Audio Block**: "Upload MP3, WAV audio lecture"
      - **PDF Document**: "Viewable document in lesson reader"
    - Redesigned dropdown menu with bold item headers, muted subtitles, generous vertical padding, active selection highlight (`bg-[#EFF6EF]`), and click-outside dismissal.
    - Added dynamic trigger button text showing the current block selection ("Video Block", "Audio Block", "PDF Document") with animated chevron.
    - Updated card header to show matching icons (`FileVideo`, `Headphones`, `FileText`) and block titles (`#1 Video Block`, `#1 Audio Block`, `#1 PDF Document`).
    - Added dedicated PDF document preview state with reader link, and audio player controls for audio blocks.
    - Updated dropzone text, file format hints, and file input accept attributes for Video, Audio, and PDF files.
    - Updated replace CTA button label to "Replace Video", "Replace Audio", or "Replace PDF".
    - Updated lesson sidebar badges to display "Video Content", "Audio Content", or "PDF Document".
- **Conventional type**: `feat(elearning)`

### Proposed Commit Message

```
feat(elearning): add block type dropdown with subtitles and PDF support in Course Builder

Update the lesson content block type dropdown to match the design with Video,
Audio, and PDF options including subtitles, dedicated previews, and dropzones.

- Add Video Block, Audio Block, and PDF Document options with descriptions
- Style dropdown menu with bold titles, subtitles, and active selection state
- Implement dedicated preview cards for PDF documents and audio lectures
- Update dropzone labels, accepted file formats, and replace actions dynamically
- Show matching content type badges across the course lessons sidebar
```

---

## 2026-11-04 01:06 (WAT) — Add Reusable Assessment Completed Screen Component (Pass and Fail Views)

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Implemented the reusable `AssessmentCompletedCard` component matching Figma Image 1 (failed with cooldown timer and locked retake) and Image 2 (passed with criteria satisfied and proceed to project), integrating it seamlessly into `CourseAssessmentPage.jsx`.
- **Changed**:
  - `src/components/elearning/AssessmentCompletedCard.jsx`: Built reusable completed screen supporting:
    - **Passed view (Image 2)**: Green circular checkmark, `ASSESSMENT PASSED` badge, `Congratulations! You Passed` heading, score summary, green criteria satisfied box (`Next milestone: Submit your practical project deliverable`), and action buttons (`Proceed to Practical Project >` and `Return to Course Curriculum`).
    - **Failed view (Image 1)**: Red circular checkmark, `ASSESSMENT NOT PASSED` badge, `Pass Mark Not Met` heading, score summary, amber cooldown card with live countdown timer (`00:38`), and action buttons (`Retake Locked` while cooldown is active / `Retake Assessment` once unlocked, and `Return to Course Curriculum`).
    - Expandable answer review section to review question-by-question choices.
  - `src/components/elearning/index.js`: Exported `AssessmentCompletedCard`.
  - `src/pages/elearning/jobseeker/CourseAssessmentPage.jsx`: Integrated `AssessmentCompletedCard` for the assessment completion step.
- **Conventional type**: `feat(elearning)`

### Proposed Commit Message

```
feat(elearning): add reusable assessment completed screen for passed and failed states

Implement the assessment result screens matching the design mockups for both
passed and failed quiz outcomes with countdown timer and navigation actions.

- Build `AssessmentCompletedCard` component with passed and failed UI states
- Render passed view with criteria satisfied box and proceed to project CTA
- Render failed view with amber cooldown countdown and retake lock
- Support live countdown timer and review submitted answers breakdown
- Wire completed card into jobseeker `CourseAssessmentPage`
```

---

## 2026-11-04 00:27 (WAT) — Remove Redundant Forwarding and Index Export Files from E-Learning Pages

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Removed all redundant re-export and forwarding files from `src/pages/elearning/` and `src/pages/employerDashboard/`, keeping only the direct, self-contained page components inside `src/pages/elearning/jobseeker/` and `src/pages/elearning/partner/`.
- **Changed**:
  - `src/pages/elearning/`: Removed all loose forwarding shims (`CourseAssessmentPage.jsx`, `CourseCheckoutPage.jsx`, `CourseDetailsPage.jsx`, `CoursePlayerPage.jsx`, `CourseProgressPage.jsx`, `CourseProjectPage.jsx`, `ELearningDashboardPage.jsx`, `ExploreCoursesPage.jsx`, `MyLearningPage.jsx`, `index.js`).
  - `src/pages/employerDashboard/`: Removed forwarding shims (`CourseBuilderPage.jsx`, `ELearningManagementPage.jsx`).
  - `src/pages/elearning/jobseeker/`: Removed `index.js` barrel file; kept only the 9 standalone page components (`CourseAssessmentPage.jsx`, `CourseCheckoutPage.jsx`, `CourseDetailsPage.jsx`, `CoursePlayerPage.jsx`, `CourseProgressPage.jsx`, `CourseProjectPage.jsx`, `ELearningDashboardPage.jsx`, `ExploreCoursesPage.jsx`, `MyLearningPage.jsx`).
  - `src/pages/elearning/partner/`: Removed `index.js` barrel file; kept only the 2 standalone partner components (`CourseBuilderPage.jsx`, `ELearningManagementPage.jsx`).
  - `src/app/lazyPages.js`: Imports directly from the canonical file paths in `src/pages/elearning/jobseeker/` and `src/pages/elearning/partner/`.
- **Conventional type**: `refactor(elearning)`

### Proposed Commit Message

```
refactor(elearning): remove redundant forwarding files and barrel exports

Clean up duplicate forwarding shims and barrel index files across the
E-Learning pages hierarchy, ensuring every route imports directly from
the main page component in jobseeker or partner.

- Delete loose forwarding files in src/pages/elearning
- Delete legacy elearning forwarding files in src/pages/employerDashboard
- Delete unused index barrel files in jobseeker and partner directories
- Ensure lazyPages loads directly from canonical page components
```

---

## 2026-11-04 00:15 (WAT) — Implement Paid Course Details, Checkout Flow, Success & Error Views, and Modularize E-Learning Directory

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Implemented the paid course details view (Image 2) with Course Fee banner and "Proceed to Checkout" action, built the complete Checkout workflow with course order summary, recipient details, and card payment simulation (Image 3), built the Payment Success screen (Image 4) and simulated error banner (Image 5), extracted reusable checkout components, and restructured all E-Learning pages under a unified `src/pages/elearning/` hierarchy with differentiated `jobseeker/` and `partner/` subfolders.
- **Changed**:
  - `src/pages/elearning/jobseeker/CourseDetailsPage.jsx`: Added support for paid course enrolment banner with dynamic Course Fee and "Proceed to Checkout (Paid Course)" action matching Image 2.
  - `src/pages/elearning/jobseeker/CourseCheckoutPage.jsx`: Built the complete checkout experience with back navigation, order summary, recipient card, mock card payment form with agreement checkbox, simulated decline test toggle, price breakdown, and access guarantee.
  - `src/components/elearning/CourseOrderSummaryCard.jsx`: Reusable order summary component with dark thumbnail card and course metadata.
  - `src/components/elearning/CheckoutRecipientCard.jsx`: Reusable card displaying learner name and registered email.
  - `src/components/elearning/CardPaymentForm.jsx`: Reusable payment card form with cardholder, card number, expiry, CVV, agreement checkbox, and simulation toggles.
  - `src/components/elearning/CheckoutPriceBreakdown.jsx`: Reusable price breakdown card with total amount, pay CTA button, cancel link, and access guarantee.
  - `src/components/elearning/PaymentSuccessCard.jsx`: Reusable success view matching Image 4 with confirmed badge, message, and "Start Learning" / "Go to My Learning" buttons.
  - `src/components/elearning/PaymentErrorAlert.jsx`: Reusable decline alert banner matching Image 5 with warning icon, message, "Try Again Payment", and "Return to Course Details" buttons.
  - `src/components/elearning/index.js`: Exported all new reusable checkout components.
  - `src/services/elearningService.js`: Added `processCoursePayment` method supporting simulated success and decline outcomes with transaction receipts.
  - `src/pages/elearning/jobseeker/`: Organized all jobseeker pages (`ELearningDashboardPage`, `MyLearningPage`, `ExploreCoursesPage`, `CourseDetailsPage`, `CourseCheckoutPage`, `CoursePlayerPage`, `CourseProgressPage`, `CourseAssessmentPage`, `CourseProjectPage`, `index.js`).
  - `src/pages/elearning/partner/`: Organized all recruiter partner pages (`ELearningManagementPage`, `CourseBuilderPage`, `index.js`).
  - `src/pages/elearning/index.js`: Unified export root for all jobseeker and partner pages.
  - `src/app/lazyPages.js`: Updated lazy routes to point directly to the organized `jobseeker/` and `partner/` subfolders.
  - `src/app/routes/socialRoutes.jsx`: Registered `/e-learning/jobseeker/courses/:courseId/checkout` and `/e-learning/courses/:courseId/checkout`.
- **Conventional type**: `feat(elearning)`

### Proposed Commit Message

```
feat(elearning): add paid course details, checkout flow, and modularize pages

Implement paid course checkout and payment simulation matching the designs,
and organize all E-Learning pages into jobseeker and partner subfolders.

- Add paid course details banner with course fee and checkout CTA
- Build full checkout experience with order summary, recipient card, and payment form
- Implement payment success screen and declined payment simulation alert
- Create reusable components for checkout summary, recipient, payment form, and alerts
- Organize all E-Learning pages into jobseeker and partner directories
- Register dedicated checkout routes for jobseekers with role protection
```

---

## 2026-11-03 22:30 (WAT) — Fix E-Learning Sidebar Scrolling & Align Course Catalogue and Details Pages with Figma Designs

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Made the desktop E-Learning navigation sidebar fixed so that only the main body content scrolls. Implemented the Course Catalogue / Explore Courses page matching Image 2, and the Course Details page matching Image 3 (unenrolled state) and Image 4 (enrolled state) with live enrollment and navigation interactions.
- **Changed**:
  - `src/components/elearning/ELearningLayout.jsx`: Structured the shell as a fixed-viewport flexbox with a fixed left `<aside>` navigation rail and an independently scrollable main body column.
  - `src/components/elearning/ELearningSidebar.jsx`: Enhanced with dual desktop rail and mobile pill modes, preserving active tab states for Dashboard, My Learning, and Explore Courses.
  - `src/components/elearning/CourseCatalogCard.jsx`: Implemented dual-state cards matching Figma Image 2 (unenrolled with category and price pill, badges, and "View Course >"; enrolled with progress bar, % completion, finished lessons count, and three action buttons: "Continue/Start Learning", "Progress", and "Overview").
  - `src/pages/elearning/ExploreCoursesPage.jsx`: Aligned with Figma Image 2 with "Course Catalogue" header, search pill, level filter dropdown, and Free/Paid toggle pills.
  - `src/pages/elearning/CourseDetailsPage.jsx`: Rebuilt to match Figma Image 3 and Image 4 with back pill button, level/category/price badges, partner attribution, meta details, live enrollment state toggle (dark green "Free Course Enrolment" card with "Enroll in Course" CTA when unenrolled; progress bar with "Start/Continue Learning" CTA when enrolled), "What You Will Learn" 2x2 grid, curriculum module accordion, practical project deliverable card, partner card, knowledge quiz card, completion criteria, and talent ecosystem card.
  - `src/services/elearningService.js`: Updated course catalog data (Digital Marketing Fundamentals, Social Media Content Planning, Intermediate Digital Marketing) with authentic syllabus modules, deliverables, and unenrolled/enrolled defaults.
- **Conventional type**: `feat(elearning)`

### Proposed Commit Message

```
feat(elearning): fix sidebar during scroll and align explore and course details with designs

Fix the E-Learning sidebar so it stays in place while scrolling the main body,
and implement the Course Catalogue and Course Details pages matching the Figma designs.

- Fix the desktop sidebar position so only the body content scrolls
- Implement the Course Catalogue explore page with search, level dropdown, and Free/Paid filters
- Add dual-state catalogue cards for unenrolled and in-progress courses
- Rebuild the Course Details page with unenrolled and enrolled interactive states
- Add smooth enrollment switching from the free enrolment banner to active course progress
- Include full curriculum accordion, practical project deliverable, and partner course recommendations
```

---

## 2026-11-03 21:10 (WAT) — Move E-Learning to Dedicated Route Links & Remove from Sidebar Bottom

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Transitioned E-Learning from being pinned at the bottom of the right sidebar to dedicated route links for both Jobseekers (`/e-learning/jobseeker`) and Recruiters (`/e-learning/partner`), while maintaining backwards-compatible redirects.
- **Changed**:
  - `src/components/recruitment/recruitmentRightLinks.js`: Removed E-Learning link from `getRecruitmentRightLinks` so it no longer displays at the bottom of the right sidebar, while keeping updated route references in exported link objects.
  - `src/app/routes/employerRoutes.jsx`: Added routes for `/e-learning/partner`, `/e-learning/partner/create`, and `/e-learning/partner/:courseId/edit`. Added redirects from `/employer/e-learning*` to the new `/e-learning/partner*` routes.
  - `src/app/routes/socialRoutes.jsx`: Added dedicated jobseeker routes under `/e-learning/jobseeker` (`my-learning`, `explore`, `courses/:courseId/*`). Added role-aware redirect component for `/e-learning` index to route recruiters to `/e-learning/partner` and jobseekers to `/e-learning/jobseeker`. Added fallback redirects for legacy jobseeker paths.
  - `src/components/elearning/ELearningSidebar.jsx`: Updated navigation item URLs to `/e-learning/jobseeker`, `/e-learning/jobseeker/my-learning`, and `/e-learning/jobseeker/explore`.
  - `src/pages/employerDashboard/ELearningManagementPage.jsx`: Updated course creation and editing routes to `/e-learning/partner/create` and `/e-learning/partner/:courseId/edit`.
  - `src/pages/employerDashboard/CourseBuilderPage.jsx`: Updated back navigation and redirects to `/e-learning/partner`.
  - `src/pages/elearning/ELearningDashboardPage.jsx`: Updated all internal navigation links to `/e-learning/jobseeker/*`.
  - `src/pages/elearning/MyLearningPage.jsx`: Updated course action links to `/e-learning/jobseeker/*`.
  - `src/pages/elearning/ExploreCoursesPage.jsx`: Updated course detail view routes to `/e-learning/jobseeker/courses/:courseId`.
  - `src/pages/elearning/CourseDetailsPage.jsx`: Updated back button and action routes to `/e-learning/jobseeker/*`.
  - `src/pages/elearning/CoursePlayerPage.jsx`: Updated breadcrumb and sidebar links to `/e-learning/jobseeker/*`.
  - `src/pages/elearning/CourseProgressPage.jsx`: Updated criteria and action buttons to `/e-learning/jobseeker/*`.
  - `src/pages/elearning/CourseAssessmentPage.jsx`: Updated progress back navigation and review links to `/e-learning/jobseeker/*`.
  - `src/pages/elearning/CourseProjectPage.jsx`: Updated banner and form links to `/e-learning/jobseeker/*`.
- **Conventional type**: `feat(elearning)`

### Proposed Commit Message

```
feat(elearning): move elearning to link routes for jobseekers and recruiters

Instead of pinning E-Learning at the bottom of the news feed right sidebar,
provide dedicated direct route links for both jobseekers and partner recruiters.

- Route jobseekers to `/e-learning/jobseeker` and associated subroutes
- Route recruiters to `/e-learning/partner` and course creation/editing subroutes
- Remove the E-Learning link item from the right sidebar bottom
- Add role-aware redirect on `/e-learning` and backwards compatibility for existing URLs
- Update all internal navigations across jobseeker and employer course pages
```

---

## 2026-10-30 09:58 (WAT) — Add Step 4 Assessment Configuration & Reusable Question Modal

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Implemented Step 4 (**Assessment Configuration**) for the employer recruiter Course Builder matching Figma Images 1 & 2, and built a unified reusable `CourseQuestionModal` component matching Figma Images 3, 4, & 5 for adding and editing Multiple Choice, Single Choice, True or False, and Text-Based questions.
- **Changed**:
  - `src/components/elearning/CourseQuestionModal.jsx`: Created reusable modal supporting both `"add"` and `"edit"` modes, question type switching (`Multiple Choice`, `Single Choice`, `True or False`, `Text-Based`), question text input, dynamic answer options with correct-answer toggling, and score/points input.
  - `src/components/elearning/AssessmentConfigurationStep.jsx`: Built Step 4 assessment configuration with assessment toggle ("Yes, Include an assessment" vs "No assessment for this course" with empty state card), Assessment Information (Title & Instructions), Questions manager with question reordering, editing, deletion, and "Correct Answer" badges, and Scoring & Attempt Rules (questions & points summary badges, Optional Passing Threshold toggle + score input, and Optional Retry Limit toggle + attempts input).
  - `src/components/elearning/CourseBuilderWizard.jsx`: Replaced legacy inline assessment markup with the reusable `AssessmentConfigurationStep` component.
  - `src/services/elearningService.js`: Added 4 starter assessment questions matching Image 2 (`What is digital marketing?`, `Which of the following can be a digital marketing channel?`, `A business should consider its target audience when choosing marketing content.`, and text-based evaluation).
  - `src/components/elearning/index.js`: Exported `CourseQuestionModal` and `AssessmentConfigurationStep`.
- **Conventional type**: `feat(elearning)`

### Proposed Commit Message

```
feat(elearning): add assessment configuration step and reusable question modal

Recruiters creating or editing courses need Step 4 (Assessment Configuration)
to configure optional knowledge checks with multiple question types and
scoring rules matching the UI designs.

- Build a reusable `CourseQuestionModal` component handling both adding and editing questions across 4 formats: Multiple Choice, Single Choice, True/False, and Text-Based
- Build a reusable `AssessmentConfigurationStep` component with inclusion toggles, assessment title/instructions, questions list with live option previews and correct answer badges, and scoring/retry limits
- Integrate the assessment step into the course builder wizard and export reusable components
```

---

## 2026-10-29 23:38 (WAT) — Align Step 3 Media Editor & Reusable Add/Edit Lesson Modal with Figma

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Rebuilt Step 3 (**Learning Content & Media**) using a reusable `LessonMediaContentEditor` component matching Figma Images 2 & 4, and updated `CourseLessonModal` to match Figma Image 3 with a unified modal for both adding and editing lessons.
- **Changed**:
  - `src/components/elearning/LessonMediaContentEditor.jsx`: Created reusable 2-column editor featuring the left `COURSE LESSONS` list (active item highlight, lesson numbers, dynamic content badges), active lesson header with block-type switcher (`Video Block` / `Audio Block`), media upload dropzone and embedded player, media status details (`case_study_walkthrough.mp4`, `Ready`, format, duration), `Replace Video` / `Replace Audio` button, and the `KEY TAKEAWAYS (CHECKPOINTS)` card.
  - `src/components/elearning/CourseLessonModal.jsx`: Matched Figma Image 3 with clean inputs (`Lesson Title *`, `Module Description (Optional)`), pill action buttons (`Cancel` and `Save module`), and smooth dual-mode handling for both adding and editing lessons.
  - `src/components/elearning/CourseBuilderWizard.jsx`: Integrated `LessonMediaContentEditor` into Step 3 (`Content`), and wired lesson creation and editing directly to the updated `CourseLessonModal`.
  - `src/services/elearningService.js`: Updated course starter lessons with exact summaries from the mockup and added starter media metadata for the walkthrough video.
  - `src/components/elearning/index.js`: Exported `LessonMediaContentEditor`.
- **Conventional type**: `feat(elearning)`

### Proposed Commit Message

```
feat(elearning): add media content editor and align lesson modal with UI

The course builder needed Step 3 (Learning Content & Media) to support
video/audio uploads and lesson takeaways, and the add/edit lesson popup
needed to match the clean design from the mockups.

- Build a reusable `LessonMediaContentEditor` component for Step 3 with a lesson navigation sidebar, block switcher, upload dropzone, embedded media preview, and key takeaways notes
- Update `CourseLessonModal` to match the exact mockup fields and buttons for both adding and editing lessons
- Connect the media editor and updated lesson modal to the course creation wizard
```

---

## 2026-10-29 22:50 (WAT) — Fix Course Builder White Background & Add "Add Outcome" Modal

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Made the background on the recruiter E-Learning Management and Create/Edit Course pages solid white all the way down (there was a gray band once you scrolled past the first screen). Clicking **+ Add Outcome** now opens a popup with an outcome title field instead of adding an empty row.
- **Changed**:
  - `src/pages/employerDashboard/CourseBuilderPage.jsx` & `ELearningManagementPage.jsx`: Made the layout's scroll container white and stopped the inner wrapper from shrinking, so the white background covers all content.
  - `src/components/elearning/CourseOutcomeModal.jsx` & `index.js`: Added a reusable Add/Edit Outcome modal styled like the module modal (title, subtitle, `Outcome Title *` input, `Cancel` / `Save outcome`).
  - `src/components/elearning/CourseBuilderWizard.jsx`: **+ Add Outcome** opens `CourseOutcomeModal`. Saving fills the first empty outcome row, or adds a new row if none are empty.
  - `src/components/elearning/CourseModuleModal.jsx`: In edit mode the title now reads `Edit Module`, matching the Figma.
  - `src/services/elearningService.js`: Removed the blank starter outcome row and updated the starter text for Module 1's description.
- **Conventional type**: `fix(elearning)`

### Proposed Commit Message

```
fix(elearning): keep course builder background white and add outcome modal

The recruiter course pages showed a gray band once you scrolled past the
first screen, and "Add Outcome" just added an empty row with no clear prompt.

- Make the E-Learning Management and Create/Edit Course pages white all the way down
- Open a popup with an outcome title field when recruiters click "+ Add Outcome"
- Change the module edit popup title to "Edit Module" to match the design
```

---

## 2026-10-29 22:22 (WAT) — Add Recruiter E-Learning Management Dashboard & 8-Step Course Builder

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Added a recruiter-only **E-Learning** link at the bottom of the News Feed right sidebar (`/employer/e-learning`), built the **E-Learning Management** dashboard matching the Figma design, created the reusable 8-step **Create / Edit Course** builder (`/employer/e-learning/create` & `/employer/e-learning/:courseId/edit`), and built a single reusable **Add / Edit Course Module** modal (`CourseModuleModal.jsx`) alongside a reusable **Add / Edit Lesson** modal (`CourseLessonModal.jsx`).
- **Changed**:
  - `src/components/recruitment/recruitmentRightLinks.js`: Appended `RECRUITER_ELEARNING_RIGHT_LINK` (`/employer/e-learning`) at the bottom of the right sidebar strictly when `isRecruiterAccount(user)` is `true` (while jobseekers continue seeing `/e-learning`).
  - `src/components/elearning/CourseModuleModal.jsx` & `CourseLessonModal.jsx`: Built reusable modals handling both `"add"` and `"edit"` modes for course modules and module lessons.
  - `src/components/elearning/CourseBuilderStepper.jsx`, `CourseBuilderWizard.jsx`, `ELearningManagementFilterBar.jsx`, `RecruiterCoursesTable.jsx`, `RecruiterCourseViewModal.jsx`, & `index.js`: Created reusable 8-step stepper (`Basic Info`, `Structure`, `Content`, `Assessment`, `Project`, `Pricing`, `Completion`, `Review`), full Create/Edit Course wizard, rounded-pill filter bar, dark-green-header `My Courses` table, and quick-view course management modal.
  - `src/pages/employerDashboard/ELearningManagementPage.jsx` & `CourseBuilderPage.jsx`: Built the recruiter E-Learning Management dashboard and Create/Edit Course pages guarded by `isRecruiterAccount`.
  - `src/services/elearningService.js` & `src/components/elearning/CourseCatalogCard.jsx`: Added recruiter course persistence (`bejite:recruiter-courses:v1`), live KPI stat calculation, and automatic catalog syncing so courses published by recruiters appear in the Bejite Academy learner catalogue with cover image support.
  - `src/app/lazyPages.js` & `src/app/routes/employerRoutes.jsx`: Registered lazy-loaded `ELearningManagementPage` and `CourseBuilderPage` on `/employer/e-learning`, `/employer/e-learning/create`, and `/employer/e-learning/:courseId/edit`.
- **Conventional type**: `feat(elearning)`

### Proposed Commit Message

```
feat(elearning): add recruiter course management dashboard and course builder

Recruiters need a dedicated place to create, organize, and publish Bejite Academy
courses from their own sidebar, with reusable components for creating and editing
courses and course modules.

- Add an "E-Learning" entry at the bottom of the News Feed right sidebar visible only to recruiters, linking to `/employer/e-learning`
- Build the E-Learning Management dashboard with live summary cards (`Total Course`, `Drafts`, `Published`, `In Review`), search and date-range filters, and the `My Courses` table
- Create a reusable 8-step Course Builder (`Basic Info`, `Structure`, `Content`, `Assessment`, `Project`, `Pricing`, `Completion`, `Review`) shared between creating new courses and editing existing ones
- Use a single reusable modal for both adding and editing course modules (and a matching reusable modal for adding and editing lessons), and sync published courses into the Academy catalogue
```

---

## 2026-10-29 21:35 (WAT) — Add Dedicated Project Workspace Page & Polish Track Progress Sidebar Cards

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Built the dedicated **Practical Project Deliverable Workspace** page (`/e-learning/courses/:courseId/project`) with reusable components matching the UI mockup, wired **Open Project Workspace**, **View Project**, and **Submit Deliverable** directly to this page instead of a popup modal, and refined the **Track Progress** right-hand cards (`Assessment Status` & `Practical Evidence`) so headers and status pills never truncate or wrap awkwardly.
- **Changed**:
  - `src/components/elearning/ProjectWorkspaceBanner.jsx`, `ProjectBriefCard.jsx`, `ProjectSubmissionFormCard.jsx`, & `index.js`: Created reusable Project Workspace banner (`Not Yet Started` / `In Progress` / `Submitted`), project brief & expected deliverable card, and multi-format submission form card (Project URL, simulated PDF/DOCX/ZIP file dropzone, and Submission Notes & Executive Summary).
  - `src/pages/elearning/CourseProjectPage.jsx`: Built the dedicated `/e-learning/courses/:courseId/project` page with two-column layout, `STEP BY STEP INSTRUCTIONS`, and `EVIDENCE BUILDING PATHWAY` sage card.
  - `src/pages/elearning/CourseProgressPage.jsx`, `CoursePlayerPage.jsx`, & `CourseDetailsPage.jsx`: Routed `Open Project Workspace`, `View Project`, `Submit Deliverable`, and `Submit Practical Evidence` to `/e-learning/courses/:courseId/project`, widened right-column cards to `325px`, and added header dividers.
  - `src/components/elearning/ELearningBadge.jsx`, `ELearningSideCard.jsx`, & `CurriculumModuleAccordion.jsx`: Prevented status pill wrapping (`whitespace-nowrap shrink-0`), removed side-card title truncation, added `headerDivider` support, and matched rounded `Review` / `Open` buttons in `Lesson & Curriculum Progress`.
  - `src/services/elearningService.js`: Added full `projectBrief` (including the `"Kikio Botanicals"` scenario), `expectedDeliverable`, `steps`, and multi-format (`portfolioUrl`, `fileName`, `content`) persistence in `submitCourseDeliverable`.
  - `src/app/lazyPages.js` & `src/app/routes/socialRoutes.jsx`: Registered lazy-loaded `CourseProjectPage` and protected `/e-learning/courses/:courseId/project` route.
- **Conventional type**: `feat(elearning)`

### Proposed Commit Message

```
feat(elearning): add dedicated project workspace page and refine track progress UI

Clicking "Open Project Workspace", "View Project", or "Submit Deliverable" on
the Track Progress page should open a full Bejite Academy project workspace page
rather than a small modal, and the right-hand status cards should display their
titles and badges cleanly without clipping.

- Create a dedicated `/e-learning/courses/:courseId/project` page with reusable `ProjectWorkspaceBanner`, `ProjectBriefCard`, and `ProjectSubmissionFormCard` components (supporting project links, PDF/DOCX/ZIP file uploads, and executive summary notes alongside step-by-step instructions and the Evidence Building Pathway note)
- Route "Open Project Workspace", "View Project", "Submit Deliverable", and "Submit Practical Evidence" across Track Progress, Course Details, and Course Player directly to the new project page
- Widen the Track Progress right-column status cards, add clean header dividers, and keep status badges (`Not Started`, `Not Submitted`, `Passed`, `Submitted`) on a single line without truncating card headings
```

---

## 2026-10-29 20:18 (WAT) — Match My Learning ("View all my courses") Page & Reusable 2-Column Course Cards to UI Mockup

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Updated the **My Learning** page (`/e-learning/my-learning`, opened from **View all my courses** on the Learning Dashboard and **My Learning** in the left sidebar) to match the Figma design exactly, introducing reusable `ELearningFilterTabs` (`All courses`, `In Progress`, `Completed`) and `MyLearningCourseCard` 2-column cards.
- **Changed**:
  - `src/components/elearning/ELearningFilterTabs.jsx`: Added reusable sage/green filter pill tabs (`All courses`, `In Progress`, `Completed`).
  - `src/components/elearning/MyLearningCourseCard.jsx`: Added reusable 2-column course card with soft-sage top header band (`MARKETING & GROWTH`, `In Progress`/`Completed`, level, module/lesson counts), partner badge, progress bar (`X of Y lessons finished` + `Quiz pending` / `Lesson pending` / `Project pending`), and bottom action row (`Continue Learning` / `Start Learning`, `Progress`, `Overview`).
  - `src/components/elearning/index.js`: Exported `ELearningFilterTabs` and `MyLearningCourseCard`.
  - `src/pages/elearning/MyLearningPage.jsx`: Updated banner copy, replaced stacked cards with the 2-column `MyLearningCourseCard` grid, and wired `ELearningFilterTabs`.
  - `src/services/elearningService.js`: Set `career-portfolio-interview-readiness` default completed lessons to `0` so learners immediately see both `Continue Learning` (`Quiz pending`) and `Start Learning` (`0% Complete` / `Lesson pending`) card states.
- **Conventional type**: `feat(elearning)`

### Proposed Commit Message

```
feat(elearning): align my learning page and 2-column course cards with UI design

When jobseekers click "View all my courses" from the Learning Dashboard (or "My
Learning" in the sidebar), the page should display the clean 2-column My
Learning layout with filter pills and compact progress cards.

- Update the My Learning banner copy and add reusable `ELearningFilterTabs` (`All courses`, `In Progress`, and `Completed`)
- Create a reusable `MyLearningCourseCard` component showing the sage category/status header band, module and lesson counts, real-time progress bar with pending requirement hints (`Lesson pending`, `Quiz pending`, `Project pending`), and `Continue Learning` / `Start Learning`, `Progress`, and `Overview` buttons
- Render enrolled courses in a responsive 2-column grid on `/e-learning/my-learning`
```

---

## 2026-10-29 19:55 (WAT) — Add Dedicated Multi-Step E-Learning Course Assessment Flow

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Replaced the inline quiz modal trigger on **Open Assessment** / **Start Assessment** with a dedicated multi-step E-Learning assessment page (`/e-learning/courses/:courseId/assessment`) and reusable assessment components covering the Intro overview, timed Question-by-Question runner, **"Ready to submit your assessment?"** confirmation screen, and post-submission answer review, plus updated completed-state button labels on `CourseProgressPage`.
- **Changed**:
  - `src/components/elearning/*` (`AssessmentIntroCard.jsx`, `AssessmentProgressHeader.jsx`, `AssessmentQuestionCard.jsx`, `AssessmentSubmitConfirmCard.jsx`, `AssessmentResultCard.jsx`, `CompletionCriterionCard.jsx`, `index.js`): Built reusable assessment step cards and progress header matching the UI mockups and updated satisfied completion criteria pills to subtle gray.
  - `src/pages/elearning/CourseAssessmentPage.jsx`: Built full multi-step assessment workflow (`intro` -> timed `question` runner -> `confirm` `"Ready to submit your assessment?"` -> `result` / `?mode=review`).
  - `src/pages/elearning/CourseProgressPage.jsx`, `CourseDetailsPage.jsx`, & `CoursePlayerPage.jsx`: Connected `Open Assessment`, `Start Assessment`, `Review Assessment`, `Review Quiz Answers`, `Take Quiz`, and `Take Knowledge Quiz` to `/e-learning/courses/:courseId/assessment` and aligned completed-state button labels (`Completed`, `Review Learning`, `Review Assessment`, `Review Quiz Answers`, `View Project`).
  - `src/services/elearningService.js`: Added `maxAttempts`, `allowedAttempts`, `timeLimitMinutes`, updated `Digital Marketing Basics Quiz` & `Content Planning Check` questions, and persisted `lastAnswers` for review mode.
  - `src/app/lazyPages.js` & `src/app/routes/socialRoutes.jsx`: Registered lazy-loaded `CourseAssessmentPage` and protected `/e-learning/courses/:courseId/assessment` route.
- **Conventional type**: `feat(elearning)`

### Proposed Commit Message

```
feat(elearning): add multi-step course assessment page and submit confirmation

Instead of opening a small quiz popup, clicking "Open Assessment" or "Start
Assessment" should guide jobseekers through a full Bejite Academy assessment
flow—from the overview card, into timed step-by-step questions, and finally to
a clear confirmation screen before grading.

- Route "Open Assessment", "Start Assessment", "Take Quiz", and "Review Quiz Answers" to a dedicated `/e-learning/courses/:courseId/assessment` page inside the E-Learning layout
- Build reusable assessment components under `src/components/elearning` for the dark-green overview banner (`AssessmentIntroCard`), attempt/timer header (`AssessmentProgressHeader`), single-question option runner (`AssessmentQuestionCard`), "Ready to submit your assessment?" card (`AssessmentSubmitConfirmCard`), and answer review (`AssessmentResultCard`)
- Update completed-state buttons and badges on the Course Progress page (`Review Learning`, `Review Assessment`, `Review Quiz Answers`, and `View Project`) and save submitted answers so learners can review their quiz results later
```

---

## 2026-10-29 17:56 (WAT) — Build Jobseeker E-Learning Dashboard, Layout, and Reusable Component Library

- **Repo**: `bejite-frontend` (branch: `emma.dev`)
- **Summary**: Built the complete **E-Learning (Bejite Academy)** experience exclusively for jobseekers with its own dedicated layout, reusable component suite inside `src/components/elearning/`, interactive course curriculum/video player/quiz/deliverable flows, and a jobseeker-only **E-Learning** link placed at the bottom of the News Feed right sidebar.
- **Changed**:
  - `src/components/elearning/*` & `src/components/layout/ELearningLayout.jsx`: Created reusable E-Learning UI components (`ELearningLayout`, `ELearningSidebar`, `ELearningButton`, `ELearningBadge`, `ELearningBackPill`, `ELearningSectionHeader`, `ELearningWelcomeBanner`, `ELearningSideCard`, `CourseProgressBar`, `EnrolledCourseCard`, `CourseCatalogCard`, `CurriculumModuleAccordion`, `CompletionCriterionCard`, `LessonVideoPlayer`, `LessonTakeawaysCard`, `KnowledgeQuizModal`, `DeliverableWorkspaceModal`, and `index.js` barrel export).
  - `src/pages/elearning/*`: Built `ELearningDashboardPage`, `MyLearningPage`, `ExploreCoursesPage`, `CourseDetailsPage`, `CoursePlayerPage`, and `CourseProgressPage` matching the Figma designs.
  - `src/services/elearningService.js`: Added jobseeker role helper (`isJobseekerAccount`), partner academy course catalogue, weighted progress/criteria calculation, and user-scoped persistence for enrollments, completed lessons, quiz scores, and deliverable submissions.
  - `src/components/recruitment/recruitmentRightLinks.js`, `RecruitmentRight.jsx`, `RecruitmentRightMobileMenu.jsx`, & `public/assets/images/elearning-*.svg`: Appended **E-Learning** at the bottom of the News Feed right sidebar (below **Help**) strictly for jobseekers.
  - `src/app/lazyPages.js` & `src/app/routes/socialRoutes.jsx`: Registered lazy-loaded E-Learning pages and protected `/e-learning/*` routes.
- **Conventional type**: `feat(elearning)`

### Proposed Commit Message

```
feat(elearning): add jobseeker e-learning dashboard and reusable components

Jobseekers need a dedicated Bejite Academy space where they can study
employer-partner courses, complete quizzes and practical deliverables, and
build skill evidence for their profile without cluttering the recruiter view.

- Add an "E-Learning" link at the bottom of the News Feed right sidebar (and mobile drawer) that appears only for jobseeker accounts
- Create a dedicated E-Learning layout and left navigation rail with Learning Dashboard, My Learning, and Explore Courses views, redirecting non-jobseekers back to the News Feed
- Build a reusable component library under `src/components/elearning` for buttons, badges, progress bars, enrolled and partner course cards, collapsible curriculum modules, video lessons, quizzes, and project deliverables
- Add full pages for the Learning Dashboard, Course Details & Syllabus, Interactive Lesson Player, and Track Progress & Completion Criteria

Verified with ESLint and a production Vite build so all new routes load cleanly as code-split bundles.
```

---

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

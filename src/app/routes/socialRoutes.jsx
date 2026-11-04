import { Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ProtectedRoute from "../../components/ProtectedRoute.jsx";
import { getUser, mergeAuthUsers } from "../../utils/tokenManager.js";
import { isRecruiterAccount } from "../../services/accountDelegationService.js";
import {
  Recruitment,
  PostDetailPage,
  SharedPostRedirect,
  SharedJobRedirect,
  SharedAdRedirect,
  SharedPitchRedirect,
  PostPage,
  Chat,
  Connections,
  Birthdays,
  Notifications,
  ActivityLog,
  AccountSettings,
  AssignRecruiterSettings,
  BadgeStatus,
  BadgeHolder,
  BadgePaymentCallback,
  JobVacancyListing,
  PitchPage,
  ELearningDashboardPage,
  MyLearningPage,
  ExploreCoursesPage,
  CourseDetailsPage,
  CourseCheckoutPage,
  CoursePlayerPage,
  CourseProgressPage,
  CourseAssessmentPage,
  CourseProjectPage,
} from "../lazyPages.js";
import MessagesToChatsRedirect from "./MessagesToChatsRedirect.jsx";

const guard = (element, message, requiredRole = null) => (
  <ProtectedRoute redirectMessage={message} requiredRole={requiredRole}>
    {element}
  </ProtectedRoute>
);

function ELearningIndexRedirect() {
  const reduxUser = useSelector((state) => state.auth?.user);
  const localUser = getUser();
  const currentUser = mergeAuthUsers(localUser || {}, reduxUser || localUser || {});
  if (isRecruiterAccount(currentUser)) {
    return <Navigate to="/e-learning/partner" replace />;
  }
  return <Navigate to="/e-learning/jobseeker" replace />;
}

export const socialRoutes = (
  <>
    <Route path="/post-page" element={guard(<PostPage />, "Please log in to continue.")} />
    <Route path="/post/:postId" element={<PostDetailPage />} />
    <Route path="/p/:postId" element={<SharedPostRedirect />} />
    <Route path="/j/:jobId" element={<SharedJobRedirect />} />
    <Route path="/a/:campaignId" element={<SharedAdRedirect />} />
    <Route path="/v/:pitchId" element={<SharedPitchRedirect />} />
    <Route
      path="/news-feed"
      element={guard(<Recruitment />, "Please log in to view your feed.")}
    />
    <Route path="/pitch" element={guard(<PitchPage />, "Please log in to view pitches.")} />
    <Route path="/pitches" element={guard(<PitchPage />, "Please log in to view pitches.")} />
    <Route path="/badge" element={guard(<BadgeStatus />, "Please log in.")} />
    <Route
      path="/badge/payment-callback"
      element={guard(<BadgePaymentCallback />, "Please log in.")}
    />
    <Route
      path="/activity-logs"
      element={guard(<ActivityLog />, "Please log in to view activity.")}
    />
    <Route
      path="/account-settings"
      element={guard(<AccountSettings />, "Please log in to manage your account.")}
    />
    <Route
      path="/account-settings/assign-recruiter"
      element={guard(
        <AssignRecruiterSettings />,
        "Only recruiters can assign account access.",
        "recruiter"
      )}
    />
    <Route
      path="/badge-holder"
      element={guard(<BadgeHolder />, "Please log in.")}
    />
    <Route path="/job-vacancy" element={<JobVacancyListing />} />
    <Route path="/chats" element={guard(<Chat />, "Please log in to view chats.")} />
    <Route path="/messages" element={<MessagesToChatsRedirect />} />
    <Route
      path="/connection"
      element={guard(<Connections />, "Please log in to view connections.")}
    />
    <Route
      path="/milestones"
      element={guard(<Birthdays />, "Please log in.")}
    />
    <Route
      path="/notification"
      element={guard(<Notifications />, "Please log in.")}
    />
    <Route
      path="/notifications"
      element={guard(<Notifications />, "Please log in.")}
    />
    {/* Base E-Learning Index Redirect (role-aware: recruiter -> /e-learning/partner, jobseeker -> /e-learning/jobseeker) */}
    <Route
      path="/e-learning"
      element={guard(<ELearningIndexRedirect />, "Please log in to access E-Learning.")}
    />

    {/* Jobseeker E-Learning Dedicated Link Routes */}
    <Route
      path="/e-learning/jobseeker"
      element={guard(<ELearningDashboardPage />, "Please log in to access E-Learning.")}
    />
    <Route
      path="/e-learning/jobseeker/my-learning"
      element={guard(<MyLearningPage />, "Please log in to access E-Learning.")}
    />
    <Route
      path="/e-learning/jobseeker/explore"
      element={guard(<ExploreCoursesPage />, "Please log in to access E-Learning.")}
    />
    <Route
      path="/e-learning/jobseeker/courses/:courseId"
      element={guard(<CourseDetailsPage />, "Please log in to access E-Learning.")}
    />
    <Route
      path="/e-learning/jobseeker/courses/:courseId/checkout"
      element={guard(<CourseCheckoutPage />, "Please log in to access E-Learning.")}
    />
    <Route
      path="/e-learning/jobseeker/courses/:courseId/learn"
      element={guard(<CoursePlayerPage />, "Please log in to access E-Learning.")}
    />
    <Route
      path="/e-learning/jobseeker/courses/:courseId/progress"
      element={guard(<CourseProgressPage />, "Please log in to access E-Learning.")}
    />
    <Route
      path="/e-learning/jobseeker/courses/:courseId/assessment"
      element={guard(<CourseAssessmentPage />, "Please log in to access E-Learning.")}
    />
    <Route
      path="/e-learning/jobseeker/courses/:courseId/project"
      element={guard(<CourseProjectPage />, "Please log in to access E-Learning.")}
    />

    {/* Jobseeker E-Learning Alias & Fallback Subroutes */}
    <Route
      path="/e-learning/my-learning"
      element={<Navigate to="/e-learning/jobseeker/my-learning" replace />}
    />
    <Route
      path="/e-learning/explore"
      element={<Navigate to="/e-learning/jobseeker/explore" replace />}
    />
    <Route
      path="/e-learning/courses/:courseId"
      element={guard(<CourseDetailsPage />, "Please log in to access E-Learning.")}
    />
    <Route
      path="/e-learning/courses/:courseId/checkout"
      element={guard(<CourseCheckoutPage />, "Please log in to access E-Learning.")}
    />
    <Route
      path="/e-learning/courses/:courseId/learn"
      element={guard(<CoursePlayerPage />, "Please log in to access E-Learning.")}
    />
    <Route
      path="/e-learning/courses/:courseId/progress"
      element={guard(<CourseProgressPage />, "Please log in to access E-Learning.")}
    />
    <Route
      path="/e-learning/courses/:courseId/assessment"
      element={guard(<CourseAssessmentPage />, "Please log in to access E-Learning.")}
    />
    <Route
      path="/e-learning/courses/:courseId/project"
      element={guard(<CourseProjectPage />, "Please log in to access E-Learning.")}
    />
  </>
);

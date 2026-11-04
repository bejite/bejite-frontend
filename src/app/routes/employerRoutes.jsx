import { Route, Navigate, useParams } from "react-router-dom";
import ProtectedRoute from "../../components/ProtectedRoute.jsx";
import {
  CandidateSearchPage,
  CreateJob,
  EmployerDashboard,
  BulkCreateJobs,
  ExtendJob,
  JobExtendCallback,
  JobApplications,
  RecruitWithASE,
  RepostJob,
  EditJob,
  RecruitmentManagement,
  ELearningManagementPage,
  CourseBuilderPage,
  PartnerCourseDetailsPage,
} from "../lazyPages.js";

const LegacyCourseEditRedirect = () => {
  const { courseId } = useParams();
  return <Navigate to={`/e-learning/partner/${courseId}/edit`} replace />;
};

const LegacyCourseDetailsRedirect = () => {
  const { courseId } = useParams();
  return <Navigate to={`/e-learning/partner/${courseId}`} replace />;
};

const guard = (element, message, requiredRole = "recruiter") => (
  <ProtectedRoute
    redirectMessage={message}
    requiredRole={requiredRole}
  >
    {element}
  </ProtectedRoute>
);

export const employerRoutes = (
  <>
      <Route
        path="/candidate-search-page"
        element={guard(
          <CandidateSearchPage />,
          "Your session has expired. Please log in again.",
        )}
      />
      <Route
        path="/employer/recruitment-management"
        element={guard(
          <RecruitmentManagement />,
          "Your session has expired. Please log in again.",
        )}
      />
      <Route
        path="/employer/recruitment-management/:id"
        element={guard(
          <RecruitmentManagement />,
          "Your session has expired. Please log in again.",
        )}
      />
      {/* Partner E-Learning Routes */}
      <Route
        path="/e-learning/partner"
        element={guard(
          <ELearningManagementPage />,
          "Please log in as a recruiter.",
        )}
      />
      <Route
        path="/e-learning/partner/create"
        element={guard(
          <CourseBuilderPage />,
          "Please log in as a recruiter.",
        )}
      />
      <Route
        path="/e-learning/partner/:courseId/edit"
        element={guard(
          <CourseBuilderPage />,
          "Please log in as a recruiter.",
        )}
      />
      <Route
        path="/e-learning/partner/:courseId"
        element={guard(
          <PartnerCourseDetailsPage />,
          "Please log in as a recruiter.",
        )}
      />
      <Route
        path="/e-learning/partner/courses/:courseId"
        element={guard(
          <PartnerCourseDetailsPage />,
          "Please log in as a recruiter.",
        )}
      />
      {/* Legacy Redirects for Partner E-Learning */}
      <Route
        path="/employer/e-learning"
        element={<Navigate to="/e-learning/partner" replace />}
      />
      <Route
        path="/employer/e-learning/create"
        element={<Navigate to="/e-learning/partner/create" replace />}
      />
      <Route
        path="/employer/e-learning/:courseId/edit"
        element={<LegacyCourseEditRedirect />}
      />
      <Route
        path="/employer/e-learning/:courseId"
        element={<LegacyCourseDetailsRedirect />}
      />
      <Route
        path="/employer/create-job"
        element={guard(<CreateJob />, "Please log in as a recruiter.")}
      />
      <Route
        path="/employer/dashboard"
        element={guard(<EmployerDashboard />, "Please log in as a recruiter.")}
      />
      <Route
        path="/employer/bulk-create"
        element={guard(<BulkCreateJobs />, "Please log in as a recruiter.")}
      />
      <Route
        path="/employer/extend/callback"
        element={guard(<JobExtendCallback />, "Please log in as a recruiter.")}
      />
      <Route
        path="/employer/job/:id/extend"
        element={guard(<ExtendJob />, "Please log in as a recruiter.")}
      />
      <Route
        path="/employer/job/:id/applications"
        element={guard(<JobApplications />, "Please log in as a recruiter.")}
      />
      <Route
        path="/employer/job/:id/recruit"
        element={guard(<RecruitWithASE />, "Please log in as a recruiter.")}
      />
      <Route
        path="/employer/job/:id/repost"
        element={guard(<RepostJob />, "Please log in as a recruiter.")}
      />
      <Route
        path="/employer/job/:id/edit"
        element={guard(<EditJob />, "Please log in as a recruiter.")}
      />
  </>
);

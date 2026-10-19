import { Route } from "react-router-dom";
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
} from "../lazyPages.js";

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

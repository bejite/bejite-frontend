import { Route } from "react-router-dom";
import ProtectedRoute from "../../components/ProtectedRoute.jsx";
import {
  JobConnection,
  JobSeekerOpt,
  Resume,
  Bio,
  Education,
  Skills,
  WorkHistory,
  Certificate,
  Link,
  JobType,
  SaveProgress,
  EmployerOpt,
  ResumeLayout,
} from "../lazyPages.js";

export const onboardingRoutes = (
  <>
      <Route path="/jobseeker-option" element={<JobSeekerOpt />} />
      <Route path="/employer-option" element={<EmployerOpt />} />
      <Route path="/jobconnection" element={<JobConnection />} />
      <Route path="/resume" element={<Resume />} />
      <Route path="/save-progress" element={<SaveProgress />} />

      <Route
        element={
          <ProtectedRoute>
            <ResumeLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/bio" element={<Bio />} />
        <Route path="/education" element={<Education />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/job-type" element={<JobType />} />
        <Route path="/work-history" element={<WorkHistory />} />
        <Route path="/certificate" element={<Certificate />} />
        <Route path="/links" element={<Link />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <ResumeLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/edit-profile/bio" element={<Bio />} />
        <Route path="/edit-profile/education" element={<Education />} />
        <Route path="/edit-profile/skills" element={<Skills />} />
        <Route path="/edit-profile/work-history" element={<WorkHistory />} />
        <Route path="/edit-profile/certificate" element={<Certificate />} />
        <Route path="/edit-profile/links" element={<Link />} />
        <Route path="/edit-profile/job-type" element={<JobType />} />
      </Route>
  </>
);

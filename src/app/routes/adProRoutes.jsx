import { Navigate, Route } from "react-router-dom";
import ProtectedRoute from "../../components/ProtectedRoute.jsx";
import {
  AdProDashboard,
  CampaignReports,
  CampaignDetails,
  CreateCampaign,
  EditCampaign,
  EditCampaignAudience,
} from "../lazyPages.js";

const guard = (element) => (
  <ProtectedRoute
    redirectMessage="Please log in as a recruiter to use AdPro."
    requiredRole="recruiter"
  >
    {element}
  </ProtectedRoute>
);

export const adProRoutes = (
  <>
      <Route path="/adpro" element={guard(<AdProDashboard />)} />
      <Route path="/ad-pro-dashboard" element={<Navigate to="/adpro" replace />} />
      <Route path="/adpro/campaign/:id" element={guard(<CampaignDetails />)} />
      <Route path="/adpro/campaign/:id/reports" element={guard(<CampaignReports />)} />
      <Route path="/adpro/create" element={guard(<CreateCampaign />)} />
      <Route path="/adpro/campaign/:id/edit" element={guard(<EditCampaign />)} />
      <Route
        path="/adpro/campaign/:id/edit-audience"
        element={guard(<EditCampaignAudience />)}
      />
  </>
);
